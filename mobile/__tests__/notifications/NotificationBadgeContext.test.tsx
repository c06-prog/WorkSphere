import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import {
  NotificationBadgeProvider,
  useNotificationBadge,
} from '../../src/features/notifications/context/NotificationBadgeContext';
import { notificationApi } from '../../src/features/notifications/api/notificationApi';
import { useAuth } from '../../src/app/auth';

jest.mock('../../src/features/notifications/api/notificationApi', () => ({
  notificationApi: {
    getUnreadNotificationCount: jest.fn(),
  },
}));

jest.mock('../../src/app/auth', () => ({
  useAuth: jest.fn(),
}));

describe('NotificationBadgeContext & Provider', () => {
  const mockApi = notificationApi as jest.Mocked<typeof notificationApi>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NotificationBadgeProvider>{children}</NotificationBadgeProvider>
  );

  it('throws error if useNotificationBadge is used outside provider', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(async () => {
      await renderHook(() => useNotificationBadge());
    }).rejects.toThrow('useNotificationBadge must be used within a NotificationBadgeProvider');
    spy.mockRestore();
  });

  it('does NOT fetch count when session is UNAUTHENTICATED', async () => {
    mockUseAuth.mockReturnValue({
      sessionState: 'UNAUTHENTICATED',
      currentUser: null,
    } as any);

    const { result } = await renderHook(() => useNotificationBadge(), { wrapper });

    expect(result.current.unreadCount).toBe(0);
    expect(mockApi.getUnreadNotificationCount).not.toHaveBeenCalled();
  });

  it('fetches unread count on mount when session is AUTHENTICATED', async () => {
    mockUseAuth.mockReturnValue({
      sessionState: 'AUTHENTICATED',
      currentUser: { id: 'user-uuid-1', email: 'user@worksphere.com' } as any,
    } as any);

    mockApi.getUnreadNotificationCount.mockResolvedValueOnce({ count: 5 });

    const { result } = await renderHook(() => useNotificationBadge(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.unreadCount).toBe(5);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('refreshUnreadCount updates count and coalesces concurrent in-flight requests', async () => {
    mockUseAuth.mockReturnValue({
      sessionState: 'AUTHENTICATED',
      currentUser: { id: 'user-uuid-1' } as any,
    } as any);

    mockApi.getUnreadNotificationCount
      .mockResolvedValueOnce({ count: 5 })
      .mockResolvedValueOnce({ count: 8 });

    const { result } = await renderHook(() => useNotificationBadge(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.unreadCount).toBe(5);

    // Call refresh concurrently twice
    let p1!: Promise<void>;
    let p2!: Promise<void>;
    await act(async () => {
      p1 = result.current.refreshUnreadCount();
      p2 = result.current.refreshUnreadCount();
      await Promise.all([p1, p2]);
    });

    // Should only trigger ONE additional API call due to promise coalescing
    expect(mockApi.getUnreadNotificationCount).toHaveBeenCalledTimes(2);
    expect(result.current.unreadCount).toBe(8);
  });

  it('applyNotificationRead decrements count and prevents double-decrement for same ID', async () => {
    mockUseAuth.mockReturnValue({
      sessionState: 'AUTHENTICATED',
      currentUser: { id: 'user-uuid-1' } as any,
    } as any);

    mockApi.getUnreadNotificationCount.mockResolvedValueOnce({ count: 3 });

    const { result } = await renderHook(() => useNotificationBadge(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.unreadCount).toBe(3);

    await act(async () => {
      result.current.applyNotificationRead('notif-1');
    });
    expect(result.current.unreadCount).toBe(2);

    // Same notificationId should NOT decrement again
    await act(async () => {
      result.current.applyNotificationRead('notif-1');
    });
    expect(result.current.unreadCount).toBe(2);

    // Different notificationId decrements
    await act(async () => {
      result.current.applyNotificationRead('notif-2');
    });
    expect(result.current.unreadCount).toBe(1);
  });

  it('count never drops below zero', async () => {
    mockUseAuth.mockReturnValue({
      sessionState: 'AUTHENTICATED',
      currentUser: { id: 'user-uuid-1' } as any,
    } as any);

    mockApi.getUnreadNotificationCount.mockResolvedValueOnce({ count: 1 });

    const { result } = await renderHook(() => useNotificationBadge(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.unreadCount).toBe(1);

    await act(async () => {
      result.current.applyNotificationRead('notif-1');
      result.current.applyNotificationRead('notif-2');
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it('applyAllRead resets count to zero immediately', async () => {
    mockUseAuth.mockReturnValue({
      sessionState: 'AUTHENTICATED',
      currentUser: { id: 'user-uuid-1' } as any,
    } as any);

    mockApi.getUnreadNotificationCount.mockResolvedValueOnce({ count: 10 });

    const { result } = await renderHook(() => useNotificationBadge(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.unreadCount).toBe(10);

    await act(async () => {
      result.current.applyAllRead();
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it('handles API errors gracefully without crashing', async () => {
    mockUseAuth.mockReturnValue({
      sessionState: 'AUTHENTICATED',
      currentUser: { id: 'user-uuid-1' } as any,
    } as any);

    mockApi.getUnreadNotificationCount.mockRejectedValueOnce(new Error('Network failure'));

    const { result } = await renderHook(() => useNotificationBadge(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Không thể cập nhật số lượng thông báo chưa đọc.');
  });
});
