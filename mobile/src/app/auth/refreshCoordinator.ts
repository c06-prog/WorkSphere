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
 * Monotonically increasing generation counter for refresh operations.
 * Incremented whenever a session replacement occurs (login, logout, terminal cleanup).
 */
let refreshGeneration = 1;

/**
 * Returns current refresh generation.
 */
export function getRefreshGeneration(): number {
  return refreshGeneration;
}

/**
 * Invalidates any in-flight refresh flight immediately.
 * Any in-flight refresh whose captured generation does not match will abort
 * before writing tokens to Keychain or memory, and will not clear newer tokens.
 */
export function invalidateRefreshCoordinator(): void {
  refreshGeneration += 1;
  refreshPromise = null;
}

/**
 * Module-private shared promise for single-flight concurrency.
 * All concurrent 401 requests share this exact promise.
 */
let refreshPromise: Promise<string> | null = null;
let activeFlightGeneration = 0;

/**
 * Coordinates single-flight access token refresh with generation-based staleness protection.
 *
 * Flow:
 * 1. Captures current refresh generation.
 * 2. If a valid refreshPromise is already in-flight for this generation, returns it directly.
 * 3. Reads existing refreshToken from Keychain (secureStorage).
 * 4. Calls dedicated refresh transport.
 * 5. Before writing rotated token: verifies generation is still current.
 * 6. After Keychain write: verifies generation again before publishing in-memory access token.
 * 7. If invalidated during flight: aborts without overwriting current session or clearing newer tokens.
 * 8. Resets refreshPromise in finally block ONLY IF it still belongs to this flight.
 */
export async function refreshAccessToken(expectedGeneration?: number): Promise<string> {
  const flightGeneration = expectedGeneration ?? refreshGeneration;

  if (refreshPromise && activeFlightGeneration === flightGeneration) {
    return refreshPromise;
  }

  activeFlightGeneration = flightGeneration;
  const currentFlightPromise = (async () => {
    const currentRefreshToken = await secureStorage.getRefreshToken();
    if (!currentRefreshToken) {
      if (refreshGeneration === flightGeneration) {
        accessTokenStore.clearAccessToken();
      }
      throw new Error('Không tìm thấy phiên đăng nhập trong bộ lưu trữ an toàn');
    }

    // Verify generation before making network call
    if (refreshGeneration !== flightGeneration) {
      throw new Error('Phiên làm mới đã bị hủy bởi tác vụ xác thực mới hơn');
    }

    let response: RefreshResponse;
    try {
      response = await executeRefreshCall(currentRefreshToken);
    } catch (apiError) {
      // Backend rejected refresh token or network failed
      // For terminal rejection (or any refresh failure), clear in-memory access token only if still current
      if (refreshGeneration === flightGeneration) {
        accessTokenStore.clearAccessToken();
      }
      throw apiError;
    }

    // Pre-persistence generation check:
    // If user logged in or logged out while refresh was in flight, ABORT immediately.
    if (refreshGeneration !== flightGeneration) {
      throw new Error('Phiên làm mới đã bị hủy bởi tác vụ xác thực mới hơn');
    }

    // Atomic rotation persistence:
    // Persist new refresh token to Keychain BEFORE updating memory access token
    try {
      await secureStorage.setRefreshToken(response.refreshToken);
    } catch {
      // Storage hardware failed: rollback memory and best-effort clear Keychain if still current
      if (refreshGeneration === flightGeneration) {
        accessTokenStore.clearAccessToken();
        try {
          await secureStorage.clearRefreshToken();
        } catch {
          // Best-effort cleanup
        }
      }
      throw new Error('Không thể lưu trữ khóa phiên làm mới vào phần cứng an toàn');
    }

    // Post-persistence generation check:
    // If session invalidated during the Keychain write await window, do NOT publish access token
    // and compensate by restoring/cleaning only if no newer session took over.
    if (refreshGeneration !== flightGeneration) {
      throw new Error('Phiên làm mới đã bị hủy bởi tác vụ xác thực mới hơn');
    }

    // Now safe to commit new access token into memory
    accessTokenStore.setAccessToken(response.accessToken);
    return response.accessToken;
  })();

  refreshPromise = currentFlightPromise;

  try {
    return await currentFlightPromise;
  } finally {
    if (refreshPromise === currentFlightPromise) {
      refreshPromise = null;
    }
  }
}

/**
 * Test helper to reset internal in-flight promise and generation.
 */
export function resetRefreshCoordinatorForTests(): void {
  refreshPromise = null;
  activeFlightGeneration = 0;
  refreshGeneration = 1;
}
