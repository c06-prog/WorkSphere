import { renderHook, act } from '@testing-library/react-native';
import { useNotifications } from '../../src/features/notifications/hooks/useNotifications';
import { notificationApi } from '../../src/features/notifications/api/notificationApi';
import { NotificationResponse } from '../../src/features/notifications/types/notificationTypes';
import { useNotificationBadge } from '../../src/features/notifications/context/NotificationBadgeContext';

jest.mock('../../src/features/notifications/api/notificationApi');
jest.mock('../../src/features/notifications/context/NotificationBadgeContext');

describe('useNotifications Hook Mutations', () => {
  const mockApi = notificationApi as jest.Mocked<typeof notificationApi>;
  const mockUseBadge = useNotificationBadge as jest.MockedFunction<typeof useNotificationBadge>;

  const mockApplyRead = jest.fn();
  const mockApplyAllRead = jest.fn();
  const mockRefreshUnreadCount = jest.fn().mockResolvedValue(undefined);

  const mockItem1: NotificationResponse = {
    id: 'notif-1',
    type: 'TASK_ASSIGNED',
    title: 'Nhiệm vụ mới',
    message: 'Bạn được phân công nhiệm vụ',
    referenceType: 'TASK',
    referenceId: 'task-1',
    read: false,
    createdAt: '2026-10-25T10:00:00Z',
  };

  const mockItem2: NotificationResponse = {
    id: 'notif-2',
    type: 'PROJECT_MEMBER_ADDED',
    title: 'Dự án mới',
    message: 'Bạn được thêm vào dự án',
    referenceType: 'PROJECT',
    referenceId: 'proj-1',
    read: true,
    createdAt: '2026-10-25T09:00:00Z',
  };

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

  it('markOneAsRead marks item read in ALL mode and notifies badge context', async () => {
    mockApi.getNotifications.mockResolvedValueOnce({
      items: [mockItem1, mockItem2],
      page: 0,
      size: 20,
      totalItems: 2,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markNotificationRead.mockResolvedValueOnce(undefined);

    const { result } = await renderHook(() => useNotifications({ autoLoad: true }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.notifications[0].read).toBe(false);

    let success: boolean = false;
    await act(async () => {
      success = await result.current.markOneAsRead('notif-1');
    });

    expect(success).toBe(true);
    expect(mockApi.markNotificationRead).toHaveBeenCalledWith('notif-1');
    expect(result.current.notifications[0].read).toBe(true);
    expect(mockApplyRead).toHaveBeenCalledWith('notif-1');
  });

  it('markOneAsRead removes item in UNREAD mode', async () => {
    mockApi.getNotifications.mockResolvedValueOnce({
      items: [mockItem1],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markNotificationRead.mockResolvedValueOnce(undefined);

    const { result } = await renderHook(() =>
      useNotifications({ autoLoad: true, initialMode: 'UNREAD' })
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.notifications).toHaveLength(1);

    await act(async () => {
      await result.current.markOneAsRead('notif-1');
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('markOneAsRead blocks rapid double tap via synchronous lock', async () => {
    mockApi.getNotifications.mockResolvedValueOnce({
      items: [mockItem1],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markNotificationRead.mockResolvedValueOnce(undefined);

    const { result } = await renderHook(() => useNotifications({ autoLoad: true }));
    await act(async () => {
      await Promise.resolve();
    });

    let p1!: Promise<boolean>;
    let p2!: Promise<boolean>;

    await act(async () => {
      p1 = result.current.markOneAsRead('notif-1');
      p2 = result.current.markOneAsRead('notif-1'); // should be blocked immediately
      await Promise.all([p1, p2]);
    });

    expect(mockApi.markNotificationRead).toHaveBeenCalledTimes(1);
  });

  it('markAllAsRead marks all read, empties UNREAD, and resets badge count', async () => {
    mockApi.getNotifications.mockResolvedValueOnce({
      items: [mockItem1],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockApi.markAllNotificationsRead.mockResolvedValueOnce({ updatedCount: 1 });

    const { result } = await renderHook(() =>
      useNotifications({ autoLoad: true, initialMode: 'UNREAD' })
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.notifications).toHaveLength(1);

    let updatedCount: number = 0;
    await act(async () => {
      updatedCount = await result.current.markAllAsRead();
    });

    expect(updatedCount).toBe(1);
    expect(mockApi.markAllNotificationsRead).toHaveBeenCalledTimes(1);
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(mockApplyAllRead).toHaveBeenCalledTimes(1);
    expect(mockRefreshUnreadCount).toHaveBeenCalledTimes(1);
  });
});
