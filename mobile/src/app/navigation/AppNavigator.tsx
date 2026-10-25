import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { AssetListScreen, AssetDetailScreen, CreateAssetScreen } from '../../features/assets/screens';
import { NotificationListScreen } from '../../features/notifications/screens';
import { useAppTheme } from '../providers/ThemeProvider';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

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
        component={CreateAssetScreen}
        options={{
          headerTitle: 'Tạo tài sản mới',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="NotificationList"
        component={NotificationListScreen}
        options={{
          headerTitle: 'Thông báo',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
