/**
 * Phase 17B: useMyAssets Hook
 * Dedicated hook for querying personal assigned assets via GET /assets/my-assets.
 * Accessible to all authenticated employees without requiring ASSET_READ permission.
 *
 * Concurrency & Invariants:
 * - Query Generation: Monotonically increasing generation number tracking.
 * - Append Protection: Page N > 0 requests capture current generation; stale appends discarded.
 * - Deduplication: When merging pages, items are deduplicated by asset id preserving order.
 * - Stale Failure Rejection: A rejected stale query does not overwrite fresh data or set errors.
 * - Synchronous Pagination Lock: Two same-tick loadMore calls issue exactly one API request.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { assetApi } from '../api/assetApi';
import {
  AssetStatus,
  AssetSummaryResponse,
} from '../types/assetTypes';
import {
  mapAssetError,
  AssetPresentationError,
} from '../errors/assetErrorMapper';

export const ASSET_PAGE_SIZE = 20;
export const ASSET_DEFAULT_SORT = 'createdAt,desc';

export interface UseMyAssetsOptions {
  initialStatus?: AssetStatus;
  initialSort?: string;
  autoLoad?: boolean;
}

export interface UseMyAssetsResult {
  assets: AssetSummaryResponse[];
  totalItems: number;
  initialLoading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasNext: boolean;
  page: number;
  error: AssetPresentationError | null;
  paginationError: AssetPresentationError | null;
  refreshError: string | null;
  statusFilter: AssetStatus | undefined;
  setStatusFilter: (status: AssetStatus | undefined) => void;
  loadInitial: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  retryPagination: () => Promise<void>;
}

export function useMyAssets(options?: UseMyAssetsOptions): UseMyAssetsResult {
  const [assets, setAssets] = useState<AssetSummaryResponse[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<AssetPresentationError | null>(null);
  const [paginationError, setPaginationError] = useState<AssetPresentationError | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const [statusFilter, setStatusFilterState] = useState<AssetStatus | undefined>(
    options?.initialStatus
  );

  const sort = options?.initialSort ?? ASSET_DEFAULT_SORT;
  const autoLoad = options?.autoLoad ?? true;

  const mountedRef = useRef<boolean>(true);
  const queryGenerationRef = useRef<number>(0);
  const paginationLockRef = useRef<boolean>(false);

  const queryStateRef = useRef({
    statusFilter,
    sort,
    page,
    hasNext,
    assets,
  });
  queryStateRef.current = {
    statusFilter,
    sort,
    page,
    hasNext,
    assets,
  };

  const executeReplaceQuery = useCallback(
    async (
      activeStatus: AssetStatus | undefined,
      isRefresh: boolean
    ): Promise<void> => {
      const generation = ++queryGenerationRef.current;
      paginationLockRef.current = false;

      if (isRefresh) {
        setRefreshing(true);
        setRefreshError(null);
      } else {
        setInitialLoading(true);
        setError(null);
      }
      setPaginationError(null);

      try {
        const response = await assetApi.getMyAssets({
          page: 0,
          size: ASSET_PAGE_SIZE,
          sort,
          status: activeStatus,
        });

        if (!mountedRef.current || generation !== queryGenerationRef.current) {
          return;
        }

        setAssets(response.items);
        setTotalItems(response.totalItems);
        setPage(response.page);
        setHasNext(response.hasNext);
        setError(null);
        setPaginationError(null);
        setRefreshError(null);
      } catch (err: unknown) {
        if (!mountedRef.current || generation !== queryGenerationRef.current) {
          return;
        }

        const mapped = mapAssetError(err);
        if (isRefresh) {
          setRefreshError(mapped.message);
        } else {
          setError(mapped);
        }
      } finally {
        if (mountedRef.current && generation === queryGenerationRef.current) {
          if (isRefresh) {
            setRefreshing(false);
          } else {
            setInitialLoading(false);
          }
        }
      }
    },
    [sort]
  );

  const executeAppendQuery = useCallback(async (): Promise<void> => {
    const {
      statusFilter: currentStatus,
      page: currentPage,
      hasNext: canAppend,
    } = queryStateRef.current;

    if (!canAppend || paginationLockRef.current) {
      return;
    }

    paginationLockRef.current = true;
    setLoadingMore(true);
    setPaginationError(null);

    const generation = queryGenerationRef.current;
    const nextPage = currentPage + 1;

    try {
      const response = await assetApi.getMyAssets({
        page: nextPage,
        size: ASSET_PAGE_SIZE,
        sort,
        status: currentStatus,
      });

      if (!mountedRef.current || generation !== queryGenerationRef.current) {
        return;
      }

      setAssets(prevAssets => {
        const existingIds = new Set(prevAssets.map(a => a.id));
        const updatedPrev = prevAssets.map(a => {
          const fresh = response.items.find(item => item.id === a.id);
          return fresh ?? a;
        });

        const newItems: AssetSummaryResponse[] = [];
        for (const item of response.items) {
          if (!existingIds.has(item.id)) {
            newItems.push(item);
          }
        }
        return [...updatedPrev, ...newItems];
      });

      setTotalItems(response.totalItems);
      setPage(response.page);
      setHasNext(response.hasNext);
      setPaginationError(null);
    } catch (err: unknown) {
      if (!mountedRef.current || generation !== queryGenerationRef.current) {
        return;
      }
      setPaginationError(mapAssetError(err));
    } finally {
      paginationLockRef.current = false;
      if (mountedRef.current && generation === queryGenerationRef.current) {
        setLoadingMore(false);
      }
    }
  }, [sort]);

  const loadInitial = useCallback(async () => {
    await executeReplaceQuery(statusFilter, false);
  }, [executeReplaceQuery, statusFilter]);

  const refresh = useCallback(async () => {
    await executeReplaceQuery(statusFilter, true);
  }, [executeReplaceQuery, statusFilter]);

  const loadMore = useCallback(async () => {
    await executeAppendQuery();
  }, [executeAppendQuery]);

  const retryPagination = useCallback(async () => {
    await executeAppendQuery();
  }, [executeAppendQuery]);

  const setStatusFilter = useCallback(
    (newStatus: AssetStatus | undefined) => {
      setStatusFilterState(newStatus);
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;
    if (autoLoad) {
      executeReplaceQuery(statusFilter, false);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [autoLoad, executeReplaceQuery, statusFilter]);

  return {
    assets,
    totalItems,
    initialLoading,
    refreshing,
    loadingMore,
    hasNext,
    page,
    error,
    paginationError,
    refreshError,
    statusFilter,
    setStatusFilter,
    loadInitial,
    refresh,
    loadMore,
    retryPagination,
  };
}
