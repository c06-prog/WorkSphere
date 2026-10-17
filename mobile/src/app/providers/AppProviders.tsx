import React, { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './ThemeProvider';
import { Theme } from '../../shared/theme';

export interface AppProvidersProps {
  children: ReactNode;
  theme?: Theme;
}

const defaultInitialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export function AppProviders({ children, theme }: AppProvidersProps) {
  return (
    <SafeAreaProvider initialMetrics={defaultInitialMetrics}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
