import axios, { AxiosInstance } from 'axios';
import { getEnvironmentConfig } from '../../shared/config/environment';
import { isApiResponse, unwrapApiResponse } from '../../shared/api/apiEnvelope';
import { isRefreshResponse, RefreshResponse, RefreshTokenRequest } from '../../features/auth/api/authTypes';
import { secureStorage } from '../../shared/storage/secureStorage';
import { accessTokenStore } from '../../shared/storage/accessTokenStore';

/**
 * Module-private dedicated refresh HTTP transport client.
 * Isolated from apiClient:
 * - NO Authorization Bearer token header attached
 * - NO 401 refresh interceptor (cannot recurse into itself)
 * - NO global unauthorized callback invocation
 * - Fixed 15,000ms timeout or environment timeout
 * - Pure JSON Accept & Content-Type
 * - Never logs requests, responses, or tokens
 */
function createRefreshTransport(): AxiosInstance {
  const instance = axios.create({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(config => {
    const env = getEnvironmentConfig();
    if (!config.baseURL) {
      config.baseURL = env.apiBaseUrl;
    }
    if (!config.timeout) {
      config.timeout = env.requestTimeoutMs;
    }
    return config;
  });

  return instance;
}

export const refreshTransport: AxiosInstance = createRefreshTransport();

/**
 * Dedicated raw transport call to POST /auth/refresh.
 * Unwraps ApiResponse<RefreshResponse> and validates payload.
 */
export async function executeRefreshCall(refreshToken: string): Promise<RefreshResponse> {
  const requestPayload: RefreshTokenRequest = { refreshToken };
  const response = await refreshTransport.post('/auth/refresh', requestPayload);

  let data = response.data;
  if (isApiResponse(data)) {
    data = unwrapApiResponse<RefreshResponse>(data as any);
  }

  if (!isRefreshResponse(data)) {
    throw new Error('Dữ liệu làm mới phiên máy chủ trả về không hợp lệ');
  }

  return data;
}

/**
 * Module-private shared promise for single-flight concurrency.
 * All concurrent 401 requests share this exact promise.
 */
let refreshPromise: Promise<string> | null = null;

/**
 * Coordinates single-flight access token refresh.
 *
 * Flow:
 * 1. If refreshPromise is already in-flight, returns it directly (coalescing calls).
 * 2. Reads existing refreshToken from Keychain (secureStorage).
 * 3. If absent, throws terminal session error.
 * 4. Calls dedicated refresh transport.
 * 5. Persists rotated refreshToken into Keychain (secureStorage).
 * 6. ONLY AFTER Keychain write succeeds, updates in-memory accessTokenStore.
 * 7. Resolves with new accessToken string.
 * 8. Resets refreshPromise = null in finally block.
 *
 * Failure semantics:
 * - If refresh endpoint fails or Keychain write fails:
 *   - accessTokenStore is cleared immediately
 *   - Keychain refreshToken is best-effort cleared
 *   - All queued callers reject consistently
 *   - Lock releases cleanly in finally
 */
export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const currentRefreshToken = await secureStorage.getRefreshToken();
    if (!currentRefreshToken) {
      accessTokenStore.clearAccessToken();
      throw new Error('Không tìm thấy phiên đăng nhập trong bộ lưu trữ an toàn');
    }

    let response: RefreshResponse;
    try {
      response = await executeRefreshCall(currentRefreshToken);
    } catch (apiError) {
      // Backend rejected refresh token or network failed
      // For terminal rejection (or any refresh failure), clear in-memory access token
      accessTokenStore.clearAccessToken();
      throw apiError;
    }

    // Atomic rotation persistence:
    // Persist new refresh token to Keychain BEFORE updating memory access token
    try {
      await secureStorage.setRefreshToken(response.refreshToken);
    } catch {
      // Storage hardware failed: rollback memory and best-effort clear Keychain
      accessTokenStore.clearAccessToken();
      try {
        await secureStorage.clearRefreshToken();
      } catch {
        // Best-effort cleanup
      }
      throw new Error('Không thể lưu trữ khóa phiên làm mới vào phần cứng an toàn');
    }

    // Now safe to commit new access token into memory
    accessTokenStore.setAccessToken(response.accessToken);
    return response.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Test helper to reset internal in-flight promise.
 */
export function resetRefreshCoordinatorForTests(): void {
  refreshPromise = null;
}
