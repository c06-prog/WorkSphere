import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { useAppTheme } from '../providers/ThemeProvider';
import { useAuth } from '../auth';
import type { RootStackParamList, SessionState } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export interface RootNavigatorProps {
  sessionState?: SessionState;
}

export function RootNavigator({ sessionState: explicitSessionState }: RootNavigatorProps) {
  const theme = useAppTheme();
  const auth = useAuth();
  const sessionState = explicitSessionState ?? auth.sessionState;

  if (sessionState === 'INITIALIZING') {
    return (
      <SafeAreaView
        style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}
        testID="root-initializing-state"
        accessibilityLabel="Loading Initializing State"
      >
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          testID="root-initializing-indicator"
        />
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
          ]}
        >
          Đang khởi tạo ứng dụng...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {sessionState === 'AUTHENTICATED' ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
