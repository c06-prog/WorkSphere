import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { AssetListScreen, AssetDetailScreen } from '../../features/assets/screens';
import { PlaceholderScreen } from '../../shared/components/PlaceholderScreen';
import { useAppTheme } from '../providers/ThemeProvider';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

function CreateAssetPlaceholder() {
  return (
    <PlaceholderScreen
      title="Create Asset"
      screenId="SCR-AST-03"
      subtitle="SCR-AST-03: Create Asset Screen (Phase 17D Shell)"
      testID="screen-create-asset"
    />
  );
}

export function AppNavigator() {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          ...theme.typography.heading2,
          color: theme.colors.textPrimary,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AssetList"
        component={AssetListScreen}
        options={{
          headerTitle: 'Tài sản',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AssetDetail"
        component={AssetDetailScreen}
        options={{
          headerTitle: 'Chi tiết tài sản',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateAsset"
        component={CreateAssetPlaceholder}
        options={{
          headerTitle: 'Tạo tài sản mới',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
