import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/app/auth/AuthProvider';
import { authApi } from '../../src/features/auth/api/authApi';
import { refreshAccessToken } from '../../src/app/auth/refreshCoordinator';
import { accessTokenStore } from '../../src/shared/storage/accessTokenStore';
import { secureStorage } from '../../src/shared/storage/secureStorage';
import type { AuthUser } from '../../src/features/auth/api/authTypes';

jest.mock('../../src/features/auth/api/authApi');
jest.mock('../../src/app/auth/refreshCoordinator');
jest.mock('../../src/shared/storage/accessTokenStore');
jest.mock('../../src/shared/storage/secureStorage');

describe('AuthProvider Session Bootstrap Lifecycle', () => {
  const mockUser: AuthUser = {
    id: 'user-001',
    username: 'bootstrap.user',
    email: 'bootstrap@worksphere.com',
    fullName: 'Bootstrap User',
    avatarUrl: null,
    department: { id: 'd-1', name: 'Engineering' },
    roles: ['ROLE_USER'],
    permissions: ['VIEW_TASKS'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('no Keychain refresh token -> transitions to UNAUTHENTICATED', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce(null);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(accessTokenStore.clearAccessToken).toHaveBeenCalled();
    expect(result.current.sessionState).toBe('UNAUTHENTICATED');
    expect(result.current.currentUser).toBeNull();
    expect(result.current.initialized).toBe(true);
    expect(refreshAccessToken).not.toHaveBeenCalled();
    expect(authApi.getCurrentUser).not.toHaveBeenCalled();
  });

  test('valid Keychain refresh token -> refresh succeeds -> loads profile -> transitions to AUTHENTICATED', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce('valid-stored-refresh-token');
    (refreshAccessToken as jest.Mock).mockResolvedValueOnce('new-access-token');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(secureStorage.getRefreshToken).toHaveBeenCalledTimes(1);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(authApi.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(result.current.sessionState).toBe('AUTHENTICATED');
    expect(result.current.currentUser).toEqual(mockUser);
    expect(result.current.initialized).toBe(true);
  });

  test('terminal refresh failure (401/revoked/invalid) -> clears session and transitions to UNAUTHENTICATED', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce('invalid-token');
    (refreshAccessToken as jest.Mock).mockRejectedValueOnce({
      kind: 'UNAUTHORIZED',
      status: 401,
      message: 'Token expired',
    });

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(accessTokenStore.clearAccessToken).toHaveBeenCalled();
    expect(secureStorage.clearRefreshToken).toHaveBeenCalled();
    expect(result.current.sessionState).toBe('UNAUTHENTICATED');
    expect(result.current.currentUser).toBeNull();
    expect(result.current.initialized).toBe(true);
  });

  test('recoverable network error -> retains refresh token in Keychain and exposes retry state', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce('valid-token-offline');
    (refreshAccessToken as jest.Mock).mockRejectedValueOnce({
      kind: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến máy chủ',
    });

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.sessionState).toBe('INITIALIZING');
    expect(result.current.canRetryBootstrap).toBe(true);
    expect(result.current.lastAuthError).not.toBeNull();
    // Refresh token in Keychain was NOT cleared
    expect(secureStorage.clearRefreshToken).not.toHaveBeenCalled();

    // Now test retryBootstrap succeeds
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce('valid-token-offline');
    (refreshAccessToken as jest.Mock).mockResolvedValueOnce('new-access-token');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

    await act(async () => {
      await result.current.retryBootstrap();
    });

    expect(result.current.sessionState).toBe('AUTHENTICATED');
    expect(result.current.currentUser).toEqual(mockUser);
    expect(result.current.canRetryBootstrap).toBe(false);
  });

  test('recoverable timeout error -> explicit logoutLocal clears Keychain and transitions to UNAUTHENTICATED', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce('valid-token-timeout');
    (refreshAccessToken as jest.Mock).mockRejectedValueOnce({
      kind: 'TIMEOUT',
      message: 'Timeout error',
    });

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.canRetryBootstrap).toBe(true);

    await act(async () => {
      await result.current.logoutLocal();
    });

    expect(secureStorage.clearRefreshToken).toHaveBeenCalled();
    expect(result.current.sessionState).toBe('UNAUTHENTICATED');
    expect(result.current.currentUser).toBeNull();
  });

  test('unmount safety during bootstrap: no dispatch on unmounted component', async () => {
    let resolveRefresh: any;
    const pendingRefresh = new Promise(resolve => {
      resolveRefresh = resolve;
    });

    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce('token-unmount');
    (refreshAccessToken as jest.Mock).mockReturnValueOnce(pendingRefresh);

    const { unmount } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      unmount();
    });

    await act(async () => {
      resolveRefresh('token');
    });

    // authApi.getCurrentUser should not be called since component unmounted
    expect(authApi.getCurrentUser).not.toHaveBeenCalled();
  });
});
