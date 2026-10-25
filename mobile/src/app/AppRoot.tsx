import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import type { Metrics } from 'react-native-safe-area-context';
import { AppProviders } from './providers';
import { RootNavigator } from './navigation';
import type { SessionState } from './navigation/types';
import type { Theme } from '../shared/theme';

export interface AppRootProps {
  sessionState?: SessionState;
  theme?: Theme;
  initialMetrics?: Metrics | null;
  initialAuthState?: Partial<import('./auth/authTypes').AuthState>;
}

export function AppRoot({
  sessionState,
  theme,
  initialMetrics,
  initialAuthState,
}: AppRootProps) {
  return (
    <AppProviders theme={theme} initialMetrics={initialMetrics} initialAuthState={initialAuthState}>
      <NavigationContainer>
        <RootNavigator sessionState={sessionState} />
      </NavigationContainer>
    </AppProviders>
  );
}
