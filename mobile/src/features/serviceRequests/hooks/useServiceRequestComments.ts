/**
 * Phase 16F: useServiceRequestComments Custom Hook (SCR-SRV-05)
 * Manages paginated comment list, pull-to-refresh, load-more, and authoritative comment addition.
 * Aligned with backend ServiceRequestController.java and ServiceRequestApplicationService.java.
 *
 * Concurrency & Invariants:
 * - Monotonically increasing requestGenerationRef prevents stale page overwrites.
 * - Synchronous paginationLockRef prevents duplicate page fetching while in flight.
 * - Synchronous addingRef prevents double comment submission.
 * - Deduplication by comment.id while preserving backend ordering.
 * - Preserves existing comments on pull-to-refresh error, surfacing non-blocking refreshError.
 * - Discards older in-flight results when a new comment is added or refresh is triggered.
 * - Unmount safety via mountedRef.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { serviceRequestApi } from '../api/serviceRequestApi';
import { mapServiceRequestError, ServiceRequestPresentationError } from '../errors/serviceRequestErrorMapper';
import { CreateServiceCommentRequest, ServiceCommentResponse } from '../types/serviceRequestTypes';

export interface UseServiceRequestCommentsResult {
  comments: ServiceCommentResponse[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasNext: boolean;
  error: ServiceRequestPresentationError | null;
  refreshError: string | null;
  paginationError: string | null;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  addComment: (request: CreateServiceCommentRequest) => Promise<ServiceCommentResponse>;
}

const PAGE_SIZE = 20;

export function useServiceRequestComments(requestId: string): UseServiceRequestCommentsResult {
  const [comments, setComments] = useState<ServiceCommentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [error, setError] = useState<ServiceRequestPresentationError | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [paginationError, setPaginationError] = useState<string | null>(null);

  const mountedRef = useRef<boolean>(true);
  const requestGenerationRef = useRef<number>(0);
  const paginationLockRef = useRef<boolean>(false);
  const addingRef = useRef<boolean>(false);
  const inFlightPromiseRef = useRef<{ page: number; promise: Promise<void> } | null>(null);

  const fetchPage = useCallback(
    async (targetRequestId: string, pageNum: number, mode: 'initial' | 'refresh' | 'append'): Promise<void> => {
      if (!targetRequestId || targetRequestId.trim().length === 0) {
        return;
      }

      if (paginationLockRef.current && mode === 'append') {
        return;
      }

      paginationLockRef.current = true;
      const generation = ++requestGenerationRef.current;

      if (mode === 'initial') {
        setLoading(true);
        setError(null);
      } else if (mode === 'refresh') {
        setRefreshing(true);
        setRefreshError(null);
      } else if (mode === 'append') {
        setLoadingMore(true);
        setPaginationError(null);
      }

      let currentPromise: Promise<void> | null = null;
      currentPromise = (async () => {
        try {
          const pageData = await serviceRequestApi.getComments(targetRequestId, {
            page: pageNum,
            size: PAGE_SIZE,
            sort: 'createdAt,asc',
          });

          if (!mountedRef.current || generation !== requestGenerationRef.current) {
            return;
          }

          if (mode === 'append') {
            setComments(prev => {
              const existingIds = new Set(prev.map(c => c.id));
              const newItems = pageData.items.filter(c => !existingIds.has(c.id));
              return [...prev, ...newItems];
            });
          } else {
            setComments(pageData.items);
          }

          setCurrentPage(pageData.page);
          setHasNext(pageData.hasNext);
          setError(null);
          setRefreshError(null);
          setPaginationError(null);
        } catch (err: unknown) {
          if (!mountedRef.current || generation !== requestGenerationRef.current) {
            return;
          }

          const presentationErr = mapServiceRequestError(err);
          if (mode === 'refresh') {
            setRefreshError(presentationErr.message);
          } else if (mode === 'append') {
            setPaginationError(presentationErr.message);
          } else if (mode === 'initial') {
            setError(presentationErr);
          }
        } finally {
          if (mountedRef.current && generation === requestGenerationRef.current) {
            if (mode === 'initial') setLoading(false);
            if (mode === 'refresh') setRefreshing(false);
            if (mode === 'append') setLoadingMore(false);
          }
          if (inFlightPromiseRef.current?.promise === currentPromise) {
            inFlightPromiseRef.current = null;
          }
          paginationLockRef.current = false;
        }
      })();

      inFlightPromiseRef.current = { page: pageNum, promise: currentPromise };
      return currentPromise;
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;
    setComments([]);
    setCurrentPage(0);
    setHasNext(false);

    fetchPage(requestId, 0, 'initial');

    return () => {
      mountedRef.current = false;
      inFlightPromiseRef.current = null;
    };
  }, [requestId, fetchPage]);

  const load = useCallback(async (): Promise<void> => {
    return fetchPage(requestId, 0, 'initial');
  }, [requestId, fetchPage]);

  const refresh = useCallback(async (): Promise<void> => {
    return fetchPage(requestId, 0, 'refresh');
  }, [requestId, fetchPage]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasNext || loading || refreshing || loadingMore || paginationLockRef.current) {
      return;
    }
    return fetchPage(requestId, currentPage + 1, 'append');
  }, [requestId, hasNext, loading, refreshing, loadingMore, currentPage, fetchPage]);

  const addComment = useCallback(
    async (request: CreateServiceCommentRequest): Promise<ServiceCommentResponse> => {
      if (addingRef.current) {
        throw new Error('Đang gửi bình luận, vui lòng đợi');
      }

      addingRef.current = true;
      try {
        const created = await serviceRequestApi.createComment(requestId, request);

        // Invalidate older in-flight fetches so stale lists cannot overwrite
        requestGenerationRef.current++;
        inFlightPromiseRef.current = null;
        paginationLockRef.current = false;

        if (mountedRef.current) {
          setLoading(false);
          setError(null);
          setComments(prev => {
            if (prev.some(c => c.id === created.id)) {
              return prev.map(c => (c.id === created.id ? created : c));
            }
            return [...prev, created];
          });
        }
        return created;
      } finally {
        addingRef.current = false;
      }
    },
    [requestId]
  );

  return {
    comments,
    loading,
    refreshing,
    loadingMore,
    hasNext,
    error,
    refreshError,
    paginationError,
    load,
    refresh,
    loadMore,
    addComment,
  };
}
