/**
 * Phase 16C: ServiceRequestDetailScreen Component Tests (SCR-SRV-02)
 *
 * Verifies:
 * - Loading indicator during initial fetch
 * - Canonical field rendering (requestNumber, title, description, category, requester, assignee, asset, lifecycle dates)
 * - Nullable assignee rendering ('Chưa phân công')
 * - Nullable asset rendering ('Không có')
 * - Strictly zero raw IDs, versions, or allowedActions strings rendered
 * - Status history timeline rendering with initial fromStatus === null handled safely
 * - Comments preview rendering
 * - Attachments metadata rendering (originalName, formatted file size, upload date)
 * - Rating section rendering (present rating vs 'Chưa có đánh giá')
 * - Error states: 404 Not Found, 403 Forbidden, and network error with retry button
 * - Non-blocking refresh error banner
 * - Back button triggers navigation.goBack()
 * - Staging invariants: Strictly ZERO active mutation controls in 16C
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ServiceRequestDetailScreen } from '../../src/features/serviceRequests/screens/ServiceRequestDetailScreen';
import { useServiceRequestDetail } from '../../src/features/serviceRequests/hooks/useServiceRequestDetail';
import { AppProviders } from '../../src/app/providers';
import { ServiceRequestDetailResponse } from '../../src/features/serviceRequests/types/serviceRequestTypes';
import { ServiceRequestPresentationError } from '../../src/features/serviceRequests/errors/serviceRequestErrorMapper';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockAddListener = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
      addListener: mockAddListener,
    }),
    useRoute: () => ({
      params: { requestId: 'req-uuid-101' },
    }),
  };
});

jest.mock('../../src/features/serviceRequests/hooks/useServiceRequestDetail');

describe('ServiceRequestDetailScreen (SCR-SRV-02)', () => {
  const mockLoad = jest.fn();
  const mockRefresh = jest.fn();
  const mockRetry = jest.fn();
  const mockApplyServiceRequestUpdate = jest.fn();

  const mockDetail: ServiceRequestDetailResponse = {
    id: 'req-uuid-101',
    requestNumber: 'SR-2026-000101',
    category: {
      id: 'cat-uuid-1',
      code: 'NETWORK',
      name: 'Hạ tầng mạng',
    },
    requester: {
      id: 'user-uuid-1',
      fullName: 'Nguyễn Văn Yêu Cầu',
      email: 'requester@worksphere.local',
    },
    assignee: {
      assignmentId: 'assign-uuid-1',
      id: 'user-uuid-2',
      fullName: 'Trần Kỹ Thuật',
      email: 'technician@worksphere.local',
      assignedAt: '2026-10-22T08:15:00Z',
    },
    asset: {
      id: 'asset-uuid-1',
      assetCode: 'ASSET-ROUTER-01',
      name: 'Router Cisco tầng 2',
    },
    title: 'Mất tín hiệu mạng Wi-Fi khu vực lễ tân',
    description: 'Từ sáng nay nhân viên và khách không thể kết nối Wi-Fi tại tầng trệt.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-22T08:00:00Z',
    updatedAt: '2026-10-22T08:30:00Z',
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    allowedActions: ['UPDATE_STATUS', 'ASSIGN', 'ADD_COMMENT'],
    version: 3,
    histories: [
      {
        id: 'hist-uuid-1',
        requestId: 'req-uuid-101',
        fromStatus: null,
        toStatus: 'OPEN',
        changedBy: 'user-uuid-1',
        changedByName: 'Nguyễn Văn Yêu Cầu',
        comment: 'Tạo yêu cầu dịch vụ',
        changedAt: '2026-10-22T08:00:00Z',
      },
      {
        id: 'hist-uuid-2',
        requestId: 'req-uuid-101',
        fromStatus: 'OPEN',
        toStatus: 'IN_PROGRESS',
        changedBy: 'user-uuid-2',
        changedByName: 'Trần Kỹ Thuật',
        comment: 'Bắt đầu xử lý kiểm tra thiết bị switch',
        changedAt: '2026-10-22T08:15:00Z',
      },
    ],
    comments: [
      {
        id: 'comm-uuid-1',
        requestId: 'req-uuid-101',
        authorId: 'user-uuid-2',
        authorName: 'Trần Kỹ Thuật',
        content: 'Đang kiểm tra modem và switch chính.',
        isInternal: false,
        isEdited: false,
        editedAt: null,
        createdAt: '2026-10-22T08:20:00Z',
        updatedAt: null,
      },
    ],
    attachments: [
      {
        fileId: 'att-uuid-1',
        originalName: 'network_diagram.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 204800,
        downloadUrl: '/api/v1/files/att-uuid-1',
        uploadedBy: 'user-uuid-1',
        createdAt: '2026-10-22T08:05:00Z',
      },
    ],
    rating: {
      id: 'rating-uuid-1',
      requestId: 'req-uuid-101',
      ratedBy: 'user-uuid-1',
      ratedByName: 'Nguyễn Văn Yêu Cầu',
      score: 5,
      comment: 'Dịch vụ xử lý rất nhanh và tận tình',
      createdAt: '2026-10-22T11:00:00Z',
    },
  };

  const defaultHookReturn = {
    request: mockDetail,
    initialLoading: false,
    refreshing: false,
    error: null,
    refreshError: null,
    load: mockLoad,
    refresh: mockRefresh,
    retry: mockRetry,
    applyServiceRequestUpdate: mockApplyServiceRequestUpdate,
  };

  const renderScreen = async () => {
    return await render(
      <AppProviders>
        <ServiceRequestDetailScreen />
      </AppProviders>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useServiceRequestDetail as jest.Mock).mockReturnValue(defaultHookReturn);
  });

  describe('1. Loading & Error States', () => {
    it('renders loading spinner when initialLoading is true', async () => {
      (useServiceRequestDetail as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        request: null,
        initialLoading: true,
      });

      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('service-request-detail-loading')).toBeTruthy();
      expect(getByText('Đang tải chi tiết yêu cầu...')).toBeTruthy();
    });

    it('renders initial error state with back button and retry support', async () => {
      const networkError: ServiceRequestPresentationError = {
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
        placement: 'general',
        retryable: true,
        isConflict: false,
        isNotFound: false,
        isForbidden: false,
      };

      (useServiceRequestDetail as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        request: null,
        error: networkError,
      });

      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('service-request-detail-error')).toBeTruthy();
      expect(getByText('Không thể kết nối đến máy chủ. Vui lòng thử lại.')).toBeTruthy();

      const backBtn = getByTestId('btn-error-back');
      fireEvent.press(backBtn);
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('renders non-blocking refresh error banner when refreshError is present', async () => {
      (useServiceRequestDetail as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        refreshError: 'Không thể làm mới chi tiết yêu cầu. Dữ liệu có thể chưa cập nhật.',
      });

      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('service-request-refresh-error-banner')).toBeTruthy();
      expect(getByText('Không thể làm mới chi tiết yêu cầu. Dữ liệu có thể chưa cập nhật.')).toBeTruthy();

      // Main detail is still rendered
      expect(getByText('SR-2026-000101')).toBeTruthy();
    });
  });

  describe('2. Canonical Presentation Fields', () => {
    it('renders all canonical presentation fields and badges', async () => {
      const { getByTestId, getByText, getAllByText } = await renderScreen();

      // Header Back button
      const headerBackBtn = getByTestId('btn-back');
      fireEvent.press(headerBackBtn);
      expect(mockGoBack).toHaveBeenCalledTimes(1);

      // Request Number & Badges
      expect(getByTestId('detail-request-number')).toBeTruthy();
      expect(getByText('SR-2026-000101')).toBeTruthy();
      expect(getByTestId('status-badge-in_progress')).toBeTruthy();
      expect(getAllByText('Đang xử lý').length).toBeGreaterThanOrEqual(1);
      expect(getByTestId('priority-badge-high')).toBeTruthy();
      expect(getByText('Cao')).toBeTruthy();

      // Title & Description
      expect(getByTestId('detail-title')).toBeTruthy();
      expect(getByText('Mất tín hiệu mạng Wi-Fi khu vực lễ tân')).toBeTruthy();
      expect(getByTestId('detail-description')).toBeTruthy();
      expect(getByText('Từ sáng nay nhân viên và khách không thể kết nối Wi-Fi tại tầng trệt.')).toBeTruthy();

      // Category
      expect(getByTestId('detail-category')).toBeTruthy();
      expect(getByText('Hạ tầng mạng (NETWORK)')).toBeTruthy();

      // Requester & Assignee
      expect(getByTestId('detail-requester')).toBeTruthy();
      expect(getByText('Nguyễn Văn Yêu Cầu (requester@worksphere.local)')).toBeTruthy();
      expect(getByTestId('detail-assignee')).toBeTruthy();
      expect(getAllByText('Trần Kỹ Thuật').length).toBeGreaterThanOrEqual(1);

      // Asset
      expect(getByTestId('detail-asset')).toBeTruthy();
      expect(getByText('Router Cisco tầng 2 (ASSET-ROUTER-01)')).toBeTruthy();

      // Dates
      expect(getByTestId('detail-created-at')).toBeTruthy();
    });

    it('renders "Chưa phân công" when assignee is null', async () => {
      (useServiceRequestDetail as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        request: {
          ...mockDetail,
          assignee: null,
        },
      });

      const { getByText } = await renderScreen();

      expect(getByText('Chưa phân công')).toBeTruthy();
    });

    it('renders "Không có" when asset is null', async () => {
      (useServiceRequestDetail as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        request: {
          ...mockDetail,
          asset: null,
        },
      });

      const { getByText } = await renderScreen();

      expect(getByText('Không có')).toBeTruthy();
    });

    it('renders status history timeline with fromStatus: null handled safely as "Khởi tạo"', async () => {
      const { getByTestId, getByText, getAllByText } = await renderScreen();

      expect(getByTestId('detail-history-section')).toBeTruthy();
      expect(getByTestId('history-item-0')).toBeTruthy();
      expect(getByTestId('history-item-1')).toBeTruthy();

      // Initial transition from null -> OPEN
      expect(getByText(/Khởi tạo/)).toBeTruthy();
      expect(getByTestId('history-comment-0')).toBeTruthy();
      expect(getByText(/Tạo yêu cầu dịch vụ/)).toBeTruthy();

      // Second transition OPEN -> IN_PROGRESS
      expect(getAllByText(/Đang xử lý/).length).toBeGreaterThanOrEqual(1);
      expect(getByTestId('history-comment-1')).toBeTruthy();
      expect(getByText(/Bắt đầu xử lý kiểm tra thiết bị switch/)).toBeTruthy();
    });

    it('renders comments preview correctly', async () => {
      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('detail-comments-section')).toBeTruthy();
      expect(getByText('Đang kiểm tra modem và switch chính.')).toBeTruthy();
    });

    it('renders attachments metadata (originalName, size in KB/MB, upload date)', async () => {
      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('detail-attachments-section')).toBeTruthy();
      expect(getByText('📄 network_diagram.pdf')).toBeTruthy();
      expect(getByText(/200\.0 KB/)).toBeTruthy();
    });

    it('renders rating section with score and comment when rating is present', async () => {
      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('detail-rating-section')).toBeTruthy();
      expect(getByText('⭐ 5 / 5 sao')).toBeTruthy();
      expect(getByText('"Dịch vụ xử lý rất nhanh và tận tình"')).toBeTruthy();
    });

    it('renders "Chưa có đánh giá" when rating is null', async () => {
      (useServiceRequestDetail as jest.Mock).mockReturnValue({
        ...defaultHookReturn,
        request: {
          ...mockDetail,
          rating: null,
        },
      });

      const { getByTestId, getByText } = await renderScreen();

      expect(getByTestId('detail-rating-section')).toBeTruthy();
      expect(getByTestId('rating-empty')).toBeTruthy();
      expect(getByText('Chưa có đánh giá')).toBeTruthy();
    });

    it('strictly NEVER renders raw UUIDs, versions, or allowedActions strings', async () => {
      const { queryByText } = await renderScreen();

      // Zero internal UUIDs exposed
      expect(queryByText('req-uuid-101')).toBeNull();
      expect(queryByText('cat-uuid-1')).toBeNull();
      expect(queryByText('user-uuid-1')).toBeNull();
      expect(queryByText('assign-uuid-1')).toBeNull();
      expect(queryByText('user-uuid-2')).toBeNull();
      expect(queryByText('asset-uuid-1')).toBeNull();
      expect(queryByText('hist-uuid-1')).toBeNull();
      expect(queryByText('comm-uuid-1')).toBeNull();
      expect(queryByText('att-uuid-1')).toBeNull();
      expect(queryByText('rating-uuid-1')).toBeNull();

      // Zero raw allowedActions strings exposed
      expect(queryByText('UPDATE_STATUS')).toBeNull();
      expect(queryByText('ASSIGN')).toBeNull();
      expect(queryByText('ADD_COMMENT')).toBeNull();
    });
  });

  describe('3. Staging Invariants & Edit Capability (Phase 16D)', () => {
    it('does NOT render edit button when UPDATE is absent from allowedActions', async () => {
      const { queryByTestId } = await renderScreen();

      expect(queryByTestId('btn-edit-service-request')).toBeNull();
    });

    it('renders edit button and opens EditServiceRequestModal when UPDATE is allowed', async () => {
      (useServiceRequestDetail as jest.Mock).mockReturnValue({
        request: {
          ...mockDetail,
          status: 'OPEN',
          allowedActions: ['UPDATE', 'CANCEL'],
        },
        initialLoading: false,
        refreshing: false,
        error: null,
        refreshError: null,
        load: mockLoad,
        refresh: mockRefresh,
        retry: mockRetry,
        applyServiceRequestUpdate: mockApplyServiceRequestUpdate,
      });

      const { getByTestId, getByText } = await renderScreen();

      const editBtn = getByTestId('btn-edit-service-request');
      expect(editBtn).toBeTruthy();
      expect(getByText('✎ Chỉnh sửa')).toBeTruthy();

      fireEvent.press(editBtn);

      await waitFor(() => {
        expect(getByTestId('edit-service-request-modal')).toBeTruthy();
        expect(getByText('Chỉnh sửa yêu cầu')).toBeTruthy();
      });
    });

    it('does NOT render other active mutation controls (16E/16F staging)', async () => {
      const { queryByText, queryByTestId } = await renderScreen();

      // No assign button / modal
      expect(queryByText('Phân công')).toBeNull();
      expect(queryByTestId('btn-assign-service-request')).toBeNull();

      // No status action buttons
      expect(queryByText('Hủy yêu cầu')).toBeNull();
      expect(queryByText('Bắt đầu xử lý')).toBeNull();
      expect(queryByText('Chờ phản hồi')).toBeNull();
      expect(queryByText('Giải quyết')).toBeNull();
      expect(queryByText('Tiếp tục xử lý')).toBeNull();
      expect(queryByText('Từ chối giải quyết')).toBeNull();
      expect(queryByText('Xác nhận & Đóng')).toBeNull();

      // No comment input / button
      expect(queryByText('Gửi bình luận')).toBeNull();
      expect(queryByTestId('btn-add-comment')).toBeNull();

      // No rating submission button
      expect(queryByText('Gửi đánh giá')).toBeNull();
      expect(queryByTestId('btn-submit-rating')).toBeNull();

      // No attachment upload button
      expect(queryByText('Tải lên tệp đính kèm')).toBeNull();
      expect(queryByTestId('btn-upload-attachment')).toBeNull();
    });
  });
});
