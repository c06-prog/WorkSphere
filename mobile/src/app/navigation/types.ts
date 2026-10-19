/**
 * TypeScript Navigation Types for WorkSphere Mobile
 * Source: docs/03_MOBILE_SCREEN_MAP.md & design/03_NAVIGATION_MAP.md
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';

export type SessionState = 'INITIALIZING' | 'UNAUTHENTICATED' | 'AUTHENTICATED';

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: { email?: string } | undefined;
  ResetPassword: { token?: string } | undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Tasks: undefined;
  ServiceRequests: undefined;
  More: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthNavigationProp<RouteName extends keyof AuthStackParamList> =
  NativeStackNavigationProp<AuthStackParamList, RouteName>;

export type AuthRouteProp<RouteName extends keyof AuthStackParamList> =
  RouteProp<AuthStackParamList, RouteName>;

export type MainTabNavProp<RouteName extends keyof MainTabParamList> =
  BottomTabNavigationProp<MainTabParamList, RouteName>;

export type MainTabScreenRouteProp<RouteName extends keyof MainTabParamList> =
  RouteProp<MainTabParamList, RouteName>;

export type ProfileNavigationProp<RouteName extends keyof MainTabParamList> =
  NativeStackNavigationProp<MainTabParamList, RouteName>;
