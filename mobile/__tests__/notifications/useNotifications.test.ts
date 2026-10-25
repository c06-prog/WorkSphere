import { renderHook, act } from '@testing-library/react-native';
import { useNotifications } from '../../src/features/notifications/hooks/useNotifications';
import { notificationApi } from '../../src/features/notifications/api/notificationApi';
import { NotificationResponse } from '../../src/features/notifications/types/notificationTypes';
import { useNotificationBadge } from '../../src/features/notifications/context/NotificationBadgeContext';

jest.mock('../../src/features/notifications/api/notificationApi');
jest.mock('../../src/features/notifications/context/NotificationBadgeContext');

describe('useNotifications Hook', () => {
  const mockApi = notificationApi as jest.Mocked<typeof notificationApi>;
  const mockUseBadge = useNotificationBadge as jest.MockedFunction<typeof useNotificationBadge>;

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
      refreshUnreadCount: jest.fn().mockResolvedValue(undefined),
      applyNotificationRead: jest.fn(),
      applyAllRead: jest.fn(),
    });
  });

  it('1. loads initial notifications on mount with mode="ALL" (read=undefined)', async () => {
    mockApi.getNotifications.mockResolvedValueOnce({
      items: [mockItem1, mockItem2],
      page: 0,
      size: 20,
      totalItems: 2,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });

    const { result } = await renderHook(() => useNotifications({ autoLoad: true }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.initialLoading).toBe(false);
    expect(result.current.notifications).toEqual([mockItem1, mockItem2]);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.mode).toBe('ALL');
    expect(mockApi.getNotifications).toHaveBeenCalledWith({
      page: 0,
      size: 20,
      read: undefined,
      type: undefined,
      sort: 'createdAt,desc',
    });
  });

  it('2. queries with read=false when mode is switched to "UNREAD"', async () => {
    mockApi.getNotifications
      .mockResolvedValueOnce({
        items: [mockItem1, mockItem2],
        page: 0,
        size: 20,
        totalItems: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      })
      .mockResolvedValueOnce({
        items: [mockItem1],
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });

    const { result } = await renderHook(() => useNotifications({ autoLoad: true }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.notifications).toHaveLength(2);

    await act(async () => {
      result.current.setMode('UNREAD');
    });

    expect(result.current.mode).toBe('UNREAD');
    expect(mockApi.getNotifications).toHaveBeenLastCalledWith({
      page: 0,
      size: 20,
      read: false,
      type: undefined,
      sort: 'createdAt,desc',
    });
    expect(result.current.notifications).toEqual([mockItem1]);
  });

  it('3. refresh() resets page to 0 and updates list', async () => {
    mockApi.getNotifications
      .mockResolvedValueOnce({
        items: [mockItem1],
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      })
      .mockResolvedValueOnce({
        items: [mockItem1, mockItem2],
        page: 0,
        size: 20,
        totalItems: 2,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });

    const { result } = await renderHook(() => useNotifications({ autoLoad: true }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.notifications).toHaveLength(1);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.refreshing).toBe(false);
  });

  it('4. loadMore() fetches next page and deduplicates items by ID', async () => {
    mockApi.getNotifications
      .mockResolvedValueOnce({
        items: [mockItem1],
        page: 0,
        size: 20,
        totalItems: 2,
        totalPages: 2,
        hasNext: true,
        hasPrevious: false,
      })
      .mockResolvedValueOnce({
        // Returns mockItem1 (duplicate) + mockItem2
        items: [mockItem1, mockItem2],
        page: 1,
        size: 20,
        totalItems: 2,
        totalPages: 2,
        hasNext: false,
        hasPrevious: true,
      });

    const { result } = await renderHook(() => useNotifications({ autoLoad: true }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.hasNext).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.notifications).toEqual([mockItem1, mockItem2]);
    expect(result.current.page).toBe(1);
    expect(result.current.hasNext).toBe(false);
  });

  it('5. loadMore() error preserves existing items and records paginationError', async () => {
    mockApi.getNotifications
      .mockResolvedValueOnce({
        items: [mockItem1],
        page: 0,
        size: 20,
        totalItems: 2,
        totalPages: 2,
        hasNext: true,
        hasPrevious: false,
      })
      .mockRejectedValueOnce(new Error('Network error on page 2'));

    const { result } = await renderHook(() => useNotifications({ autoLoad: true }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.notifications).toEqual([mockItem1]);

    await act(async () => {
      await result.current.loadMore();
    });

    // Existing notifications preserved
    expect(result.current.notifications).toEqual([mockItem1]);
    expect(result.current.paginationError).not.toBeNull();
  });
});
