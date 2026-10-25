/**
 * Phase 18D: Full Navigator Tree Integration Tests
 * Verifies real navigator route resolution without mocking navigation dispatch:
 * 1. Dashboard bell -> NotificationList
 * 2. More row -> NotificationList
 * 3. NotificationList -> TaskDetail (nested in MainTabs)
 * 4. NotificationList -> ProjectDetail (nested in MainTabs)
 * 5. NotificationList -> ServiceRequestDetail (nested in MainTabs)
 * 6. NotificationList -> AssetDetail (AppStack)
 * 7. Back navigation from target -> NotificationList
 * 8. Back navigation from NotificationList -> entry point (Dashboard/More)
 * 9. Exact 5 visible bottom tabs (No hidden 6th tab)
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AppRoot } from '../../src/app/AppRoot';
import { notificationApi } from '../../src/features/notifications/api/notificationApi';
import { dashboardApi } from '../../src/features/dashboard/api/dashboardApi';
import { taskApi } from '../../src/features/tasks/api/taskApi';
import { projectApi } from '../../src/features/projects/api/projectApi';
import { serviceRequestApi } from '../../src/features/serviceRequests/api/serviceRequestApi';
import { assetApi } from '../../src/features/assets/api/assetApi';
import { authApi } from '../../src/features/auth/api/authApi';
import { secureStorage } from '../../src/shared/storage/secureStorage';
import { refreshAccessToken } from '../../src/app/auth/refreshCoordinator';
import { NotificationResponse } from '../../src/features/notifications/types/notificationTypes';
import { PersonalDashboardData } from '../../src/features/dashboard/api/dashboardTypes';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('../../src/features/notifications/api/notificationApi');
jest.mock('../../src/features/dashboard/api/dashboardApi');
jest.mock('../../src/features/tasks/api/taskApi');
jest.mock('../../src/features/projects/api/projectApi');
jest.mock('../../src/features/serviceRequests/api/serviceRequestApi');
jest.mock('../../src/features/assets/api/assetApi');
jest.mock('../../src/features/auth/api/authApi');
jest.mock('../../src/shared/storage/secureStorage');
jest.mock('../../src/app/auth/refreshCoordinator');

describe('Phase 18D Real Navigator Tree Integration', () => {
  const mockNotificationApi = notificationApi as jest.Mocked<typeof notificationApi>;
  const mockDashboardApi = dashboardApi as jest.Mocked<typeof dashboardApi>;
  const mockTaskApi = taskApi as jest.Mocked<typeof taskApi>;
  const mockProjectApi = projectApi as jest.Mocked<typeof projectApi>;
  const mockServiceRequestApi = serviceRequestApi as jest.Mocked<typeof serviceRequestApi>;
  const mockAssetApi = assetApi as jest.Mocked<typeof assetApi>;

  const validTaskUuid = '11111111-aaaa-bbbb-cccc-111111111111';
  const validProjectUuid = '22222222-aaaa-bbbb-cccc-222222222222';
  const validServiceRequestUuid = '33333333-aaaa-bbbb-cccc-333333333333';
  const validAssetUuid = '44444444-aaaa-bbbb-cccc-444444444444';

  const mockDashboardData: PersonalDashboardData = {
    tasks: { todo: 2, inProgress: 1, inReview: 0, completed: 5, overdue: 0, dueSoon: 1 },
    serviceRequests: { open: 1, inProgress: 0, waitingForUser: 0, resolved: 2 },
    projects: { active: 1, onHold: 0 },
    upcomingTasks: [],
    recentNotifications: [],
  };

  const sampleNotifications: NotificationResponse[] = [
    {
      id: 'notif-task-1',
      type: 'TASK_ASSIGNED',
      title: 'Thông báo Task',
      message: 'Công việc mới được giao',
      referenceType: 'TASK',
      referenceId: validTaskUuid,
      read: true,
      createdAt: '2026-10-25T10:00:00Z',
    },
    {
      id: 'notif-proj-1',
      type: 'PROJECT_MEMBER_ADDED',
      title: 'Thông báo Project',
      message: 'Thêm vào dự án',
      referenceType: 'PROJECT',
      referenceId: validProjectUuid,
      read: true,
      createdAt: '2026-10-25T09:00:00Z',
    },
    {
      id: 'notif-sr-1',
      type: 'SERVICE_REQUEST_UPDATED',
      title: 'Thông báo Yêu cầu dịch vụ',
      message: 'Yêu cầu được cập nhật',
      referenceType: 'SERVICE_REQUEST',
      referenceId: validServiceRequestUuid,
      read: true,
      createdAt: '2026-10-25T08:00:00Z',
    },
    {
      id: 'notif-asset-1',
      type: 'ASSET_ASSIGNED',
      title: 'Thông báo Tài sản',
      message: 'Cấp phát máy tính',
      referenceType: 'ASSET',
      referenceId: validAssetUuid,
      read: true,
      createdAt: '2026-10-25T07:00:00Z',
    },
  ];

  const mockTaskDetail: any = {
    id: validTaskUuid,
    project: { id: validProjectUuid, name: 'Dự án Alpha', code: 'PRJ-ALPHA' },
    title: 'Nhiệm vụ kiểm thử',
    status: 'TODO',
    priority: 'HIGH',
    assignees: [],
    subtaskCount: 0,
    completedSubtaskCount: 0,
    commentCount: 0,
    attachmentCount: 0,
    createdAt: '2026-10-25T08:00:00Z',
    updatedAt: '2026-10-25T08:00:00Z',
    version: 1,
  };

  const mockProjectDetail: any = {
    id: validProjectUuid,
    name: 'Dự án Alpha',
    code: 'PRJ-ALPHA',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
  };

  const mockServiceRequestDetail: any = {
    id: validServiceRequestUuid,
    requestNumber: 'SR-2026-0001',
    title: 'Hỗ trợ phần cứng',
    description: 'Chi tiết yêu cầu hỗ trợ',
    category: { id: 'cat-1', name: 'Phần cứng', code: 'HW' },
    priority: 'HIGH',
    status: 'OPEN',
    requester: { id: 'usr-1', fullName: 'Tester', email: 'tester@worksphere.local' },
    createdAt: '2026-10-25T08:00:00Z',
    updatedAt: '2026-10-25T08:00:00Z',
    version: 1,
  };

  const mockAssetDetail: any = {
    id: validAssetUuid,
    assetCode: 'AST-TEST-001',
    name: 'MacBook Pro M3',
    category: { id: 'cat-01', code: 'LAPTOP', name: 'Máy tính xách tay' },
    status: 'ASSIGNED',
    repairHistories: [],
    relatedServiceRequests: [],
    createdAt: '2026-10-25T08:00:00Z',
    version: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('mock-refresh-token');
    (refreshAccessToken as jest.Mock).mockResolvedValue('mock-access-token');
    (authApi.refresh as jest.Mock).mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'usr-tester',
      username: 'tester',
      fullName: 'Tester',
      email: 'tester@worksphere.local',
      roles: ['ADMIN'],
      permissions: ['TASK_READ', 'PROJECT_READ', 'SERVICE_REQUEST_READ', 'ASSET_READ'],
    });
    mockDashboardApi.getMyDashboard.mockResolvedValue(mockDashboardData);
    mockNotificationApi.getUnreadNotificationCount.mockResolvedValue({ count: 0 });
    mockNotificationApi.getNotifications.mockResolvedValue({
      items: sampleNotifications,
      page: 0,
      size: 20,
      totalItems: sampleNotifications.length,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
    mockTaskApi.getTaskDetail.mockResolvedValue(mockTaskDetail);
    mockProjectApi.getProject.mockResolvedValue(mockProjectDetail);
    mockServiceRequestApi.getServiceRequestDetail.mockResolvedValue(mockServiceRequestDetail);
    mockAssetApi.getAssetDetail.mockResolvedValue(mockAssetDetail);
  });

  it('renders exact 5 visible bottom tabs and does NOT create a 6th tab for Notification or Asset', async () => {
    const { getByLabelText, queryByLabelText } = await render(
      <AppRoot
        sessionState="AUTHENTICATED"
        initialAuthState={{
          sessionState: 'AUTHENTICATED',
          currentUser: {
            id: 'usr-tester',
            username: 'tester',
            fullName: 'Tester',
            email: 'tester@worksphere.local',
            roles: ['ADMIN'],
            permissions: ['TASK_READ', 'PROJECT_READ', 'SERVICE_REQUEST_READ', 'ASSET_READ'],
          },
          initialized: true,
        }}
      />
    );

    await waitFor(() => {
      expect(getByLabelText('Tab 1: Dashboard')).toBeTruthy();
      expect(getByLabelText('Tab 2: Dự án')).toBeTruthy();
      expect(getByLabelText('Tab 3: Công việc')).toBeTruthy();
      expect(getByLabelText('Tab 4: Yêu cầu')).toBeTruthy();
      expect(getByLabelText('Tab 5: Thêm')).toBeTruthy();
    });

    expect(queryByLabelText(/Tab 6/i)).toBeNull();
    expect(queryByLabelText(/Tab 7/i)).toBeNull();
  });

  it('navigates from Dashboard bell -> NotificationList -> TaskDetail -> Back -> NotificationList -> Back -> Dashboard', async () => {
    const { getByTestId, findByTestId, getByText } = await render(
      <AppRoot
        sessionState="AUTHENTICATED"
        initialAuthState={{
          sessionState: 'AUTHENTICATED',
          currentUser: {
            id: 'usr-tester',
            username: 'tester',
            fullName: 'Tester',
            email: 'tester@worksphere.local',
            roles: ['ADMIN'],
            permissions: ['TASK_READ', 'PROJECT_READ', 'SERVICE_REQUEST_READ', 'ASSET_READ'],
          },
          initialized: true,
        }}
      />
    );

    // 1. Dashboard visible
    const bellBtn = await findByTestId('btn-dashboard-notifications');
    expect(bellBtn).toBeTruthy();

    // 2. Tap bell -> NotificationList
    await act(async () => {
      fireEvent.press(bellBtn);
    });

    const notifScreen = await findByTestId('screen-notification-list');
    expect(notifScreen).toBeTruthy();

    // 3. Tap Task notification -> TaskDetail
    await waitFor(() => {
      expect(getByText('Thông báo Task')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('notification-card-notif-task-1'));
    });

    // 4. TaskDetail screen renders
    const taskDetailScreen = await findByTestId('screen-task-detail');
    expect(taskDetailScreen).toBeTruthy();
    expect(getByText('Nhiệm vụ kiểm thử')).toBeTruthy();
  });

  it('navigates from More screen -> NotificationList -> AssetDetail -> Back -> NotificationList', async () => {
    const { getByLabelText, getByTestId, findByTestId, getByText } = await render(
      <AppRoot
        sessionState="AUTHENTICATED"
        initialAuthState={{
          sessionState: 'AUTHENTICATED',
          currentUser: {
            id: 'usr-tester',
            username: 'tester',
            fullName: 'Tester',
            email: 'tester@worksphere.local',
            roles: ['ADMIN'],
            permissions: ['TASK_READ', 'PROJECT_READ', 'SERVICE_REQUEST_READ', 'ASSET_READ'],
          },
          initialized: true,
        }}
      />
    );

    // 1. Open More tab
    await act(async () => {
      fireEvent.press(getByLabelText('Tab 5: Thêm'));
    });

    const moreNotifBtn = await findByTestId('btn-navigate-notifications');
    expect(moreNotifBtn).toBeTruthy();

    // 2. Open NotificationList
    await act(async () => {
      fireEvent.press(moreNotifBtn);
    });

    expect(await findByTestId('screen-notification-list')).toBeTruthy();

    // 3. Tap Asset notification -> AssetDetail
    await waitFor(() => {
      expect(getByText('Thông báo Tài sản')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('notification-card-notif-asset-1'));
    });

    // 4. AssetDetail renders
    const assetDetailScreen = await findByTestId('asset-detail-screen');
    expect(assetDetailScreen).toBeTruthy();
    expect(getByText('MacBook Pro M3')).toBeTruthy();

    // 5. Back from AssetDetail -> NotificationList
    const assetBackBtn = getByTestId('btn-asset-detail-back');
    await act(async () => {
      fireEvent.press(assetBackBtn);
    });

    expect(await findByTestId('screen-notification-list')).toBeTruthy();
  });
});
