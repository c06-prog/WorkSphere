import {
  isPersonalDashboardResponse,
  isProjectDashboardSummary,
  isRecentNotificationItem,
  isServiceRequestDashboardSummary,
  isTaskDashboardSummary,
  isUpcomingTaskItem,
  PersonalDashboardData,
} from '../../src/features/dashboard/api/dashboardTypes';

describe('Dashboard Types & Runtime Type Guards', () => {
  const validTaskSummary = {
    todo: 5,
    inProgress: 3,
    inReview: 1,
    completed: 10,
    overdue: 2,
    dueSoon: 4,
  };

  const validServiceRequestSummary = {
    open: 2,
    inProgress: 1,
    waitingForUser: 0,
    resolved: 7,
  };

  const validProjectSummary = {
    active: 3,
    onHold: 1,
  };

  const validUpcomingTask = {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    projectId: 'e92d4fae-7dec-11d0-a765-00a0c91e6bf7',
    projectName: 'Mobile App Revamp',
    title: 'Design Dashboard Wireframes',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-10-25T17:00:00Z',
  };

  const validNotification = {
    id: 'a12d4fae-7dec-11d0-a765-00a0c91e6bf8',
    type: 'TASK_ASSIGNED',
    title: 'Công việc mới được giao',
    message: 'Bạn đã được phân công công việc SCR-MAIN-01',
    referenceType: 'TASK',
    referenceId: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    read: false,
    createdAt: '2026-10-19T08:00:00Z',
  };

  const validDashboardData: PersonalDashboardData = {
    tasks: validTaskSummary,
    serviceRequests: validServiceRequestSummary,
    projects: validProjectSummary,
    upcomingTasks: [validUpcomingTask],
    recentNotifications: [validNotification],
  };

  describe('isTaskDashboardSummary', () => {
    it('returns true for valid task dashboard summary', () => {
      expect(isTaskDashboardSummary(validTaskSummary)).toBe(true);
    });

    it('returns false for null, primitive or missing fields', () => {
      expect(isTaskDashboardSummary(null)).toBe(false);
      expect(isTaskDashboardSummary(undefined)).toBe(false);
      expect(isTaskDashboardSummary(123)).toBe(false);
      expect(isTaskDashboardSummary({ ...validTaskSummary, overdue: 'two' })).toBe(false);
      expect(isTaskDashboardSummary({ todo: 1 })).toBe(false);
    });
  });

  describe('isServiceRequestDashboardSummary', () => {
    it('returns true for valid service request summary', () => {
      expect(isServiceRequestDashboardSummary(validServiceRequestSummary)).toBe(true);
    });

    it('returns false for invalid structures', () => {
      expect(isServiceRequestDashboardSummary(null)).toBe(false);
      expect(isServiceRequestDashboardSummary({ ...validServiceRequestSummary, open: null })).toBe(false);
    });
  });

  describe('isProjectDashboardSummary', () => {
    it('returns true for valid project summary', () => {
      expect(isProjectDashboardSummary(validProjectSummary)).toBe(true);
    });

    it('returns false for invalid structures', () => {
      expect(isProjectDashboardSummary(null)).toBe(false);
      expect(isProjectDashboardSummary({ active: 1 })).toBe(false);
    });
  });

  describe('isUpcomingTaskItem', () => {
    it('returns true for valid upcoming task item', () => {
      expect(isUpcomingTaskItem(validUpcomingTask)).toBe(true);
    });

    it('returns false when required fields are missing or wrong type', () => {
      expect(isUpcomingTaskItem(null)).toBe(false);
      expect(isUpcomingTaskItem({ ...validUpcomingTask, id: 123 })).toBe(false);
      expect(isUpcomingTaskItem({ ...validUpcomingTask, projectName: undefined })).toBe(false);
    });
  });

  describe('isRecentNotificationItem', () => {
    it('returns true for valid notification item', () => {
      expect(isRecentNotificationItem(validNotification)).toBe(true);
    });

    it('returns false when fields are missing or not boolean/string', () => {
      expect(isRecentNotificationItem(null)).toBe(false);
      expect(isRecentNotificationItem({ ...validNotification, read: 'yes' })).toBe(false);
      expect(isRecentNotificationItem({ ...validNotification, message: null })).toBe(false);
    });
  });

  describe('isPersonalDashboardResponse', () => {
    it('returns true for complete valid dashboard data', () => {
      expect(isPersonalDashboardResponse(validDashboardData)).toBe(true);
    });

    it('returns true for dashboard data with empty lists', () => {
      const emptyDashboard: PersonalDashboardData = {
        tasks: validTaskSummary,
        serviceRequests: validServiceRequestSummary,
        projects: validProjectSummary,
        upcomingTasks: [],
        recentNotifications: [],
      };
      expect(isPersonalDashboardResponse(emptyDashboard)).toBe(true);
    });

    it('returns false for null or non-object', () => {
      expect(isPersonalDashboardResponse(null)).toBe(false);
      expect(isPersonalDashboardResponse(undefined)).toBe(false);
      expect(isPersonalDashboardResponse('invalid')).toBe(false);
    });

    it('returns false when nested summaries are invalid or arrays contain malformed items', () => {
      expect(
        isPersonalDashboardResponse({
          ...validDashboardData,
          tasks: { ...validTaskSummary, overdue: 'invalid' },
        })
      ).toBe(false);

      expect(
        isPersonalDashboardResponse({
          ...validDashboardData,
          upcomingTasks: [{ invalid: true }],
        })
      ).toBe(false);

      expect(
        isPersonalDashboardResponse({
          ...validDashboardData,
          recentNotifications: [{ invalid: true }],
        })
      ).toBe(false);
    });
  });
});
