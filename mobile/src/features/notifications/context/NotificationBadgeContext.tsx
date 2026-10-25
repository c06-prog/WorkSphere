/**
 * Phase 18A: Shared Notification Badge Context & Provider Foundation
 * Provides authoritative unread count state and helpers across authenticated application screens.
 * Source: Decision D-067 and 06_API_CONTRACT.md Section 15.4.
 *
 * Invariants:
 * - Authoritative baseline from GET /api/v1/notifications/unread-count.
 * - Never yields negative unread count.
 * - Non-polling (no setInterval, no background daemon).
 * - Only fetches when authenticated; resets to 0 upon unauthenticated / user switch.
 * - Coalesces concurrent in-flight requests.
 * - Synchronous useRef submission locks for mark operations prevent duplicate mutations.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from '../../../app/auth';
import { notificationApi } from '../api/notificationApi';
import { mapNotificationError, NotificationPresentationError } from '../errors/notificationErrorMapper';

export interface NotificationBadgeContextValue {
  unreadCount: number;
  isLoading: boolean;
  error: NotificationPresentationError | null;
  refreshUnreadCount: () => Promise<void>;
  applyNotificationRead: (notificationId: string) => void;
  applyAllRead: () => void;
}

export const NotificationBadgeContext = createContext<NotificationBadgeContextValue | null>(null);

export interface NotificationBadgeProviderProps {
  children: ReactNode;
}

export function NotificationBadgeProvider({ children }: NotificationBadgeProviderProps) {
  const { sessionState, currentUser } = useAuth();
  const isAuthenticated = sessionState === 'AUTHENTICATED' && !!currentUser?.id;
  const currentUserId = currentUser?.id ?? null;

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<NotificationPresentationError | null>(null);

  // Guards against concurrent in-flight refresh requests
  const refreshInFlightPromiseRef = useRef<Promise<void> | null>(null);
  // Tracks user session boundary to discard stale asynchronous responses
  const activeUserIdRef = useRef<string | null>(currentUserId);
  activeUserIdRef.current = currentUserId;

  // Set of notification IDs already decremented locally during current session
  const readNotificationIdsRef = useRef<Set<string>>(new Set<string>());

  /**
   * Fetches authoritative unread count from backend.
   * Coalesces concurrent in-flight calls and discards responses if user session changed.
   */
  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    if (!activeUserIdRef.current) {
      setUnreadCount(0);
      return;
    }

    if (refreshInFlightPromiseRef.current) {
      return refreshInFlightPromiseRef.current;
    }

    const userIdAtStart = activeUserIdRef.current;
    setIsLoading(true);
    setError(null);

    const promise = (async () => {
      try {
        const response = await notificationApi.getUnreadNotificationCount();
        if (activeUserIdRef.current === userIdAtStart) {
          setUnreadCount(Math.max(0, response.count));
        }
      } catch (err) {
        if (activeUserIdRef.current === userIdAtStart) {
          const presentationError = mapNotificationError(err, 'unreadCount');
          setError(presentationError);
        }
      } finally {
        if (activeUserIdRef.current === userIdAtStart) {
          setIsLoading(false);
        }
        refreshInFlightPromiseRef.current = null;
      }
    })();

    refreshInFlightPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Decrements unread count locally when an individual unread notification is marked read.
   * Prevents double-decrementing for the same notificationId.
   */
  const applyNotificationRead = useCallback((notificationId: string) => {
    if (!notificationId || typeof notificationId !== 'string') {
      return;
    }

    const trimmed = notificationId.trim();
    if (trimmed.length === 0 || readNotificationIdsRef.current.has(trimmed)) {
      return;
    }

    readNotificationIdsRef.current.add(trimmed);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Resets unread count to 0 when all notifications are marked read.
   */
  const applyAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Reset state on authentication change / user logout
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) {
      setUnreadCount(0);
      setIsLoading(false);
      setError(null);
      readNotificationIdsRef.current.clear();
      refreshInFlightPromiseRef.current = null;
      return;
    }

    // Authenticated initial load
    readNotificationIdsRef.current.clear();
    refreshUnreadCount().catch(() => {});
  }, [isAuthenticated, currentUserId, refreshUnreadCount]);

  const value = useMemo<NotificationBadgeContextValue>(
    () => ({
      unreadCount,
      isLoading,
      error,
      refreshUnreadCount,
      applyNotificationRead,
      applyAllRead,
    }),
    [unreadCount, isLoading, error, refreshUnreadCount, applyNotificationRead, applyAllRead]
  );

  return (
    <NotificationBadgeContext.Provider value={value}>
      {children}
    </NotificationBadgeContext.Provider>
  );
}

/**
 * Hook to consume NotificationBadgeContext.
 * Throws a clear error if used outside NotificationBadgeProvider.
 */
export function useNotificationBadge(): NotificationBadgeContextValue {
  const context = useContext(NotificationBadgeContext);
  if (!context) {
    throw new Error('useNotificationBadge must be used within a NotificationBadgeProvider');
  }
  return context;
}
