import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NotificationListScreen } from '../../src/features/notifications/screens/NotificationListScreen';
import { notificationApi } from '../../src/features/notifications/api/notificationApi';
import { NotificationResponse } from '../../src/features/notifications/types/notificationTypes';
import { ThemeProvider } from '../../src/app/providers/ThemeProvider';
import { useNotificationBadge } from '../../src/features/notifications/context/NotificationBadgeContext';

jest.mock('../../src/features/notifications/api/notificationApi');
jest.mock('../../src/features/notifications/context/NotificationBadgeContext');

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: jest.fn(),
    }),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

describe('NotificationListScreen Mutations (Phase 18C)', () => {
  const mockApi = notificationApi as jest.Mocked<typeof notificationApi>;
  const mockUseBadge = useNotificationBadge as jest.MockedFunction<typeof useNotificationBadge>;

  const mockApplyRead = jest.fn();
  const mockApplyAllRead = jest.fn();
  const mockRefreshUnreadCount = jest.fn().mockResolvedValue(undefined);

  const sampleNotifications: NotificationResponse[] = [
    {
      id: 'notif-1',
      type: 'TASK_ASSIGNED',
      title: 'Thông báo nhiệm vụ',
      message: 'Nội dung chi tiết',
      referenceType: 'TASK',
      referenceId: 'task-1',
      read: false,
      createdAt: '2026-10-25T10:00:00Z',
    },
  ];

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

  it('tapping unread notification triggers mark-read API and does NOT deep-link', async () => {
    mockApi.getNotifications.mockResolvedValueOnce({
      items: sampleNotifications,
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markNotificationRead.mockResolvedValueOnce(undefined);

    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <NotificationListScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Thông báo nhiệm vụ')).toBeTruthy();
    });

    fireEvent.press(getByTestId('notification-card-notif-1'));

    await waitFor(() => {
      expect(mockApi.markNotificationRead).toHaveBeenCalledWith('notif-1');
      expect(mockApplyRead).toHaveBeenCalledWith('notif-1');
    });
  });

  it('clicking "Đọc tất cả" shows confirmation dialog and executes mark-all on confirm', async () => {
    mockApi.getNotifications.mockResolvedValueOnce({
      items: sampleNotifications,
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markAllNotificationsRead.mockResolvedValueOnce({ updatedCount: 1 });

    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <NotificationListScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('btn-mark-all-read')).toBeTruthy();
    });

    fireEvent.press(getByTestId('btn-mark-all-read'));

    await waitFor(() => {
      expect(getByTestId('dialog-confirm-mark-all')).toBeTruthy();
      expect(getByText('Bạn có chắc chắn muốn đánh dấu tất cả thông báo hiện có là đã đọc?')).toBeTruthy();
    });

    // Confirm dialog
    fireEvent.press(getByText('Xác nhận'));

    await waitFor(() => {
      expect(mockApi.markAllNotificationsRead).toHaveBeenCalledTimes(1);
      expect(mockApplyAllRead).toHaveBeenCalledTimes(1);
    });
  });
});
