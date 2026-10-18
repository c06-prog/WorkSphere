import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  apiClient,
  setUnauthorizedHandler,
  notifyUnauthorized,
  http,
} from '../../src/shared/api/apiClient';
import { accessTokenStore } from '../../src/shared/storage/accessTokenStore';
import { resetEnvironmentConfig } from '../../src/shared/config/environment';

describe('ApiClient and Transport Interceptors', () => {
  beforeEach(() => {
    accessTokenStore.clearAccessToken();
    setUnauthorizedHandler(null);
    resetEnvironmentConfig();
  });

  test('injects Bearer token in request header when access token is present', async () => {
    accessTokenStore.setAccessToken('test-access-token-jwt');

    // Inspect request interceptor logic
    const requestInterceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;

    const config = {
      headers: new axios.AxiosHeaders(),
    } as InternalAxiosRequestConfig;

    const result = await requestInterceptor(config);
    expect(result.headers.get('Authorization')).toBe('Bearer test-access-token-jwt');
  });

  test('does not add Authorization header when access token is absent', async () => {
    accessTokenStore.clearAccessToken();

    const requestInterceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;

    const config = {
      headers: new axios.AxiosHeaders(),
    } as InternalAxiosRequestConfig;

    const result = await requestInterceptor(config);
    expect(result.headers.get('Authorization')).toBeUndefined();
  });

  test('response interceptor invokes unauthorizedHandler on 401 and rejects normalized error', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);

    const responseInterceptorErr = (apiClient.interceptors.response as any).handlers[0].rejected;

    const error401 = new AxiosError('Unauthorized', '401', {} as any, {}, {
      status: 401,
      data: { success: false, message: 'Session expired', timestamp: '2026-10-17T12:00:00Z' },
      statusText: 'Unauthorized',
      headers: {},
      config: {} as any,
    } as AxiosResponse);

    await expect(responseInterceptorErr(error401)).rejects.toMatchObject({
      kind: 'UNAUTHORIZED',
      status: 401,
      message: 'Session expired',
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('response interceptor does not invoke unauthorizedHandler on 403', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);

    const responseInterceptorErr = (apiClient.interceptors.response as any).handlers[0].rejected;

    const error403 = new AxiosError('Forbidden', '403', {} as any, {}, {
      status: 403,
      data: { success: false, message: 'Access denied', timestamp: '2026-10-17T12:00:00Z' },
      statusText: 'Forbidden',
      headers: {},
      config: {} as any,
    } as AxiosResponse);

    await expect(responseInterceptorErr(error403)).rejects.toMatchObject({
      kind: 'FORBIDDEN',
      status: 403,
    });

    expect(handler).not.toHaveBeenCalled();
  });

  test('notifyUnauthorized executes safely when no handler is registered', async () => {
    setUnauthorizedHandler(null);
    await expect(notifyUnauthorized()).resolves.toBeUndefined();
  });

  test('notifyUnauthorized does not throw if the registered handler throws', async () => {
    setUnauthorizedHandler(() => {
      throw new Error('Handler internal fault');
    });

    await expect(notifyUnauthorized()).resolves.toBeUndefined();
  });

  test('http helpers unwrap ApiResponse data when present', async () => {
    const mockData = { id: 'proj-1', title: 'WorkSphere' };
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        success: true,
        data: mockData,
        timestamp: '2026-10-17T12:00:00Z',
      },
    } as AxiosResponse);

    const result = await http.get('/projects');
    expect(result).toEqual(mockData);
  });

  test('http.post forwards skipAuthRefresh in config argument without leaking into request body', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        data: { ok: true },
        timestamp: '2026-10-18T12:00:00Z',
      },
    } as AxiosResponse);

    const payload = { login: 'user1', password: 'password123' };
    const config: AxiosRequestConfig = { skipAuthRefresh: true };

    const result = await http.post('/auth/login', payload, config);
    expect(result).toEqual({ ok: true });
    expect(postSpy).toHaveBeenCalledWith('/auth/login', payload, { skipAuthRefresh: true });
    expect(payload).not.toHaveProperty('skipAuthRefresh');
  });
});
