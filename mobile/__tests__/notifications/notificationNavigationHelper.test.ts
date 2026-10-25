import { getNotificationNavigationTarget } from '../../src/features/notifications/navigation/notificationNavigationHelper';
import type { AppStackParamList, MainTabParamList } from '../../src/app/navigation/types';

describe('Notification Navigation Helper & Route Contract', () => {
  describe('Route Param List Contract', () => {
    it('verifies NotificationList is in AppStackParamList and NOT in MainTabParamList', () => {
      // Type assertion tests
      type HasNotificationListInAppStack = 'NotificationList' extends keyof AppStackParamList ? true : false;
      type HasNotificationListInMainTab = 'NotificationList' extends keyof MainTabParamList ? true : false;

      const inAppStack: HasNotificationListInAppStack = true;
      const inMainTab: HasNotificationListInMainTab = false;

      expect(inAppStack).toBe(true);
      expect(inMainTab).toBe(false);
    });
  });

  describe('getNotificationNavigationTarget', () => {
    it('maps TASK reference to TaskDetail screen with taskId', () => {
      const target = getNotificationNavigationTarget('TASK', 'task-uuid-123');
      expect(target).toEqual({
        screen: 'TaskDetail',
        params: { taskId: 'task-uuid-123' },
      });
    });

    it('maps PROJECT reference to ProjectDetail screen with projectId', () => {
      const target = getNotificationNavigationTarget('PROJECT', 'proj-uuid-456');
      expect(target).toEqual({
        screen: 'ProjectDetail',
        params: { projectId: 'proj-uuid-456' },
      });
    });

    it('maps SERVICE_REQUEST reference to ServiceRequestDetail screen with requestId', () => {
      const target = getNotificationNavigationTarget('SERVICE_REQUEST', 'req-uuid-789');
      expect(target).toEqual({
        screen: 'ServiceRequestDetail',
        params: { requestId: 'req-uuid-789' },
      });
    });

    it('maps ASSET reference to AssetDetail screen with assetId', () => {
      const target = getNotificationNavigationTarget('ASSET', 'asset-uuid-101');
      expect(target).toEqual({
        screen: 'AssetDetail',
        params: { assetId: 'asset-uuid-101' },
      });
    });

    it('handles COMMENT_ADDED semantics: backend dispatches referenceType=TASK, referenceId=taskId', () => {
      // Per Decision D-067 and NotificationEventDispatcher.java:
      // When COMMENT_ADDED occurs, referenceType is TASK and referenceId is the parent taskId.
      const target = getNotificationNavigationTarget('TASK', 'parent-task-uuid');
      expect(target).toEqual({
        screen: 'TaskDetail',
        params: { taskId: 'parent-task-uuid' },
      });
    });

    it('handles ASSET_ASSIGNED semantics: backend dispatches referenceType=ASSET, referenceId=assetId', () => {
      // Per Decision D-067 and NotificationEventDispatcher.java:
      // When ASSET_ASSIGNED occurs, referenceId is the asset UUID, not assignment UUID.
      const target = getNotificationNavigationTarget('ASSET', 'assigned-asset-uuid');
      expect(target).toEqual({
        screen: 'AssetDetail',
        params: { assetId: 'assigned-asset-uuid' },
      });
    });

    it('returns null when referenceType or referenceId is null, undefined, or empty', () => {
      expect(getNotificationNavigationTarget(null, 'id')).toBeNull();
      expect(getNotificationNavigationTarget(undefined, 'id')).toBeNull();
      expect(getNotificationNavigationTarget('TASK', null)).toBeNull();
      expect(getNotificationNavigationTarget('TASK', undefined)).toBeNull();
      expect(getNotificationNavigationTarget('TASK', '   ')).toBeNull();
      expect(getNotificationNavigationTarget('UNKNOWN' as any, 'id')).toBeNull();
    });
  });
});
