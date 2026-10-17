import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProviders } from './providers';
import { RootNavigator } from './navigation';
import type { SessionState } from './navigation/types';
import type { Theme } from '../shared/theme';

export interface AppRootProps {
  sessionState?: SessionState;
  theme?: Theme;
}

export function AppRoot({ sessionState = 'UNAUTHENTICATED', theme }: AppRootProps) {
  return (
    <AppProviders theme={theme}>
      <NavigationContainer>
        <RootNavigator sessionState={sessionState} />
      </NavigationContainer>
    </AppProviders>
  );
}
