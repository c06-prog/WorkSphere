import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AssetDetailScreen } from '../../src/features/assets/screens/AssetDetailScreen';
import { useAssetDetail } from '../../src/features/assets/hooks/useAssetDetail';
import { useAuth } from '../../src/app/auth/AuthProvider';
import { AssetDetailResponse } from '../../src/features/assets/types/assetTypes';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';

jest.mock('../../src/features/assets/hooks/useAssetDetail');
jest.mock('../../src/app/auth/AuthProvider');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockRouteParams: { assetId?: string } = { assetId: '11111111-2222-3333-4444-555555555555' };

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
    useRoute: () => ({
      params: mockRouteParams,
    }),
  };
});

describe('AssetDetailScreen (SCR-AST-02)', () => {
  const mockAsset: AssetDetailResponse = {
    id: '11111111-2222-3333-4444-555555555555',
    assetCode: 'AST-2026-001',
    name: 'MacBook Pro 16 inch M3 Max',
    category: {
      id: 'cat-uuid-1',
      code: 'LAPTOP',
      name: 'Máy tính xách tay',
    },
    description: 'Tài sản cấp phát cho kỹ sư phần mềm cao cấp',
    serialNumber: 'C02G1234MD6R',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16" 2024',
    purchaseDate: '2024-01-15',
    purchasePrice: 65000000,
    status: 'ASSIGNED',
    location: 'Tầng 4 - Phòng Công nghệ',
    warrantyEndDate: '2027-01-15',
    currentAssignment: {
      id: 'asg-uuid-1',
      assignedTo: {
        id: 'usr-uuid-employee',
        fullName: 'Nguyễn Văn Nhân Viên',
      },
      assignedBy: {
        id: 'usr-uuid-admin',
        fullName: 'Quản trị viên Hệ thống',
      },
      assignedAt: '2024-02-01T08:30:00Z',
      expectedReturnAt: '2026-02-01T08:30:00Z',
      notes: 'Bàn giao đầy đủ phụ kiện sạc 140W',
    },
    repairHistories: [
      {
        id: 'rep-uuid-1',
        repairType: 'MAINTENANCE',
        description: 'Vệ sinh định kỳ và tra keo tản nhiệt',
        vendorName: 'Apple Care Service Center',
        cost: 500000,
        startedAt: '2024-06-10T09:00:00Z',
        completedAt: '2024-06-11T16:00:00Z',
        result: 'Hoàn thành tốt',
        createdAt: '2024-06-10T09:00:00Z',
      },
    ],
    relatedServiceRequests: [
      {
        id: 'srv-uuid-1',
        requestNumber: 'REQ-2024-001',
        title: 'Màn hình bị sọc nhỏ góc phải',
        status: 'RESOLVED',
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-11T16:00:00Z',
    version: 3,
  };

  const defaultMockHook = {
    asset: mockAsset,
    initialLoading: false,
    refreshing: false,
    error: null,
    refreshError: null,
    load: jest.fn(),
    refresh: jest.fn(),
    retry: jest.fn(),
    invalidateAndRefresh: jest.fn(),
    applyAssetUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { assetId: '11111111-2222-3333-4444-555555555555' };
    (useAssetDetail as jest.Mock).mockReturnValue(defaultMockHook);
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-uuid-employee',
        email: 'employee@worksphere.local',
        fullName: 'Nguyễn Văn Nhân Viên',
        roles: ['EMPLOYEE'],
        permissions: [],
      },
    });
  });

  const renderScreen = async () => {
    return await render(
      <ThemeProvider>
        <AssetDetailScreen />
      </ThemeProvider>
    );
  };

  it('1. renders full screen LoadingIndicator when initialLoading is true', async () => {
    (useAssetDetail as jest.Mock).mockReturnValue({
      ...defaultMockHook,
      asset: null,
      initialLoading: true,
    });

    const { getByTestId, queryByTestId } = await renderScreen();

    expect(getByTestId('asset-detail-loading')).toBeTruthy();
    expect(queryByTestId('asset-detail-screen')).toBeNull();
  });

  it('2. renders ErrorState with retry button when initial load fails', async () => {
    const mockRetry = jest.fn();
    (useAssetDetail as jest.Mock).mockReturnValue({
      ...defaultMockHook,
      asset: null,
      initialLoading: false,
      error: {
        message: 'Lỗi kết nối máy chủ',
        placement: 'dialog',
        retryable: true,
        isConflict: false,
        isNotFound: false,
        isForbidden: false,
      },
      retry: mockRetry,
    });

    const { getByTestId, getByText } = await renderScreen();

    expect(getByTestId('asset-detail-error')).toBeTruthy();
    expect(getByText('Lỗi tải thông tin')).toBeTruthy();
    expect(getByText('Lỗi kết nối máy chủ')).toBeTruthy();

    const retryBtn = getByText('Thử lại');
    fireEvent.press(retryBtn);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('3. renders canonical fields and StatusBadge properly', async () => {
    const { getByTestId, getByText } = await renderScreen();

    expect(getByTestId('asset-detail-screen')).toBeTruthy();
    expect(getByTestId('asset-detail-code')).toHaveTextContent('AST-2026-001');
    expect(getByTestId('asset-detail-name')).toHaveTextContent('MacBook Pro 16 inch M3 Max');
    expect(getByTestId('asset-detail-description')).toHaveTextContent(
      'Tài sản cấp phát cho kỹ sư phần mềm cao cấp'
    );
    expect(getByTestId('asset-detail-status-badge')).toBeTruthy();

    expect(getByText('Loại: Máy tính xách tay')).toBeTruthy();
    expect(getByText('C02G1234MD6R')).toBeTruthy();
    expect(getByText('Apple')).toBeTruthy();
    expect(getByText('MacBook Pro 16" 2024')).toBeTruthy();
    expect(getByText('Tầng 4 - Phòng Công nghệ')).toBeTruthy();
  });

  it('4. renders current assignment information accurately', async () => {
    const { getByTestId } = await renderScreen();

    expect(getByTestId('asset-detail-assignment')).toBeTruthy();
    expect(getByTestId('asset-detail-assignee')).toHaveTextContent('Nguyễn Văn Nhân Viên');
  });

  it('5. renders repair history and related service requests', async () => {
    const { getByTestId, getByText } = await renderScreen();

    expect(getByTestId('asset-detail-repair-history')).toBeTruthy();
    expect(getByText('Lịch sử sửa chữa & bảo dưỡng')).toBeTruthy();
    expect(getByText('Vệ sinh định kỳ và tra keo tản nhiệt')).toBeTruthy();

    expect(getByTestId('asset-detail-related-requests')).toBeTruthy();
    expect(getByText('REQ-2024-001')).toBeTruthy();
    expect(getByText('Màn hình bị sọc nhỏ góc phải')).toBeTruthy();
  });

  it('6. navigates to ServiceRequestDetail when a related service request is pressed', async () => {
    const { getByTestId } = await renderScreen();

    const requestItem = getByTestId('related-request-item-0');
    fireEvent.press(requestItem);

    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
      screen: 'ServiceRequestDetail',
      params: { requestId: 'srv-uuid-1' },
    });
  });

  it('7. displays report fault button for active assignee and navigates with exact assetId', async () => {
    // Current user is usr-uuid-employee (matches mockAsset.currentAssignment.assignedTo.id)
    const { getByTestId } = await renderScreen();

    const reportFaultBtn = getByTestId('btn-asset-report-fault');
    expect(reportFaultBtn).toBeTruthy();

    fireEvent.press(reportFaultBtn);
    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
      screen: 'CreateServiceRequest',
      params: { assetId: '11111111-2222-3333-4444-555555555555' },
    });
  });

  it('8. hides report fault button when current user is NOT assignee and lacks ASSET_MANAGE/ADMIN', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-other-user',
        email: 'other@worksphere.local',
        fullName: 'Người Dùng Khác',
        roles: ['EMPLOYEE'],
        permissions: ['ASSET_READ'],
      },
    });

    const { queryByTestId } = await renderScreen();

    expect(queryByTestId('btn-asset-report-fault')).toBeNull();
  });

  it('9. displays report fault button for user with ASSET_MANAGE even if not assignee', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-manager',
        email: 'manager@worksphere.local',
        fullName: 'Người Quản Lý',
        roles: ['EMPLOYEE'],
        permissions: ['ASSET_MANAGE'],
      },
    });

    const { getByTestId } = await renderScreen();

    expect(getByTestId('btn-asset-report-fault')).toBeTruthy();
  });

  it('10. navigates goBack when top back button is pressed', async () => {
    const { getByTestId } = await renderScreen();

    const backBtn = getByTestId('btn-asset-detail-back');
    fireEvent.press(backBtn);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
  it('11. displays Edit buttons (header and action section) for ASSET_MANAGE/ADMIN', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-manager',
        fullName: 'Asset Manager',
        roles: ['EMPLOYEE'],
        permissions: ['ASSET_MANAGE'],
      },
    });

    const { getByTestId } = await renderScreen();

    expect(getByTestId('btn-asset-detail-edit')).toBeTruthy();
    expect(getByTestId('btn-asset-action-edit')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('btn-asset-detail-edit'));
    });
    await waitFor(() => {
      expect(getByTestId('edit-asset-modal')).toBeTruthy();
    });
  });

  it('12. hides Edit buttons for standard employee without ASSET_MANAGE/ADMIN', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-employee',
        fullName: 'Normal Employee',
        roles: ['EMPLOYEE'],
        permissions: ['ASSET_READ'],
      },
    });

    const { queryByTestId } = await renderScreen();

    expect(queryByTestId('btn-asset-detail-edit')).toBeNull();
    expect(queryByTestId('btn-asset-action-edit')).toBeNull();
  });

  it('13. displays Return CTA for ASSIGNED asset with active assignment when user has ASSET_MANAGE', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-manager',
        fullName: 'Asset Manager',
        roles: ['EMPLOYEE'],
        permissions: ['ASSET_MANAGE'],
      },
    });

    const { getByTestId, queryByTestId } = await renderScreen();

    // mockAsset is ASSIGNED with currentAssignment -> Return CTA visible, Assign CTA hidden
    expect(getByTestId('btn-asset-action-return')).toBeTruthy();
    expect(queryByTestId('btn-asset-action-assign')).toBeNull();

    await act(async () => {
      fireEvent.press(getByTestId('btn-asset-action-return'));
    });
    await waitFor(() => {
      expect(getByTestId('return-asset-modal')).toBeTruthy();
    });
  });

  it('14. displays Assign CTA for AVAILABLE asset when user has ASSET_MANAGE', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-manager',
        fullName: 'Asset Manager',
        roles: ['EMPLOYEE'],
        permissions: ['ASSET_MANAGE'],
      },
    });

    const availableAsset: AssetDetailResponse = {
      ...mockAsset,
      status: 'AVAILABLE',
      currentAssignment: null,
    };
    (useAssetDetail as jest.Mock).mockReturnValue({
      ...defaultMockHook,
      asset: availableAsset,
    });

    const { getByTestId, queryByTestId } = await renderScreen();

    // AVAILABLE asset -> Assign CTA visible, Return CTA hidden
    expect(getByTestId('btn-asset-action-assign')).toBeTruthy();
    expect(queryByTestId('btn-asset-action-return')).toBeNull();

    await act(async () => {
      fireEvent.press(getByTestId('btn-asset-action-assign'));
    });
    await waitFor(() => {
      expect(getByTestId('assign-asset-modal')).toBeTruthy();
    });
  });

  it('15. hides both Assign and Return CTAs for standard user without ASSET_MANAGE/ADMIN', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-employee',
        fullName: 'Normal Employee',
        roles: ['EMPLOYEE'],
        permissions: ['ASSET_READ'],
      },
    });

    const { queryByTestId } = await renderScreen();

    expect(queryByTestId('btn-asset-action-assign')).toBeNull();
    expect(queryByTestId('btn-asset-action-return')).toBeNull();
    expect(queryByTestId('btn-asset-action-add-repair')).toBeNull();
  });

  it('16. displays Add Repair CTA for user with ASSET_MANAGE and opens AddRepairHistoryModal', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-manager',
        fullName: 'Asset Manager',
        roles: ['EMPLOYEE'],
        permissions: ['ASSET_MANAGE'],
      },
    });

    const { getByTestId } = await renderScreen();

    expect(getByTestId('btn-asset-action-add-repair')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('btn-asset-action-add-repair'));
    });

    await waitFor(() => {
      expect(getByTestId('modal-add-repair-history')).toBeTruthy();
    });
  });

  it('17. displays Add Repair CTA for user with ADMIN role', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: {
        id: 'usr-admin',
        fullName: 'System Admin',
        roles: ['ADMIN'],
        permissions: [],
      },
    });

    const { getByTestId } = await renderScreen();

    expect(getByTestId('btn-asset-action-add-repair')).toBeTruthy();
  });
});
