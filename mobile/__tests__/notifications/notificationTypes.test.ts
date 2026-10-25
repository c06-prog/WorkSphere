import {
  NotificationType,
  NotificationReferenceType,
  NOTIFICATION_TYPES,
  NOTIFICATION_REFERENCE_TYPES,
  NOTIFICATION_SORT_PROPERTIES,
  isNotificationType,
  isNotificationReferenceType,
  isNotificationResponse,
  isNotificationPage,
  isReadAllNotificationsResponse,
  isUnreadCountResponse,
  NotificationResponse,
  ReadAllNotificationsResponse,
  UnreadCountResponse,
  NotificationPage,
} from '../../src/features/notifications/types/notificationTypes';

describe('Notification Types & Type Guards', () => {
  describe('Constants and Enums', () => {
    it('defines all canonical notification types per Decision D-067', () => {
      const expectedTypes: NotificationType[] = [
        'PROJECT_MEMBER_ADDED',
        'TASK_ASSIGNED',
        'TASK_STATUS_CHANGED',
        'TASK_DUE_SOON',
        'TASK_OVERDUE',
        'SERVICE_REQUEST_UPDATED',
        'COMMENT_ADDED',
        'ASSET_ASSIGNED',
      ];

      expect(NOTIFICATION_TYPES).toEqual(expectedTypes);
      expectedTypes.forEach((type) => {
        expect(isNotificationType(type)).toBe(true);
      });
    });

    it('rejects invalid or unknown notification types', () => {
      expect(isNotificationType('UNKNOWN_TYPE')).toBe(false);
      expect(isNotificationType('COMMENT')).toBe(false);
      expect(isNotificationType('')).toBe(false);
      expect(isNotificationType(null)).toBe(false);
      expect(isNotificationType(undefined)).toBe(false);
      expect(isNotificationType(123)).toBe(false);
    });

    it('defines canonical reference types excluding COMMENT', () => {
      const expectedReferences: NotificationReferenceType[] = [
        'PROJECT',
        'TASK',
        'SERVICE_REQUEST',
        'ASSET',
      ];

      expect(NOTIFICATION_REFERENCE_TYPES).toEqual(expectedReferences);
      expectedReferences.forEach((ref) => {
        expect(isNotificationReferenceType(ref)).toBe(true);
      });

      expect(isNotificationReferenceType('COMMENT')).toBe(false);
      expect(isNotificationReferenceType('USER')).toBe(false);
      expect(isNotificationReferenceType(null)).toBe(false);
      expect(isNotificationReferenceType(undefined)).toBe(false);
    });

    it('defines valid sort properties', () => {
      expect(NOTIFICATION_SORT_PROPERTIES).toContain('createdAt');
    });
  });

  describe('isNotificationResponse', () => {
    const validNotification: NotificationResponse = {
      id: 'notif-uuid-1',
      type: 'TASK_ASSIGNED',
      title: 'Bạn được giao nhiệm vụ mới',
      message: 'Nhiệm vụ: Thiết kế giao diện Notification',
      referenceType: 'TASK',
      referenceId: 'task-uuid-1',
      read: false,
      createdAt: '2026-10-25T10:00:00Z',
    };

    it('validates a complete valid NotificationResponse', () => {
      expect(isNotificationResponse(validNotification)).toBe(true);
    });

    it('accepts null referenceType and referenceId', () => {
      const withNullRefs: NotificationResponse = {
        ...validNotification,
        referenceType: null,
        referenceId: null,
      };
      expect(isNotificationResponse(withNullRefs)).toBe(true);
    });

    it('rejects invalid fields', () => {
      expect(isNotificationResponse(null)).toBe(false);
      expect(isNotificationResponse(undefined)).toBe(false);
      expect(isNotificationResponse('string')).toBe(false);
      expect(isNotificationResponse({ ...validNotification, id: '' })).toBe(false);
      expect(isNotificationResponse({ ...validNotification, type: 'INVALID' })).toBe(false);
      expect(isNotificationResponse({ ...validNotification, referenceType: 'INVALID' })).toBe(false);
      expect(isNotificationResponse({ ...validNotification, referenceId: 123 })).toBe(false);
      expect(isNotificationResponse({ ...validNotification, read: 'false' })).toBe(false);
      expect(isNotificationResponse({ ...validNotification, createdAt: '' })).toBe(false);
    });
  });

  describe('isNotificationPage', () => {
    const validItem: NotificationResponse = {
      id: 'notif-uuid-1',
      type: 'TASK_ASSIGNED',
      title: 'Task Assigned',
      message: 'Description',
      referenceType: 'TASK',
      referenceId: 'task-uuid-1',
      read: false,
      createdAt: '2026-10-25T10:00:00Z',
    };

    const validPage: NotificationPage = {
      items: [validItem],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };

    it('validates a valid NotificationPage', () => {
      expect(isNotificationPage(validPage)).toBe(true);
    });

    it('rejects an invalid page structure or items', () => {
      expect(isNotificationPage(null)).toBe(false);
      expect(isNotificationPage(undefined)).toBe(false);
      expect(isNotificationPage({ ...validPage, items: [{ invalid: true }] })).toBe(false);
      expect(isNotificationPage({ ...validPage, page: '0' })).toBe(false);
      expect(isNotificationPage({ ...validPage, totalItems: undefined })).toBe(false);
    });
  });

  describe('isReadAllNotificationsResponse', () => {
    it('validates ReadAllNotificationsResponse structure', () => {
      const valid: ReadAllNotificationsResponse = { updatedCount: 5 };
      expect(isReadAllNotificationsResponse(valid)).toBe(true);
      expect(isReadAllNotificationsResponse({ updatedCount: 0 })).toBe(true);
      expect(isReadAllNotificationsResponse({ updatedCount: -1 })).toBe(false);
      expect(isReadAllNotificationsResponse({ updatedCount: '5' })).toBe(false);
      expect(isReadAllNotificationsResponse(null)).toBe(false);
    });
  });

  describe('isUnreadCountResponse', () => {
    it('validates UnreadCountResponse structure', () => {
      const valid: UnreadCountResponse = { count: 3 };
      expect(isUnreadCountResponse(valid)).toBe(true);
      expect(isUnreadCountResponse({ count: 0 })).toBe(true);
      expect(isUnreadCountResponse({ count: -1 })).toBe(false);
      expect(isUnreadCountResponse({ count: '3' })).toBe(false);
      expect(isUnreadCountResponse(null)).toBe(false);
    });
  });
});
