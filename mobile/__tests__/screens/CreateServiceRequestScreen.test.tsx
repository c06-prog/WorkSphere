/**
 * Phase 16D: CreateServiceRequestScreen Component Tests (SCR-SRV-04)
 *
 * Verifies:
 * - Direct route authorization gating (currentUser.permissions.includes('SERVICE_REQUEST_CREATE'))
 * - Fail-closed unauthorized presentation with back action when SERVICE_REQUEST_CREATE absent
 * - Required field validation (categoryId, title, description)
 * - Category selection updates priority default
 * - Exact POST DTO payload conforming to CreateServiceRequestRequest
 * - Captures optional route assetId context without raw UUID presentation
 * - Synchronous submit lock (submittingRef) prevents duplicate requests on double-press
 * - Navigation to ServiceRequestDetail on success with exact { requestId: created.id }
 * - Error banner display on API submission failure
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { CreateServiceRequestScreen } from '../../src/features/serviceRequests/screens/CreateServiceRequestScreen';
import { serviceRequestApi } from '../../src/features/serviceRequests/api/serviceRequestApi';
import {
  CreateServiceRequestResponse,
  ServiceCategoryResponse,
} from '../../src/features/serviceRequests/types/serviceRequestTypes';
import { AppProviders } from '../../src/app/providers';
import { AuthContext } from '../../src/app/auth/AuthProvider';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/serviceRequests/api/serviceRequestApi');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockUseRoute = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
    useRoute: () => mockUseRoute(),
  };
});

describe('CreateServiceRequestScreen (SCR-SRV-04)', () => {
  const mockCategories: ServiceCategoryResponse[] = [
    {
      id: 'cat-uuid-1',
      parentId: null,
      code: 'NETWORK',
      name: 'Hạ tầng mạng',
      description: 'Sự cố kết nối mạng',
      defaultPriority: 'HIGH',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: null,
      version: 1,
    },
  ];

  const mockCreatedResponse: CreateServiceRequestResponse = {
    id: 'req-created-uuid',
    requestNumber: 'SR-2026-000999',
    status: 'OPEN',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRoute.mockReturnValue({ params: undefined });
    (serviceRequestApi.listCategories as jest.Mock).mockResolvedValue(mockCategories);
  });

  const renderScreen = async (permissions: string[] = ['SERVICE_REQUEST_CREATE']) => {
    const authContextValue: any = {
      currentUser: {
        id: 'user-me',
        email: 'tester@worksphere.local',
        fullName: 'Tester',
        role: 'STAFF',
        status: 'ACTIVE',
        roles: ['STAFF'],
        permissions,
      },
      sessionState: 'AUTHENTICATED',
      initialized: true,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
      refreshProfile: jest.fn(),
    };

    return await render(
      <AppProviders>
        <AuthContext.Provider value={authContextValue}>
          <CreateServiceRequestScreen />
        </AuthContext.Provider>
      </AppProviders>
    );
  };

  describe('1. Authorization Gating', () => {
    it('renders fail-closed error state when SERVICE_REQUEST_CREATE permission is missing', async () => {
      const { getByTestId, getByText, queryByTestId } = await renderScreen([]);

      expect(getByTestId('create-service-request-permission-error')).toBeTruthy();
      expect(getByText('Bạn không có quyền tạo yêu cầu dịch vụ')).toBeTruthy();
      expect(queryByTestId('btn-submit-create-service-request')).toBeNull();

      const backBtn = getByText('Quay lại');
      fireEvent.press(backBtn);
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('renders creation form when SERVICE_REQUEST_CREATE permission is present', async () => {
      const { getByTestId, getByText } = await renderScreen(['SERVICE_REQUEST_CREATE']);

      expect(getByTestId('screen-create-service-request')).toBeTruthy();
      expect(getByText('Tạo yêu cầu dịch vụ')).toBeTruthy();
      expect(getByTestId('btn-submit-create-service-request')).toBeTruthy();
    });
  });

  describe('2. Validation & Form Submission', () => {
    it('validates required fields before submitting', async () => {
      const { getByTestId, getByText } = await renderScreen();

      const submitBtn = getByTestId('btn-submit-create-service-request');
      await act(async () => {
        fireEvent.press(submitBtn);
      });

      await waitFor(() => {
        expect(getByText('Vui lòng chọn danh mục yêu cầu')).toBeTruthy();
        expect(getByText('Tiêu đề không được để trống')).toBeTruthy();
        expect(getByText('Mô tả không được để trống')).toBeTruthy();
      });
      expect(serviceRequestApi.createServiceRequest).not.toHaveBeenCalled();
    });

    it('submits exact CreateServiceRequestRequest and navigates to Detail on success', async () => {
      (serviceRequestApi.createServiceRequest as jest.Mock).mockResolvedValue(mockCreatedResponse);

      const { getByTestId, getByPlaceholderText, getByText } = await renderScreen();

      // Open category picker
      const selectCategoryBtn = getByTestId('btn-select-category');
      await act(async () => {
        fireEvent.press(selectCategoryBtn);
      });

      // Select category
      await waitFor(() => {
        expect(getByTestId('category-option-cat-uuid-1')).toBeTruthy();
      });
      await act(async () => {
        fireEvent.press(getByTestId('category-option-cat-uuid-1'));
      });
      await waitFor(() => {
        expect(getByTestId('category-option-cat-uuid-1').props.accessibilityState.selected).toBe(true);
      });

      await act(async () => {
        fireEvent.press(getByTestId('btn-confirm-category-select'));
      });

      await waitFor(() => {
        expect(getByText('[NETWORK] Hạ tầng mạng')).toBeTruthy();
      });

      // Fill title
      const titleInput = getByPlaceholderText('Nhập tiêu đề yêu cầu...');
      await act(async () => {
        fireEvent.changeText(titleInput, 'Mất tín hiệu mạng dây phòng họp A');
      });

      // Fill description
      const descInput = getByPlaceholderText('Mô tả chi tiết vấn đề cần hỗ trợ...');
      await act(async () => {
        fireEvent.changeText(descInput, 'Không thể truy cập mạng LAN từ 9h sáng.');
      });

      // Submit
      const submitBtn = getByTestId('btn-submit-create-service-request');
      await act(async () => {
        fireEvent.press(submitBtn);
      });

      await waitFor(() => {
        expect(serviceRequestApi.createServiceRequest).toHaveBeenCalledTimes(1);
      });

      expect(serviceRequestApi.createServiceRequest).toHaveBeenCalledWith({
        categoryId: 'cat-uuid-1',
        title: 'Mất tín hiệu mạng dây phòng họp A',
        description: 'Không thể truy cập mạng LAN từ 9h sáng.',
        priority: 'HIGH', // Auto-populated from cat.defaultPriority
        assetId: undefined,
      });

      expect(mockNavigate).toHaveBeenCalledWith('ServiceRequestDetail', {
        requestId: 'req-created-uuid',
      });
    });

    it('captures route assetId without raw UUID presentation', async () => {
      mockUseRoute.mockReturnValue({ params: { assetId: 'trusted-asset-uuid-88' } });
      (serviceRequestApi.createServiceRequest as jest.Mock).mockResolvedValue(mockCreatedResponse);

      const { getByTestId, getByPlaceholderText, getByText, queryByText } = await renderScreen();

      // Asset info banner present
      expect(getByTestId('create-service-request-asset-info')).toBeTruthy();
      // Zero raw UUID displayed
      expect(queryByText('trusted-asset-uuid-88')).toBeNull();

      // Select category
      await act(async () => {
        fireEvent.press(getByTestId('btn-select-category'));
      });
      await waitFor(() => {
        expect(getByTestId('category-option-cat-uuid-1')).toBeTruthy();
      });
      await act(async () => {
        fireEvent.press(getByTestId('category-option-cat-uuid-1'));
      });
      await waitFor(() => {
        expect(getByTestId('category-option-cat-uuid-1').props.accessibilityState.selected).toBe(true);
      });
      await act(async () => {
        fireEvent.press(getByTestId('btn-confirm-category-select'));
      });

      await waitFor(() => {
        expect(getByText('[NETWORK] Hạ tầng mạng')).toBeTruthy();
      });

      // Fill title & description
      await act(async () => {
        fireEvent.changeText(getByPlaceholderText('Nhập tiêu đề yêu cầu...'), 'Hỏng màn hình');
        fireEvent.changeText(getByPlaceholderText('Mô tả chi tiết vấn đề cần hỗ trợ...'), 'Màn hình không lên nguồn.');
      });

      // Submit
      await act(async () => {
        fireEvent.press(getByTestId('btn-submit-create-service-request'));
      });

      await waitFor(() => {
        expect(serviceRequestApi.createServiceRequest).toHaveBeenCalledTimes(1);
      });

      expect(serviceRequestApi.createServiceRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          assetId: 'trusted-asset-uuid-88',
        })
      );
    });

    it('enforces synchronous submit lock on double-press', async () => {
      let resolveApi: (val: any) => void = () => {};
      const pendingPromise = new Promise(resolve => {
        resolveApi = resolve;
      });
      (serviceRequestApi.createServiceRequest as jest.Mock).mockReturnValue(pendingPromise);

      const { getByTestId, getByPlaceholderText, getByText } = await renderScreen();

      // Select category & fill inputs
      await act(async () => {
        fireEvent.press(getByTestId('btn-select-category'));
      });
      await waitFor(() => {
        expect(getByTestId('category-option-cat-uuid-1')).toBeTruthy();
      });
      await act(async () => {
        fireEvent.press(getByTestId('category-option-cat-uuid-1'));
      });
      await waitFor(() => {
        expect(getByTestId('category-option-cat-uuid-1').props.accessibilityState.selected).toBe(true);
      });
      await act(async () => {
        fireEvent.press(getByTestId('btn-confirm-category-select'));
      });

      await waitFor(() => {
        expect(getByText('[NETWORK] Hạ tầng mạng')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.changeText(getByPlaceholderText('Nhập tiêu đề yêu cầu...'), 'Test Title');
        fireEvent.changeText(getByPlaceholderText('Mô tả chi tiết vấn đề cần hỗ trợ...'), 'Test Description');
      });

      const submitBtn = getByTestId('btn-submit-create-service-request');
      await act(async () => {
        fireEvent.press(submitBtn);
        fireEvent.press(submitBtn);
      });

      expect(serviceRequestApi.createServiceRequest).toHaveBeenCalledTimes(1);

      resolveApi(mockCreatedResponse);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });
    });

    it('displays error banner when submission fails', async () => {
      (serviceRequestApi.createServiceRequest as jest.Mock).mockRejectedValue(
        new Error('Không thể kết nối đến máy chủ')
      );

      const { getByTestId, getByPlaceholderText, getByText } = await renderScreen();

      await act(async () => {
        fireEvent.press(getByTestId('btn-select-category'));
      });
      await waitFor(() => {
        expect(getByTestId('category-option-cat-uuid-1')).toBeTruthy();
      });
      await act(async () => {
        fireEvent.press(getByTestId('category-option-cat-uuid-1'));
      });
      await waitFor(() => {
        expect(getByTestId('category-option-cat-uuid-1').props.accessibilityState.selected).toBe(true);
      });
      await act(async () => {
        fireEvent.press(getByTestId('btn-confirm-category-select'));
      });

      await waitFor(() => {
        expect(getByText('[NETWORK] Hạ tầng mạng')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.changeText(getByPlaceholderText('Nhập tiêu đề yêu cầu...'), 'Lỗi mạng');
        fireEvent.changeText(getByPlaceholderText('Mô tả chi tiết vấn đề cần hỗ trợ...'), 'Mô tả chi tiết');
      });

      await act(async () => {
        fireEvent.press(getByTestId('btn-submit-create-service-request'));
      });

      await waitFor(() => {
        expect(getByTestId('create-service-request-error')).toBeTruthy();
        expect(getByText('Đã có lỗi xảy ra khi xử lý yêu cầu dịch vụ. Vui lòng thử lại.')).toBeTruthy();
      });
    });
  });
});
