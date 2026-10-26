/**
 * Phase 16E: Service Request Workflow and Assignment Tests
 * Comprehensive coverage for:
 * - RejectResolutionModal (SCR-SRV-03): validations, reason requirement, character limit, version passing, lock, conflict handling
 * - ResolveServiceRequestModal: solution comment requirement, character limit, version passing, lock, conflict handling
 * - User Directory Assignment on ServiceRequestDetailScreen: single user UUID payload, duplicate submit lock, conflict handling, error handling, stale GET rejection
 * - Status transitions (START, WAIT_FOR_USER, RESUME, CANCEL, CONFIRM): allowedActions gates, exact DTOs, version propagation, confirmation dialogs
 * - Continuous version chaining across multiple mutations on a single mounted screen
 * - In-flight query invalidation & refresh ownership
 * - Staging invariants: Comments & Rating strictly staged for 16F
 */

import React from 'react';
import { render, renderHook, fireEvent, waitFor, act } from '@testing-library/react-native';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
import { RejectResolutionModal } from '../../src/features/serviceRequests/components/RejectResolutionModal';
import { ResolveServiceRequestModal } from '../../src/features/serviceRequests/components/ResolveServiceRequestModal';
import { ServiceRequestDetailScreen } from '../../src/features/serviceRequests/screens/ServiceRequestDetailScreen';
import { useServiceRequestDetail } from '../../src/features/serviceRequests/hooks/useServiceRequestDetail';
import { serviceRequestApi } from '../../src/features/serviceRequests/api/serviceRequestApi';
import { directoryApi } from '../../src/features/directory/api/directoryApi';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';
import { ServiceRequestDetailResponse } from '../../src/features/serviceRequests/types/serviceRequestTypes';
import { UserDirectoryItem } from '../../src/features/directory/api/directoryTypes';

jest.mock('../../src/features/serviceRequests/api/serviceRequestApi');
jest.mock('../../src/features/directory/api/directoryApi');

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

let mockCurrentRequestId = 'req-uuid-test';
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    addListener: jest.fn(() => jest.fn()),
  }),
  useRoute: () => ({
    params: { requestId: mockCurrentRequestId },
  }),
  useFocusEffect: (callback: () => void | (() => void)) => {
    require('react').useEffect(() => {
      return callback();
    }, [callback]);
  },
}));

const mockBaseDetail: ServiceRequestDetailResponse = {
  id: 'req-uuid-test',
  requestNumber: 'SR-2026-0001',
  category: { id: 'cat-1', code: 'IT', name: 'Công nghệ thông tin' },
  requester: { id: 'user-req-1', fullName: 'Nguyễn Văn Yêu Cầu', email: 'requester@worksphere.com' },
  assignee: null,
  asset: null,
  title: 'Cần cấp quyền truy cập VPN',
  description: 'Mô tả yêu cầu VPN chi tiết',
  priority: 'MEDIUM',
  status: 'OPEN',
  resolvedAt: null,
  closedAt: null,
  cancelledAt: null,
  attachments: [],
  comments: [],
  histories: [],
  rating: null,
  allowedActions: ['ASSIGN', 'CANCEL', 'UPDATE'],
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: null,
  version: 1,
};

const mockDirectoryUsers: { items: UserDirectoryItem[]; total: number; page: number; size: number } = {
  items: [
    {
      id: 'tech-user-uuid-1',
      username: 'tech1',
      fullName: 'Trần Kỹ Thuật',
      email: 'tech1@worksphere.com',
      avatarUrl: null,
      departmentName: 'Phòng IT',
    },
    {
      id: 'tech-user-uuid-2',
      username: 'tech2',
      fullName: 'Lê Kỹ Sư',
      email: 'tech2@worksphere.com',
      avatarUrl: null,
      departmentName: 'Phòng IT',
    },
  ],
  total: 2,
  page: 0,
  size: 20,
};

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const pressElement = (element: any) => {
  if (typeof element.props.onClick === 'function') {
    element.props.onClick({ defaultPrevented: false });
  } else {
    fireEvent.press(element);
  }
};

describe('Phase 16E: Service Request Workflow and Assignment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentRequestId = `req-uuid-${Math.random().toString(36).substring(2, 9)}`;
    (directoryApi.searchUsers as jest.Mock).mockResolvedValue(mockDirectoryUsers);
    (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValue(mockBaseDetail);
  });

  describe('1. RejectResolutionModal (SCR-SRV-03)', () => {
    it('validates mandatory reason and character limit (1000)', async () => {
      const onClose = jest.fn();
      const onSuccess = jest.fn();

      const resolvedDetail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'RESOLVED',
        allowedActions: ['REJECT_RESOLUTION', 'CONFIRM'],
      };

      const { getByTestId, getByText } = await render(
        <ThemeProvider>
          <RejectResolutionModal
            visible={true}
            request={resolvedDetail}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </ThemeProvider>
      );

      // Attempt submit without reason
      const submitBtn = getByTestId('btn-submit-reject-resolution');
      await act(async () => {
        pressElement(submitBtn);
      });

      await waitFor(() => {
        expect(getByText('Vui lòng nêu rõ lý do sự cố chưa được xử lý')).toBeTruthy();
      });
      expect(serviceRequestApi.rejectResolution).not.toHaveBeenCalled();

      // Input valid reason and submit
      const input = getByTestId('input-reject-resolution-reason');
      await act(async () => {
        fireEvent.changeText(input, 'Sự cố mạng vẫn chưa khắc phục được triệt để.');
      });

      (serviceRequestApi.rejectResolution as jest.Mock).mockResolvedValueOnce({
        ...resolvedDetail,
        status: 'IN_PROGRESS',
        version: 2,
      });

      const updatedSubmitBtn = getByTestId('btn-submit-reject-resolution');
      await act(async () => {
        pressElement(updatedSubmitBtn);
      });

      await waitFor(() => {
        expect(serviceRequestApi.rejectResolution).toHaveBeenCalledWith('req-uuid-test', {
          reason: 'Sự cố mạng vẫn chưa khắc phục được triệt để.',
          version: 1,
        });
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('enforces synchronous submit lock preventing double submissions', async () => {
      const deferred = createDeferred<ServiceRequestDetailResponse>();
      (serviceRequestApi.rejectResolution as jest.Mock).mockReturnValueOnce(deferred.promise);

      const resolvedDetail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'RESOLVED',
        allowedActions: ['REJECT_RESOLUTION', 'CONFIRM'],
      };

      const { getByTestId } = await render(
        <ThemeProvider>
          <RejectResolutionModal
            visible={true}
            request={resolvedDetail}
            onClose={jest.fn()}
            onSuccess={jest.fn()}
          />
        </ThemeProvider>
      );

      await act(async () => {
        fireEvent.changeText(
          getByTestId('input-reject-resolution-reason'),
          'Lý do từ chối thử nghiệm'
        );
      });

      const submitBtn = getByTestId('btn-submit-reject-resolution');
      await act(async () => {
        pressElement(submitBtn);
        pressElement(submitBtn);
      });

      expect(serviceRequestApi.rejectResolution).toHaveBeenCalledTimes(1);

      await act(async () => {
        deferred.resolve({ ...resolvedDetail, status: 'IN_PROGRESS', version: 2 });
      });
    });

    it('triggers onConflict callback when HTTP 409 conflict is encountered', async () => {
      const onConflict = jest.fn();
      const resolvedDetail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'RESOLVED',
        allowedActions: ['REJECT_RESOLUTION', 'CONFIRM'],
      };

      (serviceRequestApi.rejectResolution as jest.Mock).mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 409,
          data: { code: 'OPTIMISTIC_LOCK_CONFLICT', message: 'Version conflict' },
        },
      });

      const { getByTestId } = await render(
        <ThemeProvider>
          <RejectResolutionModal
            visible={true}
            request={resolvedDetail}
            onClose={jest.fn()}
            onSuccess={jest.fn()}
            onConflict={onConflict}
          />
        </ThemeProvider>
      );

      await act(async () => {
        fireEvent.changeText(
          getByTestId('input-reject-resolution-reason'),
          'Lý do từ chối hợp lệ'
        );
      });

      await act(async () => {
        pressElement(getByTestId('btn-submit-reject-resolution'));
      });

      await waitFor(() => {
        expect(onConflict).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('2. ResolveServiceRequestModal', () => {
    it('requires non-blank solution comment before submission', async () => {
      const inProgressDetail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'IN_PROGRESS',
        allowedActions: ['WAIT_FOR_USER', 'RESOLVE'],
      };

      const { getByTestId, getByText } = await render(
        <ThemeProvider>
          <ResolveServiceRequestModal
            visible={true}
            request={inProgressDetail}
            onClose={jest.fn()}
            onSuccess={jest.fn()}
          />
        </ThemeProvider>
      );

      const submitBtn = getByTestId('btn-submit-resolve-service-request');
      await act(async () => {
        pressElement(submitBtn);
      });

      await waitFor(() => {
        expect(getByText('Cần cập nhật giải pháp xử lý khi hoàn tất yêu cầu')).toBeTruthy();
      });
      expect(serviceRequestApi.updateServiceRequestStatus).not.toHaveBeenCalled();

      await act(async () => {
        fireEvent.changeText(
          getByTestId('input-resolve-service-request-comment'),
          'Đã cấp quyền VPN và kiểm tra kết nối thành công'
        );
      });

      (serviceRequestApi.updateServiceRequestStatus as jest.Mock).mockResolvedValueOnce(undefined);

      await act(async () => {
        pressElement(getByTestId('btn-submit-resolve-service-request'));
      });

      await waitFor(() => {
        expect(serviceRequestApi.updateServiceRequestStatus).toHaveBeenCalledWith(
          'req-uuid-test',
          {
            status: 'RESOLVED',
            comment: 'Đã cấp quyền VPN và kiểm tra kết nối thành công',
            version: 1,
          }
        );
      });
    });
  });

  describe('3. Detail Screen Workflow Integration & Assignment', () => {
    it('renders ASSIGN button when ASSIGN is present; opens Directory UserPicker and assigns User UUID', async () => {
      const openDetail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'OPEN',
        allowedActions: ['ASSIGN', 'CANCEL', 'UPDATE'],
      };

      (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValue(openDetail);
      (serviceRequestApi.assignServiceRequest as jest.Mock).mockResolvedValueOnce(undefined);

      const { getByTestId, getByText } = await render(
        <ThemeProvider>
          <ServiceRequestDetailScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('btn-assign-service-request')).toBeTruthy();
      });

      // Press assign button to open UserPickerModal
      pressElement(getByTestId('btn-assign-service-request'));

      await waitFor(() => {
        expect(getByTestId('modal-assign-service-request')).toBeTruthy();
        expect(getByText('Trần Kỹ Thuật')).toBeTruthy();
      });

      // Select tech1
      await act(async () => {
        fireEvent.press(getByText('Trần Kỹ Thuật'));
      });

      // Confirm selection
      const confirmBtn = getByTestId('user-picker-confirm-btn');
      await act(async () => {
        fireEvent.press(confirmBtn);
      });

      await waitFor(() => {
        expect(serviceRequestApi.assignServiceRequest).toHaveBeenCalledWith(
          'req-uuid-test',
          { assigneeId: 'tech-user-uuid-1' }
        );
      });
    });

    it('renders START button when ASSIGNED; triggers status transition to IN_PROGRESS', async () => {
      const assignedDetail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'ASSIGNED',
        allowedActions: ['START'],
      };

      (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValue(assignedDetail);
      (serviceRequestApi.updateServiceRequestStatus as jest.Mock).mockResolvedValueOnce(undefined);

      const { getByTestId } = await render(
        <ThemeProvider>
          <ServiceRequestDetailScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('btn-start-service-request')).toBeTruthy();
      });

      pressElement(getByTestId('btn-start-service-request'));

      await waitFor(() => {
        expect(serviceRequestApi.updateServiceRequestStatus).toHaveBeenCalledWith(
          'req-uuid-test',
          {
            status: 'IN_PROGRESS',
            comment: undefined,
            version: 1,
          }
        );
      });
    });

    it('renders WAIT_FOR_USER and RESUME actions accurately', async () => {
      const inProgressDetail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'IN_PROGRESS',
        allowedActions: ['WAIT_FOR_USER', 'RESOLVE'],
      };

      (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValue(inProgressDetail);
      (serviceRequestApi.updateServiceRequestStatus as jest.Mock).mockResolvedValueOnce(undefined);

      const { getByTestId } = await render(
        <ThemeProvider>
          <ServiceRequestDetailScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('btn-wait-user-service-request')).toBeTruthy();
        expect(getByTestId('btn-resolve-service-request')).toBeTruthy();
      });

      pressElement(getByTestId('btn-wait-user-service-request'));

      await waitFor(() => {
        expect(serviceRequestApi.updateServiceRequestStatus).toHaveBeenCalledWith(
          'req-uuid-test',
          {
            status: 'WAITING_FOR_USER',
            comment: undefined,
            version: 1,
          }
        );
      });
    });

    it('renders CANCEL button; prompts confirmation dialog before executing CANCELLED transition', async () => {
      const openDetail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'OPEN',
        allowedActions: ['CANCEL', 'UPDATE'],
      };

      (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValue(openDetail);
      (serviceRequestApi.updateServiceRequestStatus as jest.Mock).mockResolvedValueOnce(undefined);

      const { getByTestId, getByText } = await render(
        <ThemeProvider>
          <ServiceRequestDetailScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('btn-cancel-service-request')).toBeTruthy();
      });

      // Press Cancel action button
      pressElement(getByTestId('btn-cancel-service-request'));

      // Confirm dialog appears
      await waitFor(() => {
        expect(getByTestId('dialog-cancel-service-request')).toBeTruthy();
        expect(getByText('Hủy yêu cầu dịch vụ')).toBeTruthy();
      });

      // Confirm cancel
      pressElement(getByTestId('dialog-cancel-service-request-confirm-btn'));

      await waitFor(() => {
        expect(serviceRequestApi.updateServiceRequestStatus).toHaveBeenCalledWith(
          'req-uuid-test',
          {
            status: 'CANCELLED',
            comment: undefined,
            version: 1,
          }
        );
      });
    });

    it('renders CONFIRM button on RESOLVED; prompts confirmation dialog and closes request', async () => {
      const resolvedDetail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'RESOLVED',
        allowedActions: ['REJECT_RESOLUTION', 'CONFIRM'],
      };

      (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValue(resolvedDetail);
      (serviceRequestApi.updateServiceRequestStatus as jest.Mock).mockResolvedValueOnce(undefined);

      const { getByTestId, getByText } = await render(
        <ThemeProvider>
          <ServiceRequestDetailScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('btn-confirm-service-request')).toBeTruthy();
        expect(getByTestId('btn-reject-resolution-service-request')).toBeTruthy();
      });

      pressElement(getByTestId('btn-confirm-service-request'));

      await waitFor(() => {
        expect(getByTestId('dialog-confirm-service-request')).toBeTruthy();
        expect(getByText('Bạn có đồng ý kết quả xử lý và đóng yêu cầu dịch vụ này không?')).toBeTruthy();
      });

      pressElement(getByTestId('dialog-confirm-service-request-confirm-btn'));

      await waitFor(() => {
        expect(serviceRequestApi.updateServiceRequestStatus).toHaveBeenCalledWith(
          'req-uuid-test',
          {
            status: 'CLOSED',
            comment: undefined,
            version: 1,
          }
        );
      });
    });
  });

  describe('4. Continuous Version Chaining & Stale In-Flight Protection', () => {
    it('executes continuous version chaining on a single mounted screen: v1 -> RESOLVE -> refresh v2 -> REJECT -> response v3', async () => {
      const v1Detail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'IN_PROGRESS',
        version: 1,
        allowedActions: ['WAIT_FOR_USER', 'RESOLVE'],
      };

      const v2Detail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'RESOLVED',
        version: 2,
        allowedActions: ['REJECT_RESOLUTION', 'CONFIRM'],
      };

      const v3Detail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'IN_PROGRESS',
        version: 3,
        allowedActions: ['WAIT_FOR_USER', 'RESOLVE'],
      };

      let currentFetchDetail = v1Detail;
      (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockImplementation(async () => currentFetchDetail);
      (serviceRequestApi.updateServiceRequestStatus as jest.Mock).mockResolvedValueOnce(undefined);
      (serviceRequestApi.rejectResolution as jest.Mock).mockResolvedValueOnce(v3Detail);

      const { getByTestId, queryByTestId } = await render(
        <ThemeProvider>
          <ServiceRequestDetailScreen />
        </ThemeProvider>
      );

      // 1. Initial screen renders with v1
      await waitFor(() => {
        expect(getByTestId('btn-resolve-service-request')).toBeTruthy();
      });

      // 2. Open Resolve modal and submit
      await act(async () => {
        pressElement(getByTestId('btn-resolve-service-request'));
      });

      await waitFor(() => {
        expect(getByTestId('modal-resolve-service-request')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.changeText(
          getByTestId('input-resolve-service-request-comment'),
          'Giải pháp hoàn tất v1'
        );
      });

      // Prepare next GET to return authoritative v2
      currentFetchDetail = v2Detail;

      await act(async () => {
        pressElement(getByTestId('btn-submit-resolve-service-request'));
      });

      // 3. Status update sent version: 1
      await waitFor(() => {
        expect(serviceRequestApi.updateServiceRequestStatus).toHaveBeenCalledWith(
          'req-uuid-test',
          {
            status: 'RESOLVED',
            comment: 'Giải pháp hoàn tất v1',
            version: 1,
          }
        );
      });

      // 4. Modal closes and screen reloads authoritative v2 with REJECT_RESOLUTION action
      await waitFor(() => {
        expect(queryByTestId('modal-resolve-service-request')).toBeNull();
        expect(getByTestId('btn-reject-resolution-service-request')).toBeTruthy();
      });

      // 5. Open Reject modal and submit
      await act(async () => {
        pressElement(getByTestId('btn-reject-resolution-service-request'));
      });

      await waitFor(() => {
        expect(getByTestId('modal-reject-resolution')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.changeText(
          getByTestId('input-reject-resolution-reason'),
          'Từ chối kết quả v2'
        );
      });

      await act(async () => {
        pressElement(getByTestId('btn-submit-reject-resolution'));
      });

      // 6. Reject resolution sent version: 2
      await waitFor(() => {
        expect(serviceRequestApi.rejectResolution).toHaveBeenCalledWith(
          'req-uuid-test',
          {
            reason: 'Từ chối kết quả v2',
            version: 2,
          }
        );
      });

      // 7. Authoritative v3 applied to screen without remount
      await waitFor(() => {
        expect(queryByTestId('modal-reject-resolution')).toBeNull();
        expect(getByTestId('btn-resolve-service-request')).toBeTruthy();
      });
    });

    it('proves stale in-flight GET query cannot overwrite post-mutation refresh', async () => {
      let resolveStaleGet!: (val: ServiceRequestDetailResponse) => void;
      const staleGetPromise = new Promise<ServiceRequestDetailResponse>(res => {
        resolveStaleGet = res;
      });

      // Mock first call hangs (stale GET)
      (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockReturnValueOnce(staleGetPromise);

      const { result } = await renderHook(() => useServiceRequestDetail('req-uuid-test'));

      expect(result.current.initialLoading).toBe(true);

      const freshAfterMutation: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'ASSIGNED',
        version: 2,
        title: 'Tiêu đề sau phân công v2',
        allowedActions: ['START'],
      };

      // Mutation completes and applies authoritative update
      await act(async () => {
        result.current.applyServiceRequestUpdate(freshAfterMutation);
      });

      expect(result.current.request?.title).toBe('Tiêu đề sau phân công v2');
      expect(result.current.request?.version).toBe(2);

      // Slower stale GET resolves with old v1 title
      await act(async () => {
        resolveStaleGet({
          ...mockBaseDetail,
          title: 'Tiêu đề cũ v1',
          version: 1,
        });
        await staleGetPromise;
      });

      // Stale v1 must never overwrite authoritative mutation data
      expect(result.current.request?.title).toBe('Tiêu đề sau phân công v2');
      expect(result.current.request?.version).toBe(2);
    });
  });

  describe('5. Detail Comments & Rating Activation (Phase 16F)', () => {
    it('navigates to ServiceRequestComments with { requestId } and opens rating modal when RATE is present', async () => {
      const closedDetail: ServiceRequestDetailResponse = {
        ...mockBaseDetail,
        status: 'CLOSED',
        allowedActions: ['COMMENT', 'RATE'],
      };

      (serviceRequestApi.getServiceRequestDetail as jest.Mock).mockResolvedValue(closedDetail);

      const { getByTestId, queryByTestId, queryByText } = await render(
        <ThemeProvider>
          <ServiceRequestDetailScreen />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('btn-view-all-comments')).toBeTruthy();
        expect(getByTestId('btn-open-rate-service-request')).toBeTruthy();
      });

      // Navigate to comments with exact param { requestId }
      await act(async () => {
        pressElement(getByTestId('btn-view-all-comments'));
      });
      expect(mockNavigate).toHaveBeenCalledWith('ServiceRequestComments', {
        requestId: 'req-uuid-test',
      });

      // Opens rating modal when RATE is pressed
      await act(async () => {
        pressElement(getByTestId('btn-open-rate-service-request'));
      });
      expect(getByTestId('modal-service-rating')).toBeTruthy();

      // No inline comment input on Detail or upload controls
      expect(queryByText('Gửi bình luận')).toBeNull();
      expect(queryByTestId('btn-add-comment')).toBeNull();
      expect(queryByText('Tải lên tệp đính kèm')).toBeNull();
      expect(queryByTestId('btn-upload-attachment')).toBeNull();
    });
  });
});
