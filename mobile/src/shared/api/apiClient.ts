import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getEnvironmentConfig } from '../config/environment';
import { accessTokenStore } from '../storage/accessTokenStore';
import { normalizeError } from './apiError';
import { isApiResponse, unwrapApiResponse } from './apiEnvelope';

export type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Injects or clears the global 401 Unauthorized callback.
 * Typically wired in Phase 13 to trigger session invalidation or navigation to Login.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

/**
 * Triggers the registered unauthorized handler if present.
 * Safe against handler throwing errors.
 */
export async function notifyUnauthorized(): Promise<void> {
  if (unauthorizedHandler) {
    try {
      await unauthorizedHandler();
    } catch {
      // Handler failure must not crash transport flow
    }
  }
}

/**
 * Creates and configures the Axios transport client.
 */
function createApiClient(): AxiosInstance {
  const instance = axios.create({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor: Injects Bearer token if present in in-memory store
  instance.interceptors.request.use(
    config => {
      // Dynamically resolve base URL and timeout from environment config
      const env = getEnvironmentConfig();
      if (!config.baseURL) {
        config.baseURL = env.apiBaseUrl;
      }
      if (!config.timeout) {
        config.timeout = env.requestTimeoutMs;
      }

      const token = accessTokenStore.getAccessToken();
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }

      return config;
    },
    error => Promise.reject(normalizeError(error))
  );

  // Response Interceptor: Intercepts 401 and normalizes all transport errors
  instance.interceptors.response.use(
    response => response,
    async error => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await notifyUnauthorized();
      }
      return Promise.reject(normalizeError(error));
    }
  );

  return instance;
}

export const apiClient: AxiosInstance = createApiClient();

/**
 * Typed HTTP Request Helpers with Automatic ApiResponse Envelope Unwrapping
 */
export const http = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T | null> {
    const response: AxiosResponse<unknown> = await apiClient.get(url, config);
    if (isApiResponse(response.data)) {
      return unwrapApiResponse<T>(response.data as any);
    }
    return response.data as T;
  },

  async post<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse | null> {
    const response: AxiosResponse<unknown> = await apiClient.post(url, data, config);
    if (isApiResponse(response.data)) {
      return unwrapApiResponse<TResponse>(response.data as any);
    }
    return response.data as TResponse;
  },

  async put<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse | null> {
    const response: AxiosResponse<unknown> = await apiClient.put(url, data, config);
    if (isApiResponse(response.data)) {
      return unwrapApiResponse<TResponse>(response.data as any);
    }
    return response.data as TResponse;
  },

  async delete<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse | null> {
    const response: AxiosResponse<unknown> = await apiClient.delete(url, config);
    if (isApiResponse(response.data)) {
      return unwrapApiResponse<TResponse>(response.data as any);
    }
    return response.data as TResponse;
  },
};
