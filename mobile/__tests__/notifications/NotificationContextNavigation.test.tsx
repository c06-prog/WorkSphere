import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NotificationListScreen } from '../../src/features/notifications/screens/NotificationListScreen';
import { notificationApi } from '../../src/features/notifications/api/notificationApi';
import { NotificationResponse } from '../../src/features/notifications/types/notificationTypes';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';
import { AuthContext } from '../../src/app/auth/AuthProvider';
import { useNotificationBadge } from '../../src/features/notifications/context/NotificationBadgeContext';

jest.mock('../../src/features/notifications/api/notificationApi');
jest.mock('../../src/features/notifications/context/NotificationBadgeContext');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

describe('Notification Context Navigation Orchestration (Phase 18D)', () => {
  const mockApi = notificationApi as jest.Mocked<typeof notificationApi>;
  const mockUseBadge = useNotificationBadge as jest.MockedFunction<typeof useNotificationBadge>;

  const mockApplyRead = jest.fn();
  const mockApplyAllRead = jest.fn();
  const mockRefreshUnreadCount = jest.fn().mockResolvedValue(undefined);

  const validTaskUuid = 'c183cf9e-105e-4c7c-b630-b4f0b2f3bc11';
  const validProjectUuid = 'd294daaf-216f-4d8d-a741-c501c3e4cd22';
  const validServiceRequestUuid = 'e305ebba-3270-4e9e-b852-d612d4f5de33';
  const validAssetUuid = 'f416fccb-4381-4f0f-c963-e723e5a6ef44';

  const authContextValue: any = {
    currentUser: {
      id: 'usr-tester-1',
      fullName: 'Tester 1',
      email: 'tester1@worksphere.local',
      roles: ['EMPLOYEE'],
      permissions: [],
    },
    sessionState: 'AUTHENTICATED',
    initialized: true,
    login: jest.fn(),
    logout: jest.fn(),
  };

  const renderScreen = async (customAuth = authContextValue) =>
    await render(
      <ThemeProvider>
        <AuthContext.Provider value={customAuth}>
          <NotificationListScreen />
        </AuthContext.Provider>
      </ThemeProvider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBadge.mockReturnValue({
      unreadCount: 1,
      isLoading: false,
      error: null,
      refreshUnreadCount: mockRefreshUnreadCount,
      applyNotificationRead: mockApplyRead,
      applyAllRead: mockApplyAllRead,
    });
  });

  it('Case A (Unread TASK): marks read first, updates badge, then navigates to TaskDetail nested in MainTabs', async () => {
    const unreadTaskNotif: NotificationResponse = {
      id: 'notif-task-1',
      type: 'TASK_ASSIGNED',
      title: 'Công việc mới',
      message: 'Bạn được giao công việc',
      referenceType: 'TASK',
      referenceId: validTaskUuid,
      read: false,
      createdAt: '2026-10-25T10:00:00Z',
    };

    mockApi.getNotifications.mockResolvedValueOnce({
      items: [unreadTaskNotif],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markNotificationRead.mockResolvedValueOnce(undefined);

    const { getByTestId, getByText } = await renderScreen();

    await waitFor(() => {
      expect(getByText('Công việc mới')).toBeTruthy();
    });

    fireEvent.press(getByTestId('notification-card-notif-task-1'));

    await waitFor(() => {
      expect(mockApi.markNotificationRead).toHaveBeenCalledWith('notif-task-1');
      expect(mockApplyRead).toHaveBeenCalledWith('notif-task-1');
      expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
        screen: 'TaskDetail',
        params: { taskId: validTaskUuid },
      });
    });
  });

  it('Case A (Unread ASSET): marks read and navigates directly to AssetDetail on AppStack', async () => {
    const unreadAssetNotif: NotificationResponse = {
      id: 'notif-asset-1',
      type: 'ASSET_ASSIGNED',
      title: 'Tài sản được cấp',
      message: 'Cấp phát máy tính',
      referenceType: 'ASSET',
      referenceId: validAssetUuid,
      read: false,
      createdAt: '2026-10-25T10:00:00Z',
    };

    mockApi.getNotifications.mockResolvedValueOnce({
      items: [unreadAssetNotif],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markNotificationRead.mockResolvedValueOnce(undefined);

    const { getByTestId, getByText } = await renderScreen();

    await waitFor(() => {
      expect(getByText('Tài sản được cấp')).toBeTruthy();
    });

    fireEvent.press(getByTestId('notification-card-notif-asset-1'));

    await waitFor(() => {
      expect(mockApi.markNotificationRead).toHaveBeenCalledWith('notif-asset-1');
      expect(mockApplyRead).toHaveBeenCalledWith('notif-asset-1');
      expect(mockNavigate).toHaveBeenCalledWith('AssetDetail', {
        assetId: validAssetUuid,
      });
    });
  });

  it('Case B (Read PROJECT): navigates to ProjectDetail without calling markNotificationRead API', async () => {
    const readProjectNotif: NotificationResponse = {
      id: 'notif-proj-1',
      type: 'PROJECT_MEMBER_ADDED',
      title: 'Dự án mới',
      message: 'Tham gia dự án',
      referenceType: 'PROJECT',
      referenceId: validProjectUuid,
      read: true,
      createdAt: '2026-10-25T09:00:00Z',
    };

    mockApi.getNotifications.mockResolvedValueOnce({
      items: [readProjectNotif],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });

    const { getByTestId, getByText } = await renderScreen();

    await waitFor(() => {
      expect(getByText('Dự án mới')).toBeTruthy();
    });

    fireEvent.press(getByTestId('notification-card-notif-proj-1'));

    await waitFor(() => {
      expect(mockApi.markNotificationRead).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
        screen: 'ProjectDetail',
        params: { projectId: validProjectUuid },
      });
    });
  });

  it('Case B (Read SERVICE_REQUEST): navigates to ServiceRequestDetail without calling mark-read API', async () => {
    const readSrNotif: NotificationResponse = {
      id: 'notif-sr-1',
      type: 'SERVICE_REQUEST_UPDATED',
      title: 'Yêu cầu cập nhật',
      message: 'Yêu cầu được phân công',
      referenceType: 'SERVICE_REQUEST',
      referenceId: validServiceRequestUuid,
      read: true,
      createdAt: '2026-10-25T09:00:00Z',
    };

    mockApi.getNotifications.mockResolvedValueOnce({
      items: [readSrNotif],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });

    const { getByTestId, getByText } = await renderScreen();

    await waitFor(() => {
      expect(getByText('Yêu cầu cập nhật')).toBeTruthy();
    });

    fireEvent.press(getByTestId('notification-card-notif-sr-1'));

    await waitFor(() => {
      expect(mockApi.markNotificationRead).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('MainTabs', {
        screen: 'ServiceRequestDetail',
        params: { requestId: validServiceRequestUuid },
      });
    });
  });

  it('Case C (Missing/Unsupported Reference): marks unread read, shows safe info banner, does NOT navigate', async () => {
    const missingRefNotif: NotificationResponse = {
      id: 'notif-missing-1',
      type: 'COMMENT_ADDED',
      title: 'Bình luận chung',
      message: 'Không có liên kết',
      referenceType: null,
      referenceId: null,
      read: false,
      createdAt: '2026-10-25T08:00:00Z',
    };

    mockApi.getNotifications.mockResolvedValueOnce({
      items: [missingRefNotif],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markNotificationRead.mockResolvedValueOnce(undefined);

    const { getByTestId, getByText } = await renderScreen();

    await waitFor(() => {
      expect(getByText('Bình luận chung')).toBeTruthy();
    });

    fireEvent.press(getByTestId('notification-card-notif-missing-1'));

    await waitFor(() => {
      expect(mockApi.markNotificationRead).toHaveBeenCalledWith('notif-missing-1');
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(getByText('Thông báo này không có nội dung liên kết để mở.')).toBeTruthy();
    });
  });

  it('Case D (Mark Read Fails): displays mutation error and does NOT navigate', async () => {
    const unreadTaskNotif: NotificationResponse = {
      id: 'notif-fail-1',
      type: 'TASK_ASSIGNED',
      title: 'Lỗi đánh dấu',
      message: 'Chi tiết',
      referenceType: 'TASK',
      referenceId: validTaskUuid,
      read: false,
      createdAt: '2026-10-25T10:00:00Z',
    };

    mockApi.getNotifications.mockResolvedValueOnce({
      items: [unreadTaskNotif],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markNotificationRead.mockRejectedValueOnce(new Error('Network disconnected'));

    const { getByTestId, getByText } = await renderScreen();

    await waitFor(() => {
      expect(getByText('Lỗi đánh dấu')).toBeTruthy();
    });

    fireEvent.press(getByTestId('notification-card-notif-fail-1'));

    await waitFor(() => {
      expect(mockApi.markNotificationRead).toHaveBeenCalledWith('notif-fail-1');
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockApplyRead).not.toHaveBeenCalled();
    });
  });

  it('Navigation Lock: rapid double tap on same unread notification executes exactly one mark-read and one navigate', async () => {
    const unreadTaskNotif: NotificationResponse = {
      id: 'notif-lock-1',
      type: 'TASK_ASSIGNED',
      title: 'Lock Test',
      message: 'Rapid tap',
      referenceType: 'TASK',
      referenceId: validTaskUuid,
      read: false,
      createdAt: '2026-10-25T10:00:00Z',
    };

    mockApi.getNotifications.mockResolvedValueOnce({
      items: [unreadTaskNotif],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markNotificationRead.mockResolvedValueOnce(undefined);

    const { getByTestId, getByText } = await renderScreen();

    await waitFor(() => {
      expect(getByText('Lock Test')).toBeTruthy();
    });

    // Rapid double press
    fireEvent.press(getByTestId('notification-card-notif-lock-1'));
    fireEvent.press(getByTestId('notification-card-notif-lock-1'));

    await waitFor(() => {
      expect(mockApi.markNotificationRead).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
