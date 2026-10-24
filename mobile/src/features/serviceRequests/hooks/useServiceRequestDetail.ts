/**
 * Phase 16C: useServiceRequestDetail Custom Hook
 * Manages service request detail loading, error mapping, pull-to-refresh,
 * same-resource deduplication, and cross-resource generation supersession.
 *
 * Concurrency & Invariants:
 * - Request Generation: Monotonically increasing generation number per request.
 *   If route/requestId changes (A -> B), B receives generation > A. Even if A resolves
 *   after B, A's response is discarded because generation !== current.
 * - Deduplication: Concurrent same-tick calls for the SAME requestId share the in-flight promise.
 * - In-flight Ownership: Finally block only clears inFlightPromiseRef if the finished request
 *   matches targetId, preventing newer requests from having their lock prematurely cleared.
 * - Resource-ID Transition: Clears prior request data on ID change, setting initialLoading=true
 *   to prevent stale data flash.
 * - Unmount Safety: Checks mountedRef before any state commit.
 * - Refresh Safety: Failed refresh retains existing request data and surfaces non-blocking refreshError.
 * - Mutation Invalidation Foundation: applyServiceRequestUpdate sets authoritative detail,
 *   increments generation, and clears in-flight promises.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { serviceRequestApi } from '../api/serviceRequestApi';
import { ServiceRequestDetailResponse } from '../types/serviceRequestTypes';
import {
  mapServiceRequestError,
  ServiceRequestPresentationError,
} from '../errors/serviceRequestErrorMapper';

export interface UseServiceRequestDetailResult {
  request: ServiceRequestDetailResponse | null;
  initialLoading: boolean;
  refreshing: boolean;
  error: ServiceRequestPresentationError | null;
  refreshError: string | null;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  invalidateAndRefresh: () => Promise<void>;
  applyServiceRequestUpdate: (updated: ServiceRequestDetailResponse) => void;
}

export function useServiceRequestDetail(requestId: string): UseServiceRequestDetailResult {
  const [request, setRequest] = useState<ServiceRequestDetailResponse | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ServiceRequestPresentationError | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const mountedRef = useRef<boolean>(true);
  const requestGenerationRef = useRef<number>(0);
  const inFlightPromiseRef = useRef<{ id: string; promise: Promise<void> } | null>(null);

  const executeFetch = useCallback(
    async (targetId: string, isRefresh: boolean): Promise<void> => {
      if (!targetId || targetId.trim().length === 0) {
        return;
      }

      // Check same-resource in-flight deduplication
      if (
        inFlightPromiseRef.current &&
        inFlightPromiseRef.current.id === targetId &&
        !isRefresh
      ) {
        return inFlightPromiseRef.current.promise;
      }

      const generation = ++requestGenerationRef.current;

      if (isRefresh) {
        setRefreshing(true);
        setRefreshError(null);
      } else {
        setInitialLoading(true);
        setError(null);
      }

      let currentPromise: Promise<void> | null = null;
      currentPromise = (async () => {
        try {
          const data = await serviceRequestApi.getServiceRequestDetail(targetId);

          if (!mountedRef.current || generation !== requestGenerationRef.current) {
            return;
          }

          setRequest(data);
          setError(null);
          setRefreshError(null);
        } catch (err: unknown) {
          if (!mountedRef.current || generation !== requestGenerationRef.current) {
            return;
          }

          const mapped = mapServiceRequestError(err);
          if (isRefresh) {
            setRefreshError(mapped.message);
          } else {
            setError(mapped);
          }
        } finally {
          if (inFlightPromiseRef.current?.promise === currentPromise) {
            inFlightPromiseRef.current = null;
          }

          if (mountedRef.current && generation === requestGenerationRef.current) {
            if (isRefresh) {
              setRefreshing(false);
            } else {
              setInitialLoading(false);
            }
          }
        }
      })();

      inFlightPromiseRef.current = { id: targetId, promise: currentPromise };
      return currentPromise;
    },
    []
  );

  // Trigger fetch when requestId changes or on initial mount
  useEffect(() => {
    mountedRef.current = true;
    // When target requestId changes, reset state synchronously so stale data is never shown
    setRequest(null);
    setError(null);
    setRefreshError(null);
    setInitialLoading(true);

    executeFetch(requestId, false);

    return () => {
      mountedRef.current = false;
      inFlightPromiseRef.current = null;
    };
  }, [requestId, executeFetch]);

  const load = useCallback(() => {
    return executeFetch(requestId, false);
  }, [requestId, executeFetch]);

  const refresh = useCallback(() => {
    return executeFetch(requestId, true);
  }, [requestId, executeFetch]);

  const retry = useCallback(() => {
    return executeFetch(requestId, false);
  }, [requestId, executeFetch]);

  const invalidateAndRefresh = useCallback(() => {
    // Monotonically invalidate any in-flight GET requests and clear ownership before triggering fresh GET
    inFlightPromiseRef.current = null;
    return executeFetch(requestId, true);
  }, [requestId, executeFetch]);

  const applyServiceRequestUpdate = useCallback((updated: ServiceRequestDetailResponse) => {
    // Supersede any pending in-flight GET requests so stale responses cannot overwrite
    requestGenerationRef.current++;
    inFlightPromiseRef.current = null;
    if (mountedRef.current) {
      setRequest(updated);
      setError(null);
      setRefreshError(null);
      setInitialLoading(false);
    }
  }, []);

  return {
    request,
    initialLoading,
    refreshing,
    error,
    refreshError,
    load,
    refresh,
    retry,
    invalidateAndRefresh,
    applyServiceRequestUpdate,
  };
}
