/**
 * Phase 16B: useServiceRequests Custom Hook
 * Manages service request list querying, 300ms search debouncing, category/status/priority filters,
 * pagination, pull-to-refresh, and latest-query-wins concurrency.
 *
 * Concurrency & Invariants:
 * - Query Generation: Monotonically increasing generation number. Every new effective query
 *   (debounced search change, filter change, pull-to-refresh) increments generation.
 * - Append Protection: Page N > 0 requests capture current generation; stale append responses
 *   are discarded if query changed before append response arrived.
 * - Deduplication: When merging pages, items are deduplicated by id preserving backend order.
 * - Stale Failure Rejection: A rejected stale query does not overwrite fresh data or set errors.
 * - Synchronous Pagination Lock: Two same-tick loadMore calls issue exactly one API request.
 * - Safe Category Loading: Loads active categories once on mount safely without blocking request list.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { serviceRequestApi } from '../api/serviceRequestApi';
import {
  ServiceCategoryResponse,
  ServicePriority,
  ServiceRequestSummaryResponse,
  ServiceStatus,
} from '../types/serviceRequestTypes';
import {
  mapServiceRequestError,
  ServiceRequestPresentationError,
} from '../errors/serviceRequestErrorMapper';

export const PAGE_SIZE = 20;
export const DEFAULT_SORT = 'createdAt,desc';

export interface UseServiceRequestsOptions {
  initialStatus?: ServiceStatus;
  initialPriority?: ServicePriority;
  initialCategoryId?: string;
  initialSort?: string;
}

export interface UseServiceRequestsResult {
  requests: ServiceRequestSummaryResponse[];
  totalItems: number;
  initialLoading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasNext: boolean;
  page: number;
  error: ServiceRequestPresentationError | null;
  paginationError: ServiceRequestPresentationError | null;
  refreshError: string | null;
  search: string;
  setSearch: (text: string) => void;
  statusFilter: ServiceStatus | undefined;
  setStatusFilter: (status: ServiceStatus | undefined) => void;
  priorityFilter: ServicePriority | undefined;
  setPriorityFilter: (priority: ServicePriority | undefined) => void;
  categoryFilter: string | undefined;
  setCategoryFilter: (categoryId: string | undefined) => void;
  categories: ServiceCategoryResponse[];
  loadInitial: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  retryPagination: () => Promise<void>;
  clearFilters: () => void;
}

export function useServiceRequests(
  options?: UseServiceRequestsOptions
): UseServiceRequestsResult {
  const [requests, setRequests] = useState<ServiceRequestSummaryResponse[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<ServiceRequestPresentationError | null>(null);
  const [paginationError, setPaginationError] = useState<ServiceRequestPresentationError | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Raw user input in search box
  const [search, setSearchState] = useState<string>('');
  // Effective debounced search parameter sent to backend
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilterState] = useState<ServiceStatus | undefined>(
    options?.initialStatus
  );
  const [priorityFilter, setPriorityFilterState] = useState<ServicePriority | undefined>(
    options?.initialPriority
  );
  const [categoryFilter, setCategoryFilterState] = useState<string | undefined>(
    options?.initialCategoryId
  );
  const [categories, setCategories] = useState<ServiceCategoryResponse[]>([]);

  const sort = options?.initialSort ?? DEFAULT_SORT;

  const mountedRef = useRef<boolean>(true);
  const queryGenerationRef = useRef<number>(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paginationLockRef = useRef<boolean>(false);

  // Keep latest state in ref for asynchronous query evaluation
  const queryStateRef = useRef({
    debouncedSearch,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sort,
    page,
    hasNext,
    requests,
  });
  queryStateRef.current = {
    debouncedSearch,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sort,
    page,
    hasNext,
    requests,
  };

  /**
   * Executes a replace query (page = 0) with the provided search and filters.
   * Discards stale responses via queryGenerationRef.
   */
  const executeReplaceQuery = useCallback(
    async (
      activeSearch: string,
      activeStatus: ServiceStatus | undefined,
      activePriority: ServicePriority | undefined,
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
        const response = await serviceRequestApi.listServiceRequests({
          page: 0,
          size: PAGE_SIZE,
          sort,
          search: trimmedSearch.length > 0 ? trimmedSearch : undefined,
          status: activeStatus,
          priority: activePriority,
          categoryId: activeCategoryId,
        });

        if (!mountedRef.current || generation !== queryGenerationRef.current) {
          return;
        }

        setRequests(response.items);
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

        const mapped = mapServiceRequestError(err);
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

  /**
   * Appends next page (page + 1) for the current active query.
   */
  const executeAppendQuery = useCallback(async (): Promise<void> => {
    const {
      debouncedSearch: currentSearch,
      statusFilter: currentStatus,
      priorityFilter: currentPriority,
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
      const response = await serviceRequestApi.listServiceRequests({
        page: nextPage,
        size: PAGE_SIZE,
        sort,
        search: trimmedSearch.length > 0 ? trimmedSearch : undefined,
        status: currentStatus,
        priority: currentPriority,
        categoryId: currentCategoryId,
      });

      if (!mountedRef.current || generation !== queryGenerationRef.current) {
        return;
      }

      setRequests(prevRequests => {
        // Merge & deduplicate by request id, preserving original ordering
        const existingIds = new Set(prevRequests.map(r => r.id));
        const updatedPrev = prevRequests.map(r => {
          const fresh = response.items.find(item => item.id === r.id);
          return fresh ?? r;
        });

        const newItems: ServiceRequestSummaryResponse[] = [];
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

      setPaginationError(mapServiceRequestError(err));
    } finally {
      paginationLockRef.current = false;
      if (mountedRef.current && generation === queryGenerationRef.current) {
        setLoadingMore(false);
      }
    }
  }, [sort]);

  /**
   * Search input with 300ms debounce
   */
  const setSearch = useCallback((text: string) => {
    setSearchState(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 300);
  }, []);

  /**
   * Status filter setter resets page and issues replace query
   */
  const setStatusFilter = useCallback((newStatus: ServiceStatus | undefined) => {
    setStatusFilterState(newStatus);
  }, []);

  /**
   * Priority filter setter resets page and issues replace query
   */
  const setPriorityFilter = useCallback((newPriority: ServicePriority | undefined) => {
    setPriorityFilterState(newPriority);
  }, []);

  /**
   * Category filter setter resets page and issues replace query
   */
  const setCategoryFilter = useCallback((newCategoryId: string | undefined) => {
    setCategoryFilterState(newCategoryId);
  }, []);

  /**
   * Safe Category Options Loader (runs once on mount)
   */
  useEffect(() => {
    let active = true;
    serviceRequestApi
      .listCategories()
      .then(cats => {
        if (active && mountedRef.current) {
          setCategories(cats);
        }
      })
      .catch(() => {
        // Non-blocking: category filter list failure must not destroy request list
      });

    return () => {
      active = false;
    };
  }, []);

  /**
   * Triggers query replacement whenever debounced search or filters change.
   */
  useEffect(() => {
    executeReplaceQuery(debouncedSearch, statusFilter, priorityFilter, categoryFilter, false);
  }, [debouncedSearch, statusFilter, priorityFilter, categoryFilter, executeReplaceQuery]);

  /**
   * Manual load / retry initial
   */
  const loadInitial = useCallback(() => {
    return executeReplaceQuery(
      debouncedSearch,
      statusFilter,
      priorityFilter,
      categoryFilter,
      false
    );
  }, [debouncedSearch, statusFilter, priorityFilter, categoryFilter, executeReplaceQuery]);

  /**
   * Pull-to-refresh
   */
  const refresh = useCallback(() => {
    return executeReplaceQuery(
      debouncedSearch,
      statusFilter,
      priorityFilter,
      categoryFilter,
      true
    );
  }, [debouncedSearch, statusFilter, priorityFilter, categoryFilter, executeReplaceQuery]);

  /**
   * Load more pagination
   */
  const loadMore = useCallback(() => {
    if (initialLoading || refreshing || loadingMore || !hasNext || !!error) {
      return Promise.resolve();
    }
    return executeAppendQuery();
  }, [initialLoading, refreshing, loadingMore, hasNext, error, executeAppendQuery]);

  /**
   * Retry pagination
   */
  const retryPagination = useCallback(() => {
    return executeAppendQuery();
  }, [executeAppendQuery]);

  /**
   * Clear all filters and search
   */
  const clearFilters = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSearchState('');
    setDebouncedSearch('');
    setStatusFilterState(undefined);
    setPriorityFilterState(undefined);
    setCategoryFilterState(undefined);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    requests,
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
    priorityFilter,
    setPriorityFilter,
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
