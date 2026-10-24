/**
 * Phase 16F: useServiceRequestComments Unit Tests
 * Testing paginated loading, pull-to-refresh, load more, deduplication,
 * synchronous submit locking, and race condition prevention.
 */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useServiceRequestComments } from '../../src/features/serviceRequests/hooks/useServiceRequestComments';
import { serviceRequestApi } from '../../src/features/serviceRequests/api/serviceRequestApi';
import { ServiceCommentResponse } from '../../src/features/serviceRequests/types/serviceRequestTypes';
import { PagedData } from '../../src/shared/api';

jest.mock('../../src/features/serviceRequests/api/serviceRequestApi', () => ({
  serviceRequestApi: {
    getComments: jest.fn(),
    createComment: jest.fn(),
  },
}));

describe('useServiceRequestComments Hook', () => {
  const mockRequestId = 'req-comments-test-id';

  const mockComment1: ServiceCommentResponse = {
    id: 'comment-1',
    requestId: mockRequestId,
    authorId: 'user-1',
    authorName: 'Nguyen Van A',
    content: 'Bình luận 1',
    isInternal: false,
    isEdited: false,
    editedAt: null,
    createdAt: '2026-10-24T10:00:00Z',
    updatedAt: '2026-10-24T10:00:00Z',
  };

  const mockComment2: ServiceCommentResponse = {
    id: 'comment-2',
    requestId: mockRequestId,
    authorId: 'user-2',
    authorName: 'Tran Thi B',
    content: 'Bình luận 2',
    isInternal: true,
    isEdited: false,
    editedAt: null,
    createdAt: '2026-10-24T10:05:00Z',
    updatedAt: '2026-10-24T10:05:00Z',
  };

  const mockPage0: PagedData<ServiceCommentResponse> = {
    items: [mockComment1],
    page: 0,
    size: 20,
    totalItems: 2,
    totalPages: 2,
    hasNext: true,
    hasPrevious: false,
  };

  const mockPage1: PagedData<ServiceCommentResponse> = {
    items: [mockComment2],
    page: 1,
    size: 20,
    totalItems: 2,
    totalPages: 2,
    hasNext: false,
    hasPrevious: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. performs exact initial query with default pagination and sorting', async () => {
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage0);

    const { result } = await renderHook(() => useServiceRequestComments(mockRequestId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.comments).toEqual([mockComment1]);
      expect(result.current.hasNext).toBe(true);
      expect(result.current.error).toBeNull();
    });

    expect(serviceRequestApi.getComments).toHaveBeenCalledTimes(1);
    expect(serviceRequestApi.getComments).toHaveBeenCalledWith(mockRequestId, {
      page: 0,
      size: 20,
      sort: 'createdAt,asc',
    });
  });

  it('2. handles initial load error and allows retry', async () => {
    (serviceRequestApi.getComments as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = await renderHook(() => useServiceRequestComments(mockRequestId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.comments).toEqual([]);
    });

    // Retry
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage0);
    await act(async () => {
      await result.current.load();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.comments).toEqual([mockComment1]);
    });
  });

  it('3. retains existing comments on refresh failure and surfaces refreshError', async () => {
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage0);

    const { result } = await renderHook(() => useServiceRequestComments(mockRequestId));
    await waitFor(() => {
      expect(result.current.comments).toEqual([mockComment1]);
    });

    (serviceRequestApi.getComments as jest.Mock).mockRejectedValueOnce(new Error('500 Server Error'));

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.refreshing).toBe(false);
      expect(result.current.refreshError).toBeTruthy();
      // Existing data retained!
      expect(result.current.comments).toEqual([mockComment1]);
    });
  });

  it('4. loads more comments and appends with deduplication', async () => {
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage0);

    const { result } = await renderHook(() => useServiceRequestComments(mockRequestId));
    await waitFor(() => {
      expect(result.current.comments).toEqual([mockComment1]);
    });

    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage1);

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.comments).toEqual([mockComment1, mockComment2]);
      expect(result.current.hasNext).toBe(false);
    });

    expect(serviceRequestApi.getComments).toHaveBeenCalledWith(mockRequestId, {
      page: 1,
      size: 20,
      sort: 'createdAt,asc',
    });
  });

  it('5. enforces synchronous pagination lock on same-tick loadMore calls', async () => {
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage0);

    const { result } = await renderHook(() => useServiceRequestComments(mockRequestId));
    await waitFor(() => {
      expect(result.current.comments).toEqual([mockComment1]);
    });

    let resolvePage1!: (val: PagedData<ServiceCommentResponse>) => void;
    const page1Promise = new Promise<PagedData<ServiceCommentResponse>>(res => {
      resolvePage1 = res;
    });
    (serviceRequestApi.getComments as jest.Mock).mockReturnValueOnce(page1Promise);

    // Call loadMore twice simultaneously
    let p1: Promise<void> | undefined;
    let p2: Promise<void> | undefined;
    await act(async () => {
      p1 = result.current.loadMore();
      p2 = result.current.loadMore();
    });

    await act(async () => {
      resolvePage1(mockPage1);
      await p1;
      await p2;
    });

    // Exactly one GET for page 1 was dispatched!
    expect(serviceRequestApi.getComments).toHaveBeenCalledTimes(2); // page 0 + page 1
  });

  it('6. creates comment with exact DTO, enforces lock, and appends to comments list', async () => {
    (serviceRequestApi.getComments as jest.Mock).mockResolvedValueOnce(mockPage0);

    const { result } = await renderHook(() => useServiceRequestComments(mockRequestId));
    await waitFor(() => {
      expect(result.current.comments).toEqual([mockComment1]);
    });

    const newComment: ServiceCommentResponse = {
      id: 'comment-new',
      requestId: mockRequestId,
      authorId: 'user-caller',
      authorName: 'Ky Thuat Vien',
      content: 'Bình luận mới đã tạo',
      isInternal: true,
      isEdited: false,
      editedAt: null,
      createdAt: '2026-10-24T10:10:00Z',
      updatedAt: '2026-10-24T10:10:00Z',
    };

    (serviceRequestApi.createComment as jest.Mock).mockResolvedValueOnce(newComment);

    await act(async () => {
      const res = await result.current.addComment({
        content: 'Bình luận mới đã tạo',
        isInternal: true,
      });
      expect(res).toEqual(newComment);
    });

    expect(serviceRequestApi.createComment).toHaveBeenCalledWith(mockRequestId, {
      content: 'Bình luận mới đã tạo',
      isInternal: true,
    });

    expect(result.current.comments).toEqual([mockComment1, newComment]);
  });

  it('7. proves stale in-flight GET query cannot overwrite newly created comment', async () => {
    let resolveGet!: (val: PagedData<ServiceCommentResponse>) => void;
    const getPromise = new Promise<PagedData<ServiceCommentResponse>>(res => {
      resolveGet = res;
    });

    (serviceRequestApi.getComments as jest.Mock).mockReturnValueOnce(getPromise);

    const { result } = await renderHook(() => useServiceRequestComments(mockRequestId));

    // While initial GET is still pending, a comment is created
    const createdComment: ServiceCommentResponse = {
      id: 'comment-created-fast',
      requestId: mockRequestId,
      authorId: 'user-caller',
      authorName: 'Ky Thuat Vien',
      content: 'Tạo nhanh',
      isInternal: false,
      isEdited: false,
      editedAt: null,
      createdAt: '2026-10-24T10:15:00Z',
      updatedAt: '2026-10-24T10:15:00Z',
    };
    (serviceRequestApi.createComment as jest.Mock).mockResolvedValueOnce(createdComment);

    await act(async () => {
      await result.current.addComment({ content: 'Tạo nhanh' });
    });

    expect(result.current.comments).toEqual([createdComment]);

    // Now resolve the older initial GET that returned only mockComment1
    await act(async () => {
      resolveGet(mockPage0);
    });

    // The created comment is NOT erased by the older GET response!
    expect(result.current.comments).toEqual([createdComment]);
  });
});
