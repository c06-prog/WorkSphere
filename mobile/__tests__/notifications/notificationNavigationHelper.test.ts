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
      const target = getNotificationNavigationTarget('TASK', 'c183cf9e-105e-4c7c-b630-b4f0b2f3bc11');
      expect(target).toEqual({
        screen: 'TaskDetail',
        params: { taskId: 'c183cf9e-105e-4c7c-b630-b4f0b2f3bc11' },
      });
    });

    it('maps PROJECT reference to ProjectDetail screen with projectId', () => {
      const target = getNotificationNavigationTarget('PROJECT', 'd294daaf-216f-4d8d-a741-c501c3e4cd22');
      expect(target).toEqual({
        screen: 'ProjectDetail',
        params: { projectId: 'd294daaf-216f-4d8d-a741-c501c3e4cd22' },
      });
    });

    it('maps SERVICE_REQUEST reference to ServiceRequestDetail screen with requestId', () => {
      const target = getNotificationNavigationTarget('SERVICE_REQUEST', 'e305ebba-3270-4e9e-b852-d612d4f5de33');
      expect(target).toEqual({
        screen: 'ServiceRequestDetail',
        params: { requestId: 'e305ebba-3270-4e9e-b852-d612d4f5de33' },
      });
    });

    it('maps ASSET reference to AssetDetail screen with assetId', () => {
      const target = getNotificationNavigationTarget('ASSET', 'f416fccb-4381-4f0f-c963-e723e5a6ef44');
      expect(target).toEqual({
        screen: 'AssetDetail',
        params: { assetId: 'f416fccb-4381-4f0f-c963-e723e5a6ef44' },
      });
    });

    it('handles COMMENT_ADDED semantics: backend dispatches referenceType=TASK, referenceId=taskId', () => {
      // Per Decision D-067 and NotificationEventDispatcher.java:
      // When COMMENT_ADDED occurs, referenceType is TASK and referenceId is the parent taskId.
      const target = getNotificationNavigationTarget('TASK', 'a5270ddc-5492-4a1a-da74-f834f6b7fa55');
      expect(target).toEqual({
        screen: 'TaskDetail',
        params: { taskId: 'a5270ddc-5492-4a1a-da74-f834f6b7fa55' },
      });
    });

    it('handles ASSET_ASSIGNED semantics: backend dispatches referenceType=ASSET, referenceId=assetId', () => {
      // Per Decision D-067 and NotificationEventDispatcher.java:
      // When ASSET_ASSIGNED occurs, referenceId is the asset UUID, not assignment UUID.
      const target = getNotificationNavigationTarget('ASSET', 'b6381eed-65a3-4b2b-eb85-0945a7c80b66');
      expect(target).toEqual({
        screen: 'AssetDetail',
        params: { assetId: 'b6381eed-65a3-4b2b-eb85-0945a7c80b66' },
      });
    });

    it('returns null when referenceId is not a valid UUID', () => {
      expect(getNotificationNavigationTarget('TASK', 'non-uuid-string')).toBeNull();
      expect(getNotificationNavigationTarget('TASK', '12345')).toBeNull();
    });

    it('returns null when referenceType or referenceId is null, undefined, or empty', () => {
      expect(getNotificationNavigationTarget(null, 'c183cf9e-105e-4c7c-b630-b4f0b2f3bc11')).toBeNull();
      expect(getNotificationNavigationTarget(undefined, 'c183cf9e-105e-4c7c-b630-b4f0b2f3bc11')).toBeNull();
      expect(getNotificationNavigationTarget('TASK', null)).toBeNull();
      expect(getNotificationNavigationTarget('TASK', undefined)).toBeNull();
      expect(getNotificationNavigationTarget('TASK', '   ')).toBeNull();
      expect(getNotificationNavigationTarget('UNKNOWN' as any, 'c183cf9e-105e-4c7c-b630-b4f0b2f3bc11')).toBeNull();
    });
  });
});
