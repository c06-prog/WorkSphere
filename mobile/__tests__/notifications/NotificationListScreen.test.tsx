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

describe('NotificationListScreen (SCR-NOT-01)', () => {
  const mockApi = notificationApi as jest.Mocked<typeof notificationApi>;
  const mockUseBadge = useNotificationBadge as jest.MockedFunction<typeof useNotificationBadge>;

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
    {
      id: 'notif-2',
      type: 'PROJECT_MEMBER_ADDED',
      title: 'Thông báo dự án',
      message: 'Bạn được thêm vào dự án',
      referenceType: 'PROJECT',
      referenceId: 'proj-1',
      read: true,
      createdAt: '2026-10-25T09:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBadge.mockReturnValue({
      unreadCount: 1,
      isLoading: false,
      error: null,
      refreshUnreadCount: jest.fn().mockResolvedValue(undefined),
      applyNotificationRead: jest.fn(),
      applyAllRead: jest.fn(),
    });
  });

  it('renders header, title, tabs, and lists notifications', async () => {
    mockApi.getNotifications.mockResolvedValueOnce({
      items: sampleNotifications,
      page: 0,
      size: 20,
      totalItems: 2,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });

    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <NotificationListScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Thông báo nhiệm vụ')).toBeTruthy();
      expect(getByText('Thông báo dự án')).toBeTruthy();
    });

    expect(getByTestId('tab-notifications-all')).toBeTruthy();
    expect(getByTestId('tab-notifications-unread')).toBeTruthy();
  });

  it('switches to "Chưa đọc" tab and filters unread notifications', async () => {
    mockApi.getNotifications
      .mockResolvedValueOnce({
        items: sampleNotifications,
        page: 0,
        size: 20,
        totalItems: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      })
      .mockResolvedValueOnce({
        items: [sampleNotifications[0]], // only unread
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });

    const { getByTestId, getByText, queryByText } = await render(
      <ThemeProvider>
        <NotificationListScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('Thông báo nhiệm vụ')).toBeTruthy();
    });

    fireEvent.press(getByTestId('tab-notifications-unread'));

    await waitFor(() => {
      expect(getByText('Thông báo nhiệm vụ')).toBeTruthy();
      expect(queryByText('Thông báo dự án')).toBeNull();
    });

    expect(mockApi.getNotifications).toHaveBeenLastCalledWith(
      expect.objectContaining({ read: false })
    );
  });

  it('navigates back when back button is pressed', async () => {
    mockApi.getNotifications.mockResolvedValueOnce({
      items: [],
      page: 0,
      size: 20,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    });

    const { getByTestId } = await render(
      <ThemeProvider>
        <NotificationListScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('btn-notification-back')).toBeTruthy();
    });

    fireEvent.press(getByTestId('btn-notification-back'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when list has no notifications', async () => {
    mockApi.getNotifications.mockResolvedValueOnce({
      items: [],
      page: 0,
      size: 20,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    });

    const { getByTestId, getByText } = await render(
      <ThemeProvider>
        <NotificationListScreen />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('notification-empty-state')).toBeTruthy();
      expect(getByText('Không có thông báo')).toBeTruthy();
    });
  });
});
