import {
  notificationApi,
  serializeNotificationListQuery,
} from '../../src/features/notifications/api/notificationApi';
import { http } from '../../src/shared/api';
import {
  NotificationListQuery,
  NotificationResponse,
  ReadAllNotificationsResponse,
  UnreadCountResponse,
} from '../../src/features/notifications/types/notificationTypes';

jest.mock('../../src/shared/api', () => ({
  http: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe('Notification API & Query Serializer', () => {
  const mockHttp = http as jest.Mocked<typeof http>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('serializeNotificationListQuery', () => {
    it('returns empty object when query is undefined', () => {
      expect(serializeNotificationListQuery(undefined)).toEqual({});
    });

    it('serializes complete query correctly', () => {
      const query: NotificationListQuery = {
        page: 1,
        size: 15,
        read: false,
        type: 'TASK_ASSIGNED',
        sort: 'createdAt,desc',
      };

      const result = serializeNotificationListQuery(query);
      expect(result).toEqual({
        page: 1,
        size: 15,
        read: false,
        type: 'TASK_ASSIGNED',
        sort: 'createdAt,desc',
      });
    });

    it('preserves read=false boolean without dropping it', () => {
      const result = serializeNotificationListQuery({ read: false });
      expect(result.read).toBe(false);
    });

    it('preserves read=true boolean', () => {
      const result = serializeNotificationListQuery({ read: true });
      expect(result.read).toBe(true);
    });

    it('ignores invalid page and size', () => {
      const result = serializeNotificationListQuery({ page: -1, size: 0 });
      expect(result.page).toBeUndefined();
      expect(result.size).toBeUndefined();
    });

    it('ignores invalid sort properties', () => {
      const result = serializeNotificationListQuery({ sort: 'unsupportedField,asc' });
      expect(result.sort).toBeUndefined();
    });

    it('accepts valid sort property createdAt', () => {
      const result = serializeNotificationListQuery({ sort: 'createdAt,asc' });
      expect(result.sort).toBe('createdAt,asc');
    });
  });

  describe('notificationApi methods', () => {
    const sampleNotification: NotificationResponse = {
      id: 'notif-101',
      type: 'PROJECT_MEMBER_ADDED',
      title: 'Dự án mới',
      message: 'Bạn đã được thêm vào dự án WorkSphere',
      referenceType: 'PROJECT',
      referenceId: 'proj-1',
      read: false,
      createdAt: '2026-10-25T11:00:00Z',
    };

    it('getNotifications calls GET /notifications with serialized params', async () => {
      const samplePage = {
        items: [sampleNotification],
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      mockHttp.get.mockResolvedValueOnce(samplePage);

      const result = await notificationApi.getNotifications({ read: false, page: 0 });

      expect(mockHttp.get).toHaveBeenCalledWith('/notifications', {
        params: { read: false, page: 0 },
      });
      expect(result).toEqual(samplePage);
    });

    it('getNotifications throws if server response is not a valid NotificationPage', async () => {
      mockHttp.get.mockResolvedValueOnce({ invalid: 'page' });

      await expect(notificationApi.getNotifications()).rejects.toThrow(
        'Dữ liệu danh sách thông báo máy chủ trả về không hợp lệ'
      );
    });

    it('markNotificationRead calls PUT /notifications/{notificationId}/read with exact ID', async () => {
      mockHttp.put.mockResolvedValueOnce(null);

      await notificationApi.markNotificationRead('notif-101');

      expect(mockHttp.put).toHaveBeenCalledWith('/notifications/notif-101/read');
    });

    it('markNotificationRead throws error on invalid notificationId', async () => {
      await expect(notificationApi.markNotificationRead('')).rejects.toThrow(
        'Mã thông báo không hợp lệ'
      );
      await expect(notificationApi.markNotificationRead('   ')).rejects.toThrow(
        'Mã thông báo không hợp lệ'
      );
    });

    it('markAllNotificationsRead calls PUT /notifications/read-all', async () => {
      const sampleResponse: ReadAllNotificationsResponse = { updatedCount: 4 };
      mockHttp.put.mockResolvedValueOnce(sampleResponse);

      const result = await notificationApi.markAllNotificationsRead();

      expect(mockHttp.put).toHaveBeenCalledWith('/notifications/read-all');
      expect(result).toEqual(sampleResponse);
    });

    it('markAllNotificationsRead throws error on invalid response envelope', async () => {
      mockHttp.put.mockResolvedValueOnce({ invalid: true });

      await expect(notificationApi.markAllNotificationsRead()).rejects.toThrow(
        'Dữ liệu xác nhận đánh dấu đã đọc máy chủ trả về không hợp lệ'
      );
    });

    it('getUnreadNotificationCount calls GET /notifications/unread-count', async () => {
      const sampleResponse: UnreadCountResponse = { count: 7 };
      mockHttp.get.mockResolvedValueOnce(sampleResponse);

      const result = await notificationApi.getUnreadNotificationCount();

      expect(mockHttp.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toEqual(sampleResponse);
    });

    it('getUnreadNotificationCount throws error on invalid response', async () => {
      mockHttp.get.mockResolvedValueOnce({ count: -5 });

      await expect(notificationApi.getUnreadNotificationCount()).rejects.toThrow(
        'Dữ liệu số lượng thông báo chưa đọc máy chủ trả về không hợp lệ'
      );
    });
  });
});
