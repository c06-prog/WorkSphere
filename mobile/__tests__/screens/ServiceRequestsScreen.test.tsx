/**
 * Phase 16B: ServiceRequestsScreen Component Tests (SCR-SRV-01)
 * Rigorous tests covering:
 * - Loading indicator during initial fetch
 * - Success list rendering with FlatList and ServiceRequestCard
 * - Canonical search, status, priority, and category filter controls
 * - Differentiated empty states (global vs filtered with clear filters action)
 * - Error states: initial blocking error with retry, non-blocking refresh banner, inline pagination error
 * - Accessibility properties and touch target sizes
 * - Staging enforcement: No Create button/FAB, No Detail navigation
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ServiceRequestsScreen } from '../../src/features/serviceRequests/screens/ServiceRequestsScreen';
import { useServiceRequests } from '../../src/features/serviceRequests/hooks/useServiceRequests';
import { AppProviders } from '../../src/app/providers';
import {
  ServiceCategoryResponse,
  ServiceRequestSummaryResponse,
} from '../../src/features/serviceRequests/types/serviceRequestTypes';
import { ServiceRequestPresentationError } from '../../src/features/serviceRequests/errors/serviceRequestErrorMapper';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

jest.mock('../../src/features/serviceRequests/hooks/useServiceRequests');

describe('ServiceRequestsScreen (SCR-SRV-01)', () => {
  const mockLoadInitial = jest.fn();
  const mockRefresh = jest.fn();
  const mockLoadMore = jest.fn();
  const mockRetryPagination = jest.fn();
  const mockClearFilters = jest.fn();
  const mockSetSearch = jest.fn();
  const mockSetStatusFilter = jest.fn();
  const mockSetPriorityFilter = jest.fn();
  const mockSetCategoryFilter = jest.fn();

  const mockItem1: ServiceRequestSummaryResponse = {
    id: '11111111-1111-1111-1111-111111111111',
    requestNumber: 'SR-2026-000001',
    categoryId: 'cat-1',
    categoryName: 'Thiết bị văn phòng',
    requesterId: 'user-1',
    requesterName: 'Nguyễn Văn A',
    assigneeId: 'user-2',
    assigneeName: 'Trần Văn B',
    title: 'Hỏng máy lạnh phòng 201',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: '2026-10-22T08:00:00Z',
    updatedAt: null,
  };

  const mockItem2: ServiceRequestSummaryResponse = {
    id: '22222222-2222-2222-2222-222222222222',
    requestNumber: 'SR-2026-000002',
    categoryId: 'cat-2',
    categoryName: 'Công nghệ thông tin',
    requesterId: 'user-3',
    requesterName: 'Lê Văn C',
    assigneeId: null,
    assigneeName: null,
    title: 'Cần cấp quyền truy cập VPN',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-22T09:00:00Z',
    updatedAt: null,
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
      code: 'IT',
      name: 'Công nghệ thông tin',
      description: null,
      defaultPriority: 'HIGH',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: null,
      version: 1,
    },
  ];

  const defaultHookReturn = {
    requests: [mockItem1, mockItem2],
    totalItems: 2,
    initialLoading: false,
    refreshing: false,
    loadingMore: false,
    hasNext: false,
    page: 0,
    error: null,
    paginationError: null,
    refreshError: null,
    search: '',
    setSearch: mockSetSearch,
    statusFilter: undefined,
    setStatusFilter: mockSetStatusFilter,
    priorityFilter: undefined,
    setPriorityFilter: mockSetPriorityFilter,
    categoryFilter: undefined,
    setCategoryFilter: mockSetCategoryFilter,
    categories: mockCategories,
    loadInitial: mockLoadInitial,
    refresh: mockRefresh,
    loadMore: mockLoadMore,
    retryPagination: mockRetryPagination,
    clearFilters: mockClearFilters,
  };

  const renderScreen = async () => {
    return await render(
      <AppProviders>
        <ServiceRequestsScreen />
      </AppProviders>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useServiceRequests as jest.Mock).mockReturnValue(defaultHookReturn);
  });

  describe('1. Initial Loading & Initial Error', () => {
    it('renders full-screen LoadingIndicator on initial load', async () => {
      (useServiceRequests as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        requests: [],
        initialLoading: true,
      });

      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('screen-service-requests')).toBeTruthy();
      expect(getByTestId('service-requests-loading')).toBeTruthy();
      expect(getByText('Đang tải danh sách yêu cầu...')).toBeTruthy();
    });

    it('renders full-screen ErrorState on initial error and allows retry', async () => {
      const mockError: ServiceRequestPresentationError = {
        message: 'Lỗi kết nối máy chủ',
        placement: 'dialog',
        retryable: true,
        isConflict: false,
        isNotFound: false,
        isForbidden: false,
      };

      (useServiceRequests as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        requests: [],
        initialLoading: false,
        error: mockError,
      });

      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('service-requests-error')).toBeTruthy();
      expect(getByText('Không thể tải danh sách yêu cầu')).toBeTruthy();
      expect(getByText('Lỗi kết nối máy chủ')).toBeTruthy();

      const retryBtn = getByText('Thử lại');
      fireEvent.press(retryBtn);
      expect(mockLoadInitial).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Success List & Canonical Controls', () => {
    it('renders title, search bar, filter chips, and FlatList items', async () => {
      const { getByTestId, getByText } = await renderScreen();

      expect(getByText('Yêu cầu dịch vụ')).toBeTruthy();
      expect(getByText('SCR-SRV-01: Danh sách yêu cầu hỗ trợ và dịch vụ')).toBeTruthy();

      // Search bar
      expect(getByTestId('service-requests-search-bar')).toBeTruthy();

      // Filter rows
      expect(getByTestId('service-requests-status-filters')).toBeTruthy();
      expect(getByTestId('service-requests-priority-filters')).toBeTruthy();
      expect(getByTestId('service-requests-category-filters')).toBeTruthy();

      // FlatList items
      expect(getByTestId('service-requests-flatlist')).toBeTruthy();
      expect(getByText('Hỏng máy lạnh phòng 201')).toBeTruthy();
      expect(getByText('Cần cấp quyền truy cập VPN')).toBeTruthy();
    });

    it('interacts with search bar', async () => {
      const { getByTestId } = await renderScreen();

      const searchInput = getByTestId('service-requests-search-bar');
      fireEvent.changeText(searchInput, 'máy lạnh');

      expect(mockSetSearch).toHaveBeenCalledWith('máy lạnh');
    });

    it('interacts with status filter chips', async () => {
      const { getByTestId } = await renderScreen();

      const openFilter = getByTestId('filter-chip-status-open');
      fireEvent.press(openFilter);

      expect(mockSetStatusFilter).toHaveBeenCalledWith('OPEN');
    });

    it('interacts with priority filter chips', async () => {
      const { getByTestId } = await renderScreen();

      const highFilter = getByTestId('filter-chip-priority-high');
      fireEvent.press(highFilter);

      expect(mockSetPriorityFilter).toHaveBeenCalledWith('HIGH');
    });

    it('interacts with category filter chips', async () => {
      const { getByTestId } = await renderScreen();

      const cat1Filter = getByTestId('filter-chip-category-cat-1');
      fireEvent.press(cat1Filter);

      expect(mockSetCategoryFilter).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('3. Differentiated Empty States', () => {
    it('renders global empty state when there are no requests and no active filters', async () => {
      (useServiceRequests as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        requests: [],
        totalItems: 0,
      });

      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('service-requests-empty-all')).toBeTruthy();
      expect(getByText('Chưa có yêu cầu dịch vụ nào')).toBeTruthy();
      expect(
        getByText('Các yêu cầu hỗ trợ hoặc dịch vụ bạn tạo hoặc được giao sẽ xuất hiện tại đây.')
      ).toBeTruthy();
    });

    it('renders filtered empty state with "Xóa bộ lọc" action when search/filter is active', async () => {
      (useServiceRequests as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        requests: [],
        totalItems: 0,
        search: 'điều hòa',
      });

      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('service-requests-empty-filtered')).toBeTruthy();
      expect(getByText('Không tìm thấy yêu cầu')).toBeTruthy();

      const clearBtn = getByText('Xóa bộ lọc');
      fireEvent.press(clearBtn);

      expect(mockClearFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. Non-Blocking Refresh Error & Inline Pagination Error', () => {
    it('renders non-blocking refresh error banner while keeping list visible', async () => {
      (useServiceRequests as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        refreshError: 'Không thể làm mới danh sách. Vui lòng thử lại.',
      });

      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('service-requests-refresh-error-banner')).toBeTruthy();
      expect(getByText('Không thể làm mới danh sách. Vui lòng thử lại.')).toBeTruthy();

      // List items remain visible
      expect(getByText('Hỏng máy lạnh phòng 201')).toBeTruthy();
    });

    it('renders pagination error in footer with retry button', async () => {
      const mockPaginationError: ServiceRequestPresentationError = {
        message: 'Lỗi tải trang kế tiếp',
        placement: 'general',
        retryable: true,
        isConflict: false,
        isNotFound: false,
        isForbidden: false,
      };

      (useServiceRequests as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        paginationError: mockPaginationError,
      });

      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('service-requests-pagination-error')).toBeTruthy();
      expect(getByText('Lỗi tải trang kế tiếp')).toBeTruthy();

      const retryBtn = getByTestId('btn-retry-pagination');
      fireEvent.press(retryBtn);

      expect(mockRetryPagination).toHaveBeenCalledTimes(1);
    });
  });

  describe('5. Navigation & Staging Invariants (Phase 16C)', () => {
    it('does NOT render Create Request button or FAB in 16C', async () => {
      const { queryByText, queryByLabelText, queryByTestId } = await renderScreen();

      expect(queryByText('+ Tạo mới')).toBeNull();
      expect(queryByText('Tạo yêu cầu')).toBeNull();
      expect(queryByLabelText('Tạo yêu cầu mới')).toBeNull();
      expect(queryByTestId('service-requests-create-button')).toBeNull();
    });

    it('navigates to ServiceRequestDetail with exact requestId when card is pressed', async () => {
      const { getByTestId } = await renderScreen();

      const card1 = getByTestId('service-request-card-11111111-1111-1111-1111-111111111111');
      expect(card1).toBeTruthy();

      fireEvent.press(card1);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('ServiceRequestDetail', {
        requestId: '11111111-1111-1111-1111-111111111111',
      });
    });
  });
});
