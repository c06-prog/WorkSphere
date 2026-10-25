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

  const autoLoad = options?.autoLoad ?? true;

  const mountedRef = useRef<boolean>(true);
  const queryGenerationRef = useRef<number>(0);
  const paginationLockRef = useRef<boolean>(false);

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
  };
}
