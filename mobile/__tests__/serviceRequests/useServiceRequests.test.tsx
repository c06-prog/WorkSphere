/**
 * Phase 16B: useServiceRequests Hook Tests
 * Rigorous tests covering:
 * - Base queries, pagination, and retry
 * - Search debouncing with fake timers (299ms vs 300ms, trims, resets)
 * - Query race conditions with deferred promises (latest-query-wins)
 * - Stale failure rejection
 * - Stale append rejection
 * - Deduplication preserving backend order
 * - Refresh success and error retention
 * - Same-tick duplicate loadMore locking
 * - Category filter integration
 */

import { renderHook, act } from '@testing-library/react-native';
import {
  useServiceRequests,
  DEFAULT_SORT,
  PAGE_SIZE,
} from '../../src/features/serviceRequests/hooks/useServiceRequests';
import { serviceRequestApi } from '../../src/features/serviceRequests/api/serviceRequestApi';
import { PagedData } from '../../src/shared/api';
import {
  ServiceCategoryResponse,
  ServiceRequestSummaryResponse,
} from '../../src/features/serviceRequests/types/serviceRequestTypes';

jest.mock('../../src/features/serviceRequests/api/serviceRequestApi');

describe('useServiceRequests Custom Hook', () => {
  const mockItemA: ServiceRequestSummaryResponse = {
    id: '11111111-1111-1111-1111-111111111111',
    requestNumber: 'SR-2026-000001',
    categoryId: 'cat-1',
    categoryName: 'Thiết bị văn phòng',
    requesterId: 'user-1',
    requesterName: 'Nguyễn Văn A',
    assigneeId: 'user-2',
    assigneeName: 'Trần Văn B',
    title: 'Hỏng điều hòa phòng họp A',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: null,
  };

  const mockItemB: ServiceRequestSummaryResponse = {
    id: '22222222-2222-2222-2222-222222222222',
    requestNumber: 'SR-2026-000002',
    categoryId: 'cat-2',
    categoryName: 'Mạng & Phần mềm',
    requesterId: 'user-3',
    requesterName: 'Lê Văn C',
    assigneeId: null,
    assigneeName: null,
    title: 'Cần cài đặt phần mềm kế toán',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-21T08:00:00Z',
    updatedAt: null,
  };

  const mockItemBUpdated: ServiceRequestSummaryResponse = {
    ...mockItemB,
    title: 'Cần cài đặt phần mềm kế toán (Đã cập nhật)',
    status: 'RESOLVED',
  };

  const mockItemC: ServiceRequestSummaryResponse = {
    id: '33333333-3333-3333-3333-333333333333',
    requestNumber: 'SR-2026-000003',
    categoryId: 'cat-1',
    categoryName: 'Thiết bị văn phòng',
    requesterId: 'user-1',
    requesterName: 'Nguyễn Văn A',
    assigneeId: 'user-4',
    assigneeName: 'Hoàng Văn D',
    title: 'Máy in hết mực',
    priority: 'LOW',
    status: 'ASSIGNED',
    createdAt: '2026-10-22T09:00:00Z',
    updatedAt: null,
  };

  const page0Data: PagedData<ServiceRequestSummaryResponse> = {
    items: [mockItemA],
    page: 0,
    size: PAGE_SIZE,
    totalItems: 2,
    totalPages: 2,
    hasNext: true,
    hasPrevious: false,
  };

  const page1Data: PagedData<ServiceRequestSummaryResponse> = {
    items: [mockItemB],
    page: 1,
    size: PAGE_SIZE,
    totalItems: 2,
    totalPages: 2,
    hasNext: false,
    hasPrevious: true,
  };

  const mockCategories: ServiceCategoryResponse[] = [
    {
      id: 'cat-1',
      parentId: null,
      code: 'OFFICE_EQUIPMENT',
      name: 'Thiết bị văn phòng',
      description: null,
      defaultPriority: 'MEDIUM',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: null,
      version: 1,
    },
    {
      id: 'cat-2',
      parentId: null,
      code: 'IT_SUPPORT',
      name: 'Mạng & Phần mềm',
      description: null,
      defaultPriority: 'HIGH',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: null,
      version: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (serviceRequestApi.listCategories as jest.Mock).mockResolvedValue(mockCategories);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('1. Base Queries & Pagination', () => {
    it('issues exact initial query on mount (page=0, size=20, sort=createdAt,desc)', async () => {
      let resolvePromise!: (val: PagedData<ServiceRequestSummaryResponse>) => void;
      const pendingPromise = new Promise<PagedData<ServiceRequestSummaryResponse>>(resolve => {
        resolvePromise = resolve;
      });
      (serviceRequestApi.listServiceRequests as jest.Mock).mockReturnValueOnce(pendingPromise);

      const { result } = await renderHook(() => useServiceRequests());

      expect(result.current.initialLoading).toBe(true);

      await act(async () => {
        resolvePromise(page0Data);
        await pendingPromise;
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledWith({
        page: 0,
        size: PAGE_SIZE,
        sort: DEFAULT_SORT,
        search: undefined,
        status: undefined,
        priority: undefined,
        categoryId: undefined,
      });

      expect(result.current.initialLoading).toBe(false);
      expect(result.current.requests).toEqual([mockItemA]);
      expect(result.current.totalItems).toBe(2);
      expect(result.current.page).toBe(0);
      expect(result.current.hasNext).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.categories).toEqual(mockCategories);
    });

    it('sets presentation error on initial query failure and recovers on retry', async () => {
      let rejectPromise!: (err: unknown) => void;
      const pendingPromise = new Promise<PagedData<ServiceRequestSummaryResponse>>((_, reject) => {
        rejectPromise = reject;
      });
      (serviceRequestApi.listServiceRequests as jest.Mock).mockReturnValueOnce(pendingPromise);

      const { result } = await renderHook(() => useServiceRequests());

      expect(result.current.initialLoading).toBe(true);

      await act(async () => {
        rejectPromise({
          isAxiosError: true,
          response: {
            status: 403,
            data: { code: 'FORBIDDEN', message: 'Không có quyền truy cập.' },
          },
        });
        try {
          await pendingPromise;
        } catch {
          // Expected
        }
      });

      expect(result.current.initialLoading).toBe(false);
      expect(result.current.requests).toEqual([]);
      expect(result.current.error).not.toBeNull();

      // Retry initial
      (serviceRequestApi.listServiceRequests as jest.Mock).mockResolvedValueOnce(page0Data);

      await act(async () => {
        await result.current.loadInitial();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.requests).toEqual([mockItemA]);
    });

    it('appends next page on loadMore and marks hasNext false when exhausted', async () => {
      (serviceRequestApi.listServiceRequests as jest.Mock)
        .mockResolvedValueOnce(page0Data)
        .mockResolvedValueOnce(page1Data);

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(result.current.requests).toEqual([mockItemA]);
      expect(result.current.hasNext).toBe(true);

      await act(async () => {
        await result.current.loadMore();
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(2);
      expect(serviceRequestApi.listServiceRequests).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1 })
      );

      expect(result.current.requests).toEqual([mockItemA, mockItemB]);
      expect(result.current.page).toBe(1);
      expect(result.current.hasNext).toBe(false);

      // Calling loadMore again when hasNext is false issues no request
      await act(async () => {
        await result.current.loadMore();
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(2);
    });

    it('locks same-tick duplicate loadMore calls issuing only 1 API call', async () => {
      let resolveAppend!: (val: PagedData<ServiceRequestSummaryResponse>) => void;
      const appendPromise = new Promise<PagedData<ServiceRequestSummaryResponse>>(resolve => {
        resolveAppend = resolve;
      });

      (serviceRequestApi.listServiceRequests as jest.Mock)
        .mockResolvedValueOnce(page0Data)
        .mockReturnValueOnce(appendPromise);

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      // Fire two loadMore calls simultaneously
      await act(async () => {
        result.current.loadMore();
        result.current.loadMore();
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(2); // Initial (1) + loadMore (1)

      await act(async () => {
        resolveAppend(page1Data);
        await Promise.resolve();
      });

      expect(result.current.requests).toEqual([mockItemA, mockItemB]);
    });

    it('preserves existing requests and sets paginationError when page N>0 fails, then recovers on retry', async () => {
      (serviceRequestApi.listServiceRequests as jest.Mock)
        .mockResolvedValueOnce(page0Data)
        .mockRejectedValueOnce(new Error('Network error on page 1'))
        .mockResolvedValueOnce(page1Data);

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      await act(async () => {
        await result.current.loadMore();
      });

      // Requests preserved
      expect(result.current.requests).toEqual([mockItemA]);
      expect(result.current.paginationError).not.toBeNull();
      expect(result.current.loadingMore).toBe(false);

      // Retry pagination
      await act(async () => {
        await result.current.retryPagination();
      });

      expect(result.current.paginationError).toBeNull();
      expect(result.current.requests).toEqual([mockItemA, mockItemB]);
    });

    it('pull-to-refresh preserves existing requests during refresh and replaces on success', async () => {
      const refreshedPage0: PagedData<ServiceRequestSummaryResponse> = {
        ...page0Data,
        items: [mockItemC],
      };

      (serviceRequestApi.listServiceRequests as jest.Mock)
        .mockResolvedValueOnce(page0Data)
        .mockResolvedValueOnce(refreshedPage0);

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(result.current.requests).toEqual([mockItemA]);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.requests).toEqual([mockItemC]);
      expect(result.current.refreshError).toBeNull();
      expect(result.current.refreshing).toBe(false);
    });

    it('pull-to-refresh preserves existing requests when refresh fails', async () => {
      (serviceRequestApi.listServiceRequests as jest.Mock)
        .mockResolvedValueOnce(page0Data)
        .mockRejectedValueOnce(new Error('Server error on refresh'));

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(result.current.requests).toEqual([mockItemA]);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.requests).toEqual([mockItemA]);
      expect(result.current.refreshError).not.toBeNull();
      expect(result.current.refreshing).toBe(false);
    });
  });

  describe('2. Search Debouncing with Fake Timers', () => {
    it('does not issue search request at 299ms, but issues request at 300ms', async () => {
      (serviceRequestApi.listServiceRequests as jest.Mock).mockResolvedValue(page0Data);

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(1);

      // User types 'điều hòa'
      await act(async () => {
        result.current.setSearch('điều hòa');
        jest.advanceTimersByTime(0);
      });

      expect(result.current.search).toBe('điều hòa');

      // Fast-forward 299ms
      await act(async () => {
        jest.advanceTimersByTime(299);
        await Promise.resolve();
      });

      // Still only initial call
      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(1);

      // Fast-forward remaining 1ms (total 300ms)
      await act(async () => {
        jest.advanceTimersByTime(1);
        await Promise.resolve();
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(2);
      expect(serviceRequestApi.listServiceRequests).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 0,
          size: PAGE_SIZE,
          sort: DEFAULT_SORT,
          search: 'điều hòa',
        })
      );
    });

    it('trims outer whitespace, preserves internal spaces, and omits whitespace-only searches', async () => {
      (serviceRequestApi.listServiceRequests as jest.Mock).mockResolvedValue(page0Data);

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      // Search with outer whitespace & internal space: '  Mạng   Nội Bộ  '
      await act(async () => {
        result.current.setSearch('  Mạng   Nội Bộ  ');
        jest.advanceTimersByTime(300);
        await Promise.resolve();
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'Mạng   Nội Bộ',
        })
      );

      // Search with only whitespace
      await act(async () => {
        result.current.setSearch('     ');
        jest.advanceTimersByTime(300);
        await Promise.resolve();
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: undefined,
        })
      );
    });

    it('resets timer on rapid consecutive keystrokes and only issues single query for final input', async () => {
      (serviceRequestApi.listServiceRequests as jest.Mock).mockResolvedValue(page0Data);

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.setSearch('First');
        jest.advanceTimersByTime(150);
        result.current.setSearch('Second');
        jest.advanceTimersByTime(150);
      });

      // Total 300ms since 'First', but only 150ms since 'Second'
      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(1);

      await act(async () => {
        jest.advanceTimersByTime(150);
        await Promise.resolve();
      });

      // Called with 'Second', never with 'First'
      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(2);
      expect(serviceRequestApi.listServiceRequests).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'Second',
        })
      );
    });

    it('cleans up debounce timer on unmount', async () => {
      (serviceRequestApi.listServiceRequests as jest.Mock).mockResolvedValue(page0Data);

      const { result, unmount } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      await act(async () => {
        result.current.setSearch('Unmounting');
      });

      await act(async () => {
        unmount();
        jest.advanceTimersByTime(350);
      });

      // No second request after unmount
      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. Concurrency & Latest-Query-Wins', () => {
    it('query race condition: Query B resolving first supersedes slower Query A', async () => {
      let resolveA!: (val: PagedData<ServiceRequestSummaryResponse>) => void;
      const promiseA = new Promise<PagedData<ServiceRequestSummaryResponse>>(resolve => {
        resolveA = resolve;
      });

      let resolveB!: (val: PagedData<ServiceRequestSummaryResponse>) => void;
      const promiseB = new Promise<PagedData<ServiceRequestSummaryResponse>>(resolve => {
        resolveB = resolve;
      });

      (serviceRequestApi.listServiceRequests as jest.Mock).mockImplementation(
        (params: { status?: string }) => {
          if (params?.status === 'OPEN') {
            return promiseA;
          }
          if (params?.status === 'IN_PROGRESS') {
            return promiseB;
          }
          return Promise.resolve(page0Data);
        }
      );

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(1);

      // Start Query A by changing status filter to OPEN
      await act(async () => {
        result.current.setStatusFilter('OPEN');
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      // Start Query B by changing status filter to IN_PROGRESS
      await act(async () => {
        result.current.setStatusFilter('IN_PROGRESS');
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(serviceRequestApi.listServiceRequests).toHaveBeenCalledTimes(3);

      // Resolve B first
      await act(async () => {
        resolveB({
          ...page0Data,
          items: [mockItemB],
        });
        await promiseB;
      });

      expect(result.current.requests).toEqual([mockItemB]);

      // Resolve A later
      await act(async () => {
        resolveA({
          ...page0Data,
          items: [mockItemA],
        });
        await promiseA;
      });

      // Stale Query A must NOT overwrite Query B!
      expect(result.current.requests).toEqual([mockItemB]);
    });

    it('stale failure: old Query A rejecting does not overwrite successful Query B', async () => {
      let rejectA!: (err: unknown) => void;
      const promiseA = new Promise<PagedData<ServiceRequestSummaryResponse>>((_, reject) => {
        rejectA = reject;
      });

      const dataB: PagedData<ServiceRequestSummaryResponse> = {
        ...page0Data,
        items: [mockItemB],
      };

      (serviceRequestApi.listServiceRequests as jest.Mock).mockImplementation(
        (params: { status?: string }) => {
          if (params?.status === 'OPEN') {
            return promiseA;
          }
          if (params?.status === 'IN_PROGRESS') {
            return Promise.resolve(dataB);
          }
          return Promise.resolve(page0Data);
        }
      );

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      // Start Query A (will be rejected later)
      await act(async () => {
        result.current.setStatusFilter('OPEN');
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      // Start Query B (resolves successfully)
      await act(async () => {
        result.current.setStatusFilter('IN_PROGRESS');
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(result.current.requests).toEqual([mockItemB]);
      expect(result.current.error).toBeNull();

      // Query A rejects now
      await act(async () => {
        rejectA(new Error('Old Query A failed'));
        try {
          await promiseA;
        } catch {
          // Expected
        }
        await Promise.resolve();
      });

      // B is retained, no error banner
      expect(result.current.requests).toEqual([mockItemB]);
      expect(result.current.error).toBeNull();
    });

    it('stale append: page 1 of Query A resolving after Query B is discarded', async () => {
      let resolveAppendA!: (val: PagedData<ServiceRequestSummaryResponse>) => void;
      const appendPromiseA = new Promise<PagedData<ServiceRequestSummaryResponse>>(resolve => {
        resolveAppendA = resolve;
      });

      const dataB: PagedData<ServiceRequestSummaryResponse> = {
        ...page0Data,
        items: [mockItemC],
      };

      (serviceRequestApi.listServiceRequests as jest.Mock).mockImplementation(
        (params: { page: number; status?: string }) => {
          if (params.page === 1) {
            return appendPromiseA;
          }
          if (params.status === 'IN_PROGRESS') {
            return Promise.resolve(dataB);
          }
          return Promise.resolve(page0Data);
        }
      );

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(result.current.requests).toEqual([mockItemA]);

      // Trigger loadMore on Query A
      await act(async () => {
        result.current.loadMore();
      });

      // Before append resolves, user switches status to IN_PROGRESS (Query B)
      await act(async () => {
        result.current.setStatusFilter('IN_PROGRESS');
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(result.current.requests).toEqual([mockItemC]);

      // Now old Query A page 1 resolves
      await act(async () => {
        resolveAppendA(page1Data);
        await Promise.resolve();
      });

      // Stale page 1 must NOT be merged into Query B results
      expect(result.current.requests).toEqual([mockItemC]);
    });

    it('deduplication: merges pages and updates existing items by id while preserving order', async () => {
      const page0: PagedData<ServiceRequestSummaryResponse> = {
        items: [mockItemA, mockItemB],
        page: 0,
        size: 20,
        totalItems: 3,
        totalPages: 2,
        hasNext: true,
        hasPrevious: false,
      };

      const page1: PagedData<ServiceRequestSummaryResponse> = {
        items: [mockItemBUpdated, mockItemC],
        page: 1,
        size: 20,
        totalItems: 3,
        totalPages: 2,
        hasNext: false,
        hasPrevious: true,
      };

      (serviceRequestApi.listServiceRequests as jest.Mock)
        .mockResolvedValueOnce(page0)
        .mockResolvedValueOnce(page1);

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(result.current.requests).toEqual([mockItemA, mockItemB]);

      await act(async () => {
        await result.current.loadMore();
      });

      // Deduplicated: mockItemB is updated in place, mockItemC is appended
      expect(result.current.requests).toEqual([mockItemA, mockItemBUpdated, mockItemC]);
    });
  });

  describe('4. Filters & Reset', () => {
    it('updates priority, category, status and clears filters properly', async () => {
      (serviceRequestApi.listServiceRequests as jest.Mock).mockResolvedValue(page0Data);

      const { result } = await renderHook(() => useServiceRequests());

      await act(async () => {
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      await act(async () => {
        result.current.setPriorityFilter('CRITICAL');
        result.current.setStatusFilter('OPEN');
        result.current.setCategoryFilter('cat-1');
        result.current.setSearch('Điều hòa');
      });

      expect(result.current.priorityFilter).toBe('CRITICAL');
      expect(result.current.statusFilter).toBe('OPEN');
      expect(result.current.categoryFilter).toBe('cat-1');
      expect(result.current.search).toBe('Điều hòa');

      await act(async () => {
        result.current.clearFilters();
        jest.advanceTimersByTime(0);
        await Promise.resolve();
      });

      expect(result.current.priorityFilter).toBeUndefined();
      expect(result.current.statusFilter).toBeUndefined();
      expect(result.current.categoryFilter).toBeUndefined();
      expect(result.current.search).toBe('');
    });
  });
});
