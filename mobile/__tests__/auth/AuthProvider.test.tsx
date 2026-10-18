import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/app/auth/AuthProvider';
import { authApi } from '../../src/features/auth/api/authApi';
import { accessTokenStore } from '../../src/shared/storage/accessTokenStore';
import { secureStorage } from '../../src/shared/storage/secureStorage';
import type { AuthResponse, AuthUser } from '../../src/features/auth/api/authTypes';

// Mock dependencies
jest.mock('../../src/features/auth/api/authApi');
jest.mock('../../src/shared/storage/accessTokenStore');
jest.mock('../../src/shared/storage/secureStorage');

describe('AuthProvider & useAuth hook', () => {
  const mockSampleUser: AuthUser = {
    id: 'user-uuid-123',
    username: 'test.user',
    email: 'test.user@worksphere.com',
    fullName: 'Test User',
    avatarUrl: null,
    department: { id: 'dept-01', name: 'Engineering' },
    roles: ['ROLE_USER'],
    permissions: ['VIEW_TASKS'],
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'mock-access-token-xyz',
    refreshToken: 'mock-refresh-token-abc',
    tokenType: 'Bearer',
    accessTokenExpiresIn: 900,
    refreshTokenExpiresIn: 604800,
    user: mockSampleUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('throws error when useAuth is consumed outside AuthProvider', async () => {
    // Suppress console.error for expected thrown error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(async () => {
      await renderHook(() => useAuth());
    }).rejects.toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });

  test('bootstrap: clears memory access token and completes initialization to UNAUTHENTICATED', async () => {
    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(accessTokenStore.clearAccessToken).toHaveBeenCalledTimes(1);
    expect(result.current.sessionState).toBe('UNAUTHENTICATED');
    expect(result.current.operationState).toBe('idle');
    expect(result.current.currentUser).toBeNull();
    expect(result.current.initialized).toBe(true);
    expect(result.current.lastAuthError).toBeNull();
  });

  test('login success: executes secure storage sequence and transitions to AUTHENTICATED', async () => {
    (authApi.login as jest.Mock).mockResolvedValueOnce(mockAuthResponse);
    (secureStorage.setRefreshToken as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    let success = false;
    await act(async () => {
      success = await result.current.login('test.user', 'ValidPassword123');
    });

    expect(success).toBe(true);
    expect(authApi.login).toHaveBeenCalledWith({
      login: 'test.user',
      password: 'ValidPassword123',
    });
    // Keychain write happens first
    expect(secureStorage.setRefreshToken).toHaveBeenCalledWith('mock-refresh-token-abc');
    // Memory access token write happens after Keychain write
    expect(accessTokenStore.setAccessToken).toHaveBeenCalledWith('mock-access-token-xyz');
    expect(result.current.sessionState).toBe('AUTHENTICATED');
    expect(result.current.operationState).toBe('idle');
    expect(result.current.currentUser).toEqual(mockSampleUser);
    expect(result.current.lastAuthError).toBeNull();
  });

  test('login failure on Keychain write: rolls back memory and Keychain, transitions to UNAUTHENTICATED with error', async () => {
    (authApi.login as jest.Mock).mockResolvedValueOnce(mockAuthResponse);
    (secureStorage.setRefreshToken as jest.Mock).mockRejectedValueOnce(
      new Error('Keychain hardware unavailable')
    );

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    let success = true;
    await act(async () => {
      success = await result.current.login('test.user', 'ValidPassword123');
    });

    expect(success).toBe(false);
    // Verified rollback
    expect(accessTokenStore.clearAccessToken).toHaveBeenCalled();
    expect(secureStorage.clearRefreshToken).toHaveBeenCalled();
    expect(accessTokenStore.setAccessToken).not.toHaveBeenCalled();
    expect(result.current.sessionState).toBe('UNAUTHENTICATED');
    expect(result.current.operationState).toBe('error');
    expect(result.current.currentUser).toBeNull();
    expect(result.current.lastAuthError).not.toBeNull();
  });

  test('login failure on API rejection: leaves storage untouched, transitions to UNAUTHENTICATED with error', async () => {
    const apiError = new Error('Invalid credentials');
    (authApi.login as jest.Mock).mockRejectedValueOnce(apiError);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    let success = true;
    await act(async () => {
      success = await result.current.login('wrong.user', 'WrongPassword123');
    });

    expect(success).toBe(false);
    expect(secureStorage.setRefreshToken).not.toHaveBeenCalled();
    expect(accessTokenStore.setAccessToken).not.toHaveBeenCalled();
    expect(result.current.sessionState).toBe('UNAUTHENTICATED');
    expect(result.current.operationState).toBe('error');
    expect(result.current.currentUser).toBeNull();
    expect(result.current.lastAuthError).not.toBeNull();
  });

  test('duplicate login guard: ignores duplicate calls while authenticating', async () => {
    let resolveLogin: (res: AuthResponse) => void = () => {};
    const pendingPromise = new Promise<AuthResponse>(resolve => {
      resolveLogin = resolve;
    });
    (authApi.login as jest.Mock).mockReturnValueOnce(pendingPromise);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    let firstPromise: Promise<boolean>;
    let secondPromise: Promise<boolean>;

    await act(async () => {
      firstPromise = result.current.login('user1', 'Password123');
    });

    expect(result.current.operationState).toBe('authenticating');

    // Second call while first is in-flight
    await act(async () => {
      secondPromise = result.current.login('user2', 'Password123');
      const secondResult = await secondPromise;
      expect(secondResult).toBe(false);
    });

    // Resolve first login
    await act(async () => {
      resolveLogin(mockAuthResponse);
      await firstPromise;
    });

    expect(authApi.login).toHaveBeenCalledTimes(1);
    expect(result.current.sessionState).toBe('AUTHENTICATED');
  });

  test('local logout: clears memory access token and keychain refresh token, resets state to UNAUTHENTICATED', async () => {
    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProvider
          initialState={{
            sessionState: 'AUTHENTICATED',
            operationState: 'idle',
            currentUser: mockSampleUser,
            initialized: true,
          }}
        >
          {children}
        </AuthProvider>
      ),
    });

    await act(async () => {
      await result.current.logoutLocal();
    });

    expect(accessTokenStore.clearAccessToken).toHaveBeenCalled();
    expect(secureStorage.clearRefreshToken).toHaveBeenCalled();
    expect(result.current.sessionState).toBe('UNAUTHENTICATED');
    expect(result.current.currentUser).toBeNull();
    expect(result.current.operationState).toBe('idle');
  });

  test('local logout: resilient even if Keychain clear throws', async () => {
    (secureStorage.clearRefreshToken as jest.Mock).mockRejectedValueOnce(
      new Error('Keychain reset error')
    );

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProvider
          initialState={{
            sessionState: 'AUTHENTICATED',
            operationState: 'idle',
            currentUser: mockSampleUser,
            initialized: true,
          }}
        >
          {children}
        </AuthProvider>
      ),
    });

    await act(async () => {
      await result.current.logoutLocal();
    });

    expect(result.current.sessionState).toBe('UNAUTHENTICATED');
    expect(result.current.currentUser).toBeNull();
    expect(result.current.operationState).toBe('idle');
  });

  test('clearAuthError clears lastAuthError and restores idle operationState', async () => {
    (authApi.login as jest.Mock).mockRejectedValueOnce(new Error('Auth failed'));

    const { result } = await renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await result.current.login('user', 'pass');
    });

    expect(result.current.lastAuthError).not.toBeNull();
    expect(result.current.operationState).toBe('error');

    await act(async () => {
      result.current.clearAuthError();
    });

    expect(result.current.lastAuthError).toBeNull();
    expect(result.current.operationState).toBe('idle');
  });
});
