/**
 * Phase 18B: useNotifications Hook
 * Dedicated hook for querying paginated user notifications via GET /notifications.
 * Supports:
 * - Filter mode: "Tất cả" (read=undefined) and "Chưa đọc" (read=false).
 * - Pagination (page, size, totalItems, hasNext).
 * - Monotonically increasing query generation counter rejecting stale responses.
 * - Synchronous pagination lock preventing duplicate loadMore calls.
 * - Deduplication by notification id preserving list order.
 * - Pull-to-refresh resetting to page 0 while preserving existing view until new data arrives.
 * - Retaining current page items if load-more fails.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useNotificationBadge } from '../context/NotificationBadgeContext';
import {
  NotificationListQuery,
  NotificationResponse,
  NotificationType,
} from '../types/notificationTypes';
import {
  mapNotificationError,
  NotificationPresentationError,
} from '../errors/notificationErrorMapper';

export const NOTIFICATION_PAGE_SIZE = 20;
export const NOTIFICATION_DEFAULT_SORT = 'createdAt,desc';

export type NotificationTabMode = 'ALL' | 'UNREAD';

export interface UseNotificationsOptions {
  initialMode?: NotificationTabMode;
  initialType?: NotificationType;
  autoLoad?: boolean;
}

export interface UseNotificationsResult {
  notifications: NotificationResponse[];
  totalItems: number;
  mode: NotificationTabMode;
  setMode: (mode: NotificationTabMode) => void;
  typeFilter: NotificationType | undefined;
  setTypeFilter: (type: NotificationType | undefined) => void;
  initialLoading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasNext: boolean;
  page: number;
  error: NotificationPresentationError | null;
  paginationError: NotificationPresentationError | null;
  refreshError: string | null;
  loadInitial: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  retryPagination: () => Promise<void>;
  markOneAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<number>;
  isMarkingId: (id: string) => boolean;
  isMarkingAll: boolean;
  mutationError: NotificationPresentationError | null;
  clearMutationError: () => void;
}

export function useNotifications(options?: UseNotificationsOptions): UseNotificationsResult {
  const [mode, setModeState] = useState<NotificationTabMode>(options?.initialMode ?? 'ALL');
  const [typeFilter, setTypeFilterState] = useState<NotificationType | undefined>(options?.initialType);

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<NotificationPresentationError | null>(null);
  const [paginationError, setPaginationError] = useState<NotificationPresentationError | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<NotificationPresentationError | null>(null);
  const [markingIds, setMarkingIds] = useState<Record<string, boolean>>({});
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const { applyNotificationRead, applyAllRead, refreshUnreadCount } = useNotificationBadge();

  const autoLoad = options?.autoLoad ?? true;

  const mountedRef = useRef<boolean>(true);
  const queryGenerationRef = useRef<number>(0);
  const paginationLockRef = useRef<boolean>(false);
  const markingIdsRef = useRef<Set<string>>(new Set<string>());
  const markingAllRef = useRef<boolean>(false);

  // Track latest query state to guard against concurrent mutations and stale callbacks
  const queryStateRef = useRef({
    mode,
    typeFilter,
    page,
    hasNext,
    notifications,
  });

  queryStateRef.current = {
    mode,
    typeFilter,
    page,
    hasNext,
    notifications,
  };

  /**
   * Builds canonical API query from current filter state.
   */
  const buildQuery = useCallback(
    (targetPage: number): NotificationListQuery => {
      const read = mode === 'UNREAD' ? false : undefined;
      return {
        page: targetPage,
        size: NOTIFICATION_PAGE_SIZE,
        read,
        type: typeFilter,
        sort: NOTIFICATION_DEFAULT_SORT,
      };
    },
    [mode, typeFilter]
  );

  /**
   * Deduplicates array of notifications by ID preserving sequential order.
   */
  const deduplicateItems = useCallback(
    (existing: NotificationResponse[], incoming: NotificationResponse[]): NotificationResponse[] => {
      const seen = new Set<string>();
      const result: NotificationResponse[] = [];

      for (const item of existing) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          result.push(item);
        }
      }

      for (const item of incoming) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          result.push(item);
        }
      }

      return result;
    },
    []
  );

  /**
   * Initial page load for the active filter set.
   */
  const loadInitial = useCallback(async (): Promise<void> => {
    queryGenerationRef.current += 1;
    const currentGeneration = queryGenerationRef.current;

    setInitialLoading(true);
    setError(null);
    setPaginationError(null);
    setRefreshError(null);

    try {
      const query = buildQuery(0);
      const data = await notificationApi.getNotifications(query);

      if (!mountedRef.current || currentGeneration !== queryGenerationRef.current) {
        return;
      }

      setNotifications(data.items);
      setTotalItems(data.totalItems);
      setPage(data.page);
      setHasNext(data.hasNext);
      setError(null);
    } catch (err) {
      if (!mountedRef.current || currentGeneration !== queryGenerationRef.current) {
        return;
      }
      const presentationError = mapNotificationError(err, 'list');
      setError(presentationError);
    } finally {
      if (mountedRef.current && currentGeneration === queryGenerationRef.current) {
        setInitialLoading(false);
      }
    }
  }, [buildQuery]);

  /**
   * Pull-to-refresh resetting to page 0 while preserving existing visible list during loading.
   */
  const refresh = useCallback(async (): Promise<void> => {
    queryGenerationRef.current += 1;
    const currentGeneration = queryGenerationRef.current;

    setRefreshing(true);
    setRefreshError(null);
    setPaginationError(null);

    try {
      const query = buildQuery(0);
      const data = await notificationApi.getNotifications(query);

      if (!mountedRef.current || currentGeneration !== queryGenerationRef.current) {
        return;
      }

      setNotifications(data.items);
      setTotalItems(data.totalItems);
      setPage(data.page);
      setHasNext(data.hasNext);
      setError(null);
    } catch (err) {
      if (!mountedRef.current || currentGeneration !== queryGenerationRef.current) {
        return;
      }
      const presentationError = mapNotificationError(err, 'list');
      setRefreshError(presentationError.message);
    } finally {
      if (mountedRef.current && currentGeneration === queryGenerationRef.current) {
        setRefreshing(false);
      }
    }
  }, [buildQuery]);

  /**
   * Loads next page of notifications.
   */
  const loadMore = useCallback(async (): Promise<void> => {
    if (
      paginationLockRef.current ||
      !queryStateRef.current.hasNext ||
      loadingMore ||
      initialLoading ||
      refreshing
    ) {
      return;
    }

    paginationLockRef.current = true;
    const currentGeneration = queryGenerationRef.current;
    const nextPage = queryStateRef.current.page + 1;

    setLoadingMore(true);
    setPaginationError(null);

    try {
      const query = buildQuery(nextPage);
      const data = await notificationApi.getNotifications(query);

      if (!mountedRef.current || currentGeneration !== queryGenerationRef.current) {
        return;
      }

      setNotifications((prev) => deduplicateItems(prev, data.items));
      setTotalItems(data.totalItems);
      setPage(data.page);
      setHasNext(data.hasNext);
    } catch (err) {
      if (!mountedRef.current || currentGeneration !== queryGenerationRef.current) {
        return;
      }
      const presentationError = mapNotificationError(err, 'list');
      setPaginationError(presentationError);
    } finally {
      paginationLockRef.current = false;
      if (mountedRef.current && currentGeneration === queryGenerationRef.current) {
        setLoadingMore(false);
      }
    }
  }, [buildQuery, deduplicateItems, initialLoading, loadingMore, refreshing]);

  const retryPagination = useCallback(async (): Promise<void> => {
    setPaginationError(null);
    await loadMore();
  }, [loadMore]);

  /**
   * Marks a single notification as read with synchronous useRef lock protection.
   */
  const markOneAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      if (!notificationId || typeof notificationId !== 'string') {
        return false;
      }

      const trimmed = notificationId.trim();
      if (trimmed.length === 0 || markingIdsRef.current.has(trimmed)) {
        return false;
      }

      // Find item in state; if already read, no-op immediately
      const item = queryStateRef.current.notifications.find((n) => n.id === trimmed);
      if (item && item.read) {
        return true;
      }

      // Acquire synchronous lock before async hop
      markingIdsRef.current.add(trimmed);
      setMarkingIds((prev) => ({ ...prev, [trimmed]: true }));
      setMutationError(null);

      try {
        await notificationApi.markNotificationRead(trimmed);

        // Update list items deterministically
        setNotifications((prev) => {
          if (queryStateRef.current.mode === 'UNREAD') {
            return prev.filter((n) => n.id !== trimmed);
          }
          return prev.map((n) => (n.id === trimmed ? { ...n, read: true } : n));
        });

        if (queryStateRef.current.mode === 'UNREAD') {
          setTotalItems((prev) => Math.max(0, prev - 1));
        }

        // Notify badge context
        applyNotificationRead(trimmed);
        return true;
      } catch (err) {
        const presentationError = mapNotificationError(err, 'markRead');
        setMutationError(presentationError);
        return false;
      } finally {
        markingIdsRef.current.delete(trimmed);
        if (mountedRef.current) {
          setMarkingIds((prev) => {
            const next = { ...prev };
            delete next[trimmed];
            return next;
          });
        }
      }
    },
    [applyNotificationRead]
  );

  /**
   * Marks all notifications as read with synchronous useRef lock protection.
   */
  const markAllAsRead = useCallback(async (): Promise<number> => {
    if (markingAllRef.current) {
      return 0;
    }

    // Acquire synchronous lock before async hop
    markingAllRef.current = true;
    setIsMarkingAll(true);
    setMutationError(null);

    try {
      const response = await notificationApi.markAllNotificationsRead();

      // Invalidate current query generation to discard in-flight stale list responses
      queryGenerationRef.current += 1;

      // Update local state
      setNotifications((prev) => {
        if (queryStateRef.current.mode === 'UNREAD') {
          return [];
        }
        return prev.map((n) => ({ ...n, read: true }));
      });

      if (queryStateRef.current.mode === 'UNREAD') {
        setTotalItems(0);
        setHasNext(false);
      }

      // Reset badge context to 0 immediately
      applyAllRead();

      // Trigger background authoritative badge refresh
      refreshUnreadCount().catch(() => {});

      return response.updatedCount;
    } catch (err) {
      const presentationError = mapNotificationError(err, 'markAllRead');
      setMutationError(presentationError);
      return 0;
    } finally {
      markingAllRef.current = false;
      if (mountedRef.current) {
        setIsMarkingAll(false);
      }
    }
  }, [applyAllRead, refreshUnreadCount]);

  const isMarkingId = useCallback((id: string): boolean => {
    return !!markingIds[id];
  }, [markingIds]);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  /**
   * Changes active mode tab ("Tất cả" vs "Chưa đọc").
   */
  const setMode = useCallback((newMode: NotificationTabMode) => {
    setModeState(newMode);
    setNotifications([]);
    setPage(0);
    setHasNext(false);
  }, []);

  /**
   * Sets optional notification type filter.
   */
  const setTypeFilter = useCallback((newType: NotificationType | undefined) => {
    setTypeFilterState(newType);
    setNotifications([]);
    setPage(0);
    setHasNext(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      queryGenerationRef.current += 1;
    };
  }, []);

  // Load when mode or filter changes
  useEffect(() => {
    if (autoLoad) {
      loadInitial().catch(() => {});
    }
  }, [autoLoad, loadInitial]);

  return {
    notifications,
    totalItems,
    mode,
    setMode,
    typeFilter,
    setTypeFilter,
    initialLoading,
    refreshing,
    loadingMore,
    hasNext,
    page,
    error,
    paginationError,
    refreshError,
    loadInitial,
    refresh,
    loadMore,
    retryPagination,
    markOneAsRead,
    markAllAsRead,
    isMarkingId,
    isMarkingAll,
    mutationError,
    clearMutationError,
  };
}
