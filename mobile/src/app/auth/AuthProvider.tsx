import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { authReducer, initialAuthState } from './authReducer';
import type { AuthContextValue, AuthState } from './authTypes';
import { authApi } from '../../features/auth/api/authApi';
import { mapAuthError } from '../../features/auth/errors/authErrorMapper';
import { accessTokenStore } from '../../shared/storage/accessTokenStore';
import { secureStorage } from '../../shared/storage/secureStorage';

export const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  initialState?: Partial<AuthState>;
}

export function AuthProvider({ children, initialState }: AuthProviderProps) {
  const [state, dispatch] = useReducer(
    authReducer,
    initialState ? { ...initialAuthState, ...initialState } : initialAuthState
  );

  useEffect(() => {
    // Phase 13B Bootstrap:
    // Memory access token is cleared, session starts UN-AUTHENTICATED.
    // Keychain reading and refresh session restore are strictly deferred to Phase 13C.
    accessTokenStore.clearAccessToken();
    dispatch({ type: 'INITIALIZATION_COMPLETED_UNAUTHENTICATED' });
  }, []);

  const login = async (loginInput: string, passwordInput: string): Promise<boolean> => {
    // Guard against duplicate execution while authentication is in-flight
    if (state.operationState === 'authenticating') {
      return false;
    }

    dispatch({ type: 'LOGIN_STARTED' });

    try {
      const response = await authApi.login({
        login: loginInput,
        password: passwordInput,
      });

      // Secure storage sequence:
      // 1. Persist refresh token to Keychain
      // 2. Set in-memory access token ONLY AFTER Keychain write succeeds
      try {
        await secureStorage.setRefreshToken(response.refreshToken);
      } catch (storageError) {
        // Rollback memory and keychain on storage failure
        accessTokenStore.clearAccessToken();
        await secureStorage.clearRefreshToken();
        const mappedStorageError = mapAuthError(storageError);
        dispatch({
          type: 'LOGIN_FAILED',
          payload: { error: mappedStorageError },
        });
        return false;
      }

      accessTokenStore.setAccessToken(response.accessToken);
      dispatch({
        type: 'LOGIN_SUCCEEDED',
        payload: { user: response.user },
      });
      return true;
    } catch (apiError) {
      // API call failed: storage is untouched
      const mappedError = mapAuthError(apiError);
      dispatch({
        type: 'LOGIN_FAILED',
        payload: { error: mappedError },
      });
      return false;
    }
  };

  const logoutLocal = async (): Promise<void> => {
    // Guard against duplicate execution while signout is in-flight
    if (state.operationState === 'signingOut') {
      return;
    }

    dispatch({ type: 'LOGOUT_STARTED' });

    try {
      accessTokenStore.clearAccessToken();
      await secureStorage.clearRefreshToken();
    } catch {
      // Local logout is resilient: always proceed with local UI teardown even if Keychain reset throws
    } finally {
      accessTokenStore.clearAccessToken();
      dispatch({ type: 'LOGOUT_COMPLETED' });
    }
  };

  const clearAuthError = (): void => {
    dispatch({ type: 'CLEAR_AUTH_ERROR' });
  };

  const contextValue: AuthContextValue = {
    sessionState: state.sessionState,
    operationState: state.operationState,
    currentUser: state.currentUser,
    initialized: state.initialized,
    lastAuthError: state.lastAuthError,
    login,
    logoutLocal,
    clearAuthError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
