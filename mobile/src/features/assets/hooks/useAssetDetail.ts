/**
 * Phase 17C: useAssetDetail Hook
 * Manages fetching, refreshing, caching, and state updates for a single Asset.
 * Backed by GET /api/v1/assets/{assetId}.
 *
 * Concurrency & Invariants:
 * - Query Generation: Monotonically increasing generation number per request.
 *   If assetId changes (A -> B), B receives generation > A. Even if A resolves
 *   after B, A's response is discarded because generation !== current.
 * - Deduplication: Concurrent same-tick calls for the SAME assetId share the in-flight promise.
 * - In-flight Ownership: Finally block only clears inFlightPromiseRef if the finished request
 *   matches targetId, preventing newer requests from having their lock prematurely cleared.
 * - Resource-ID Transition: Clears prior request data on ID change, setting initialLoading=true
 *   to prevent stale data flash.
 * - Unmount Safety: Checks mountedRef before any state commit.
 * - Refresh Safety: Failed refresh retains existing asset data and surfaces non-blocking refreshError.
 * - Mutation Invalidation Foundation: applyAssetUpdate sets authoritative detail,
 *   increments generation, and clears in-flight promises.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { assetApi } from '../api/assetApi';
import { AssetDetailResponse } from '../types/assetTypes';
import {
  mapAssetError,
  AssetPresentationError,
} from '../errors/assetErrorMapper';

export interface UseAssetDetailResult {
  asset: AssetDetailResponse | null;
  initialLoading: boolean;
  refreshing: boolean;
  error: AssetPresentationError | null;
  refreshError: string | null;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  invalidateAndRefresh: () => Promise<void>;
  applyAssetUpdate: (updated: AssetDetailResponse) => void;
}

export function useAssetDetail(assetId: string): UseAssetDetailResult {
  const [asset, setAsset] = useState<AssetDetailResponse | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<AssetPresentationError | null>(null);
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
          const data = await assetApi.getAssetDetail(targetId);

          if (!mountedRef.current || generation !== requestGenerationRef.current) {
            return;
          }

          setAsset(data);
          setError(null);
          setRefreshError(null);
        } catch (err: unknown) {
          if (!mountedRef.current || generation !== requestGenerationRef.current) {
            return;
          }

          const mapped = mapAssetError(err);
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

  useEffect(() => {
    mountedRef.current = true;
    setAsset(null);
    setError(null);
    setRefreshError(null);
    setInitialLoading(true);

    executeFetch(assetId, false);

    return () => {
      mountedRef.current = false;
      inFlightPromiseRef.current = null;
    };
  }, [assetId, executeFetch]);

  const load = useCallback(() => {
    return executeFetch(assetId, false);
  }, [assetId, executeFetch]);

  const refresh = useCallback(() => {
    return executeFetch(assetId, true);
  }, [assetId, executeFetch]);

  const retry = useCallback(() => {
    return executeFetch(assetId, false);
  }, [assetId, executeFetch]);

  const invalidateAndRefresh = useCallback(() => {
    inFlightPromiseRef.current = null;
    return executeFetch(assetId, true);
  }, [assetId, executeFetch]);

  const applyAssetUpdate = useCallback((updated: AssetDetailResponse) => {
    requestGenerationRef.current++;
    inFlightPromiseRef.current = null;
    if (mountedRef.current) {
      setAsset(updated);
      setError(null);
      setRefreshError(null);
      setInitialLoading(false);
    }
  }, []);

  return {
    asset,
    initialLoading,
    refreshing,
    error,
    refreshError,
    load,
    refresh,
    retry,
    invalidateAndRefresh,
    applyAssetUpdate,
  };
}
