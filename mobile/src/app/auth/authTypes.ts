import type { AuthUser } from '../../features/auth/api/authTypes';
import type { AuthPresentationError } from '../../features/auth/errors/authErrorMapper';

export type SessionState = 'INITIALIZING' | 'UNAUTHENTICATED' | 'AUTHENTICATED';

export type AuthOperationState = 'idle' | 'authenticating' | 'signingOut' | 'error';

export interface AuthState {
  sessionState: SessionState;
  operationState: AuthOperationState;
  currentUser: AuthUser | null;
  initialized: boolean;
  lastAuthError: AuthPresentationError | null;
}

export type AuthAction =
  | { type: 'INITIALIZATION_COMPLETED_UNAUTHENTICATED' }
  | { type: 'LOGIN_STARTED' }
  | { type: 'LOGIN_SUCCEEDED'; payload: { user: AuthUser } }
  | { type: 'LOGIN_FAILED'; payload: { error: AuthPresentationError } }
  | { type: 'LOGOUT_STARTED' }
  | { type: 'LOGOUT_COMPLETED' }
  | { type: 'CLEAR_AUTH_ERROR' };

export interface AuthContextValue {
  sessionState: SessionState;
  operationState: AuthOperationState;
  currentUser: AuthUser | null;
  initialized: boolean;
  lastAuthError: AuthPresentationError | null;
  login: (loginInput: string, passwordInput: string) => Promise<boolean>;
  logoutLocal: () => Promise<void>;
  clearAuthError: () => void;
}
