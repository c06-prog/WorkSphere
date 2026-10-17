import {
  getEnvironmentConfig,
  setEnvironmentConfig,
  resetEnvironmentConfig,
  normalizeApiBaseUrl,
  CANONICAL_EMULATOR_DEV_BASE_URL,
} from '../../src/shared/config/environment';

describe('Environment Configuration', () => {
  afterEach(() => {
    resetEnvironmentConfig();
  });

  test('resolves canonical emulator dev base URL by default in development', () => {
    const config = getEnvironmentConfig();
    expect(config.apiBaseUrl).toBe(CANONICAL_EMULATOR_DEV_BASE_URL);
    expect(config.isProduction).toBe(false);
    expect(config.requestTimeoutMs).toBe(15000);
  });

  test('normalizes trailing slashes and ensures single /api/v1 suffix', () => {
    expect(normalizeApiBaseUrl('http://localhost:8080/')).toBe('http://localhost:8080/api/v1');
    expect(normalizeApiBaseUrl('http://localhost:8080/api/v1/')).toBe('http://localhost:8080/api/v1');
    expect(normalizeApiBaseUrl('http://localhost:8080///')).toBe('http://localhost:8080/api/v1');
    expect(normalizeApiBaseUrl('https://api.worksphere.vn/api/v1', true)).toBe('https://api.worksphere.vn/api/v1');
  });

  test('rejects malformed URLs without valid protocol', () => {
    expect(() => normalizeApiBaseUrl('localhost:8080')).toThrow(/Malformed API Base URL/);
    expect(() => normalizeApiBaseUrl('ftp://example.com')).toThrow(/Malformed API Base URL/);
    expect(() => normalizeApiBaseUrl('')).toThrow(/non-empty string/);
  });

  test('strictly rejects HTTP protocol in production', () => {
    expect(() => normalizeApiBaseUrl('http://insecure.worksphere.vn', true)).toThrow(
      /Security violation: Production API Base URL must use HTTPS/
    );
  });

  test('supports runtime injection for tests and preserves normalized config', () => {
    setEnvironmentConfig({
      apiBaseUrl: 'https://test-server.worksphere.internal/',
      isProduction: true,
      requestTimeoutMs: 5000,
    });

    const active = getEnvironmentConfig();
    expect(active.apiBaseUrl).toBe('https://test-server.worksphere.internal/api/v1');
    expect(active.isProduction).toBe(true);
    expect(active.requestTimeoutMs).toBe(5000);

    resetEnvironmentConfig();
    const restored = getEnvironmentConfig();
    expect(restored.apiBaseUrl).toBe(CANONICAL_EMULATOR_DEV_BASE_URL);
  });
});
