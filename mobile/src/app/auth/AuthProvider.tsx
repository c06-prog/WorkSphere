import React, { createContext, useContext, useEffect, useReducer, useRef, ReactNode } from 'react';
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

  const mountedRef = useRef(true);
  const loginInFlightRef = useRef(false);
  const logoutInFlightRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    // Phase 13B Bootstrap:
    // Memory access token is cleared, session starts UN-AUTHENTICATED.
    // Keychain reading and refresh session restore are strictly deferred to Phase 13C.
    accessTokenStore.clearAccessToken();
    dispatch({ type: 'INITIALIZATION_COMPLETED_UNAUTHENTICATED' });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const login = async (loginInput: string, passwordInput: string): Promise<boolean> => {
    // Synchronous non-render mutex lock: prevents race condition when login() is invoked
    // multiple times in the same JavaScript tick before React rerenders
    if (loginInFlightRef.current || state.operationState === 'authenticating') {
      return false;
    }

    loginInFlightRef.current = true;

    if (mountedRef.current) {
      dispatch({ type: 'LOGIN_STARTED' });
    }

    try {
      const response = await authApi.login({
        login: loginInput,
        password: passwordInput,
      });

      // Verify component is still mounted before persisting session
      if (!mountedRef.current) {
        accessTokenStore.clearAccessToken();
        await secureStorage.clearRefreshToken();
        return false;
      }

      // Secure storage sequence:
      // 1. Persist refresh token to Keychain
      // 2. Set in-memory access token ONLY AFTER Keychain write succeeds
      try {
        await secureStorage.setRefreshToken(response.refreshToken);
      } catch (storageError) {
        // Rollback memory and keychain on storage failure
        accessTokenStore.clearAccessToken();
        await secureStorage.clearRefreshToken();
        if (mountedRef.current) {
          const mappedStorageError = mapAuthError(storageError);
          dispatch({
            type: 'LOGIN_FAILED',
            payload: { error: mappedStorageError },
          });
        }
        return false;
      }

      // Check mountedRef again in case unmount happened during secureStorage.setRefreshToken
      if (!mountedRef.current) {
        accessTokenStore.clearAccessToken();
        await secureStorage.clearRefreshToken();
        return false;
      }

      accessTokenStore.setAccessToken(response.accessToken);
      if (mountedRef.current) {
        dispatch({
          type: 'LOGIN_SUCCEEDED',
          payload: { user: response.user },
        });
      }
      return true;
    } catch (apiError) {
      // API call failed: storage is untouched
      if (mountedRef.current) {
        const mappedError = mapAuthError(apiError);
        dispatch({
          type: 'LOGIN_FAILED',
          payload: { error: mappedError },
        });
      }
      return false;
    } finally {
      loginInFlightRef.current = false;
    }
  };

  const logoutLocal = async (): Promise<void> => {
    // Synchronous non-render mutex lock: prevents concurrent duplicate logouts in the same tick
    if (logoutInFlightRef.current || state.operationState === 'signingOut') {
      return;
    }

    logoutInFlightRef.current = true;

    if (mountedRef.current) {
      dispatch({ type: 'LOGOUT_STARTED' });
    }

    try {
      accessTokenStore.clearAccessToken();
      await secureStorage.clearRefreshToken();
    } catch {
      // Local logout is resilient: always proceed with local UI teardown even if Keychain reset throws
    } finally {
      accessTokenStore.clearAccessToken();
      if (mountedRef.current) {
        dispatch({ type: 'LOGOUT_COMPLETED' });
      }
      logoutInFlightRef.current = false;
    }
  };

  const clearAuthError = (): void => {
    if (mountedRef.current) {
      dispatch({ type: 'CLEAR_AUTH_ERROR' });
    }
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
