/**
 * Phase 17B: useAssets Hook
 * Dedicated hook for querying company-wide asset directory via GET /assets.
 * Only invoked if the user holds ASSET_READ permission or ADMIN role.
 *
 * Concurrency & Invariants:
 * - Query Generation: Monotonically increasing generation number tracking.
 * - Append Protection: Page N > 0 requests capture current generation; stale appends discarded.
 * - Deduplication: When merging pages, items are deduplicated by asset id preserving order.
 * - Stale Failure Rejection: A rejected stale query does not overwrite fresh data or set errors.
 * - Synchronous Pagination Lock: Two same-tick loadMore calls issue exactly one API request.
 * - Active categories queried once on mount safely.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { assetApi } from '../api/assetApi';
import {
  AssetCategoryResponse,
  AssetStatus,
  AssetSummaryResponse,
} from '../types/assetTypes';
import {
  mapAssetError,
  AssetPresentationError,
} from '../errors/assetErrorMapper';

export const ASSET_PAGE_SIZE = 20;
export const ASSET_DEFAULT_SORT = 'createdAt,desc';

export interface UseAssetsOptions {
  initialStatus?: AssetStatus;
  initialCategoryId?: string;
  initialSort?: string;
  autoLoad?: boolean;
}

export interface UseAssetsResult {
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
  search: string;
  setSearch: (text: string) => void;
  statusFilter: AssetStatus | undefined;
  setStatusFilter: (status: AssetStatus | undefined) => void;
  categoryFilter: string | undefined;
  setCategoryFilter: (categoryId: string | undefined) => void;
  categories: AssetCategoryResponse[];
  loadInitial: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  retryPagination: () => Promise<void>;
  clearFilters: () => void;
}

export function useAssets(options?: UseAssetsOptions): UseAssetsResult {
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

  const [search, setSearchState] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilterState] = useState<AssetStatus | undefined>(
    options?.initialStatus
  );
  const [categoryFilter, setCategoryFilterState] = useState<string | undefined>(
    options?.initialCategoryId
  );
  const [categories, setCategories] = useState<AssetCategoryResponse[]>([]);

  const sort = options?.initialSort ?? ASSET_DEFAULT_SORT;
  const autoLoad = options?.autoLoad ?? false;

  const mountedRef = useRef<boolean>(true);
  const queryGenerationRef = useRef<number>(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paginationLockRef = useRef<boolean>(false);

  const queryStateRef = useRef({
    debouncedSearch,
    statusFilter,
    categoryFilter,
    sort,
    page,
    hasNext,
    assets,
  });
  queryStateRef.current = {
    debouncedSearch,
    statusFilter,
    categoryFilter,
    sort,
    page,
    hasNext,
    assets,
  };

  const executeReplaceQuery = useCallback(
    async (
      activeSearch: string,
      activeStatus: AssetStatus | undefined,
      activeCategoryId: string | undefined,
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

      const trimmedSearch = activeSearch.trim();

      try {
        const response = await assetApi.getAssets({
          page: 0,
          size: ASSET_PAGE_SIZE,
          sort,
          search: trimmedSearch.length > 0 ? trimmedSearch : undefined,
          status: activeStatus,
          categoryId: activeCategoryId,
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
      debouncedSearch: currentSearch,
      statusFilter: currentStatus,
      categoryFilter: currentCategoryId,
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
    const trimmedSearch = currentSearch.trim();

    try {
      const response = await assetApi.getAssets({
        page: nextPage,
        size: ASSET_PAGE_SIZE,
        sort,
        search: trimmedSearch.length > 0 ? trimmedSearch : undefined,
        status: currentStatus,
        categoryId: currentCategoryId,
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

  const setSearch = useCallback((text: string) => {
    setSearchState(text);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 300);
  }, []);

  const setStatusFilter = useCallback((newStatus: AssetStatus | undefined) => {
    setStatusFilterState(newStatus);
  }, []);

  const setCategoryFilter = useCallback((newCategory: string | undefined) => {
    setCategoryFilterState(newCategory);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchState('');
    setDebouncedSearch('');
    setStatusFilterState(undefined);
    setCategoryFilterState(undefined);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  const loadInitial = useCallback(async () => {
    await executeReplaceQuery(debouncedSearch, statusFilter, categoryFilter, false);
  }, [categoryFilter, debouncedSearch, executeReplaceQuery, statusFilter]);

  const refresh = useCallback(async () => {
    await executeReplaceQuery(debouncedSearch, statusFilter, categoryFilter, true);
  }, [categoryFilter, debouncedSearch, executeReplaceQuery, statusFilter]);

  const loadMore = useCallback(async () => {
    await executeAppendQuery();
  }, [executeAppendQuery]);

  const retryPagination = useCallback(async () => {
    await executeAppendQuery();
  }, [executeAppendQuery]);

  // Load active categories safely on mount
  useEffect(() => {
    let active = true;
    assetApi
      .listCategories()
      .then(cats => {
        if (active && Array.isArray(cats)) {
          setCategories(cats.filter(c => c.active));
        }
      })
      .catch(() => {
        // Safe degrade: Category filter chips simply remain empty
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (autoLoad) {
      executeReplaceQuery(debouncedSearch, statusFilter, categoryFilter, false);
    }
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [autoLoad, categoryFilter, debouncedSearch, executeReplaceQuery, statusFilter]);

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
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    loadInitial,
    refresh,
    loadMore,
    retryPagination,
    clearFilters,
  };
}
