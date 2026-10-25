/**
 * TypeScript Navigation Types for WorkSphere Mobile
 * Source: docs/03_MOBILE_SCREEN_MAP.md & design/03_NAVIGATION_MAP.md
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

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
  Settings: undefined;
  // Phase 14 Project Stack Screens
  ProjectDetail: { projectId: string };
  CreateProject: undefined;
  EditProject: { projectId: string };
  ProjectMembers: { projectId: string };
  ProjectMilestones: { projectId: string };
  // Phase 15 Task Stack Screens
  TaskDetail: { taskId: string };
  CreateTask: { projectId?: string; parentTaskId?: string } | undefined;
  EditTask: { taskId: string };
  SubtaskList: { parentTaskId: string; projectId: string; parentTaskTitle?: string };
  TaskComments: { taskId: string; taskTitle?: string };
  // Phase 16 Service Request Stack Screens
  ServiceRequestDetail: { requestId: string };
  CreateServiceRequest: { assetId?: string } | undefined;
  ServiceRequestComments: { requestId: string };
  ServiceRating: { requestId: string };
};

export type AppStackParamList = {
  MainTabs: undefined;
  AssetList: undefined;
  AssetDetail: { assetId: string };
  CreateAsset: undefined;
  NotificationList: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthNavigationProp<RouteName extends keyof AuthStackParamList> =
  NativeStackNavigationProp<AuthStackParamList, RouteName>;

export type AuthRouteProp<RouteName extends keyof AuthStackParamList> =
  RouteProp<AuthStackParamList, RouteName>;

export type AppStackNavProp<RouteName extends keyof AppStackParamList> =
  NativeStackNavigationProp<AppStackParamList, RouteName>;

export type AppStackScreenRouteProp<RouteName extends keyof AppStackParamList> =
  RouteProp<AppStackParamList, RouteName>;

export type MainTabNavProp<RouteName extends keyof MainTabParamList> =
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, RouteName>,
    NativeStackNavigationProp<AppStackParamList>
  >;

export type MainTabScreenRouteProp<RouteName extends keyof MainTabParamList> =
  RouteProp<MainTabParamList, RouteName>;

export type ProfileNavigationProp<RouteName extends keyof MainTabParamList> =
  NativeStackNavigationProp<MainTabParamList, RouteName>;

export type AssetDetailNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AppStackParamList, 'AssetDetail'>,
  BottomTabNavigationProp<MainTabParamList>
>;
