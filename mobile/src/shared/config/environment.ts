/**
 * Environment Configuration Foundation for WorkSphere Mobile
 *
 * Rules:
 * - In Development (__DEV__): defaults to Android emulator local backend (http://10.0.2.2:8080/api/v1).
 * - In Production: HTTPS is strictly required. No fallback domain is invented.
 * - Base URL is normalized: trailing slashes stripped, /api/v1 guaranteed exactly once.
 * - Runtime injectable for unit and integration testing.
 */

declare const process: { env?: Record<string, string | undefined> } | undefined;

export interface EnvironmentConfig {
  apiBaseUrl: string;
  isProduction: boolean;
  requestTimeoutMs: number;
}

export const DEFAULT_REQUEST_TIMEOUT_MS = 15000;
export const CANONICAL_EMULATOR_DEV_BASE_URL = 'http://10.0.2.2:8080/api/v1';

let activeConfigOverride: EnvironmentConfig | null = null;

/**
 * Normalizes an API base URL:
 * - Strips trailing whitespace and slashes.
 * - Ensures valid URL format.
 * - Validates HTTPS policy for production environments.
 * - Ensures path ends with '/api/v1' exactly once.
 */
export function normalizeApiBaseUrl(rawUrl: string, isProduction: boolean = false): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('API Base URL must be a non-empty string');
  }

  const trimmed = rawUrl.trim();

  // Basic protocol validation
  const lower = trimmed.toLowerCase();
  const isHttps = lower.startsWith('https://');
  const isHttp = lower.startsWith('http://');

  if (!isHttps && !isHttp) {
    throw new Error(`Malformed API Base URL: Must begin with http:// or https://: "${trimmed}"`);
  }

  if (isProduction && !isHttps) {
    throw new Error(`Security violation: Production API Base URL must use HTTPS: "${trimmed}"`);
  }

  // Remove all trailing slashes
  let sanitized = trimmed.replace(/\/+$/, '');

  // Ensure /api/v1 suffix appears exactly once
  const apiV1Regex = /\/api\/v1$/i;
  if (!apiV1Regex.test(sanitized)) {
    // If it has a partial or different suffix, append /api/v1
    sanitized = `${sanitized}/api/v1`;
  }

  return sanitized;
}

/**
 * Resolves current environment configuration.
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  if (activeConfigOverride) {
    return activeConfigOverride;
  }

  const isDev =
    typeof __DEV__ !== 'undefined'
      ? Boolean(__DEV__)
      : typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';

  if (isDev) {
    return {
      apiBaseUrl: CANONICAL_EMULATOR_DEV_BASE_URL,
      isProduction: false,
      requestTimeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
    };
  }

  // In production, must be explicitly configured via setEnvironmentConfig
  throw new Error(
    'Production Environment Configuration missing: Explicit API Base URL must be configured at bootstrap.'
  );
}

/**
 * Sets an explicit environment configuration (used in tests or dynamic app bootstrap).
 */
export function setEnvironmentConfig(config: EnvironmentConfig): void {
  const normalizedUrl = normalizeApiBaseUrl(config.apiBaseUrl, config.isProduction);
  activeConfigOverride = {
    ...config,
    apiBaseUrl: normalizedUrl,
  };
}

/**
 * Resets environment configuration to initial state (for test cleanup).
 */
export function resetEnvironmentConfig(): void {
  activeConfigOverride = null;
}
