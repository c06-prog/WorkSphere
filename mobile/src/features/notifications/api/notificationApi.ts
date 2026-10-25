/**
 * Phase 18A: Mobile Notification API Transport Adapter
 * Connects mobile Notification feature to backend Spring Boot REST endpoints.
 * Implements canonical methods matching Decision D-067 & 06_API_CONTRACT.md section 15.
 */

import { http, PagedData } from '../../../shared/api';
import {
  isNotificationPage,
  isNotificationType,
  isReadAllNotificationsResponse,
  isUnreadCountResponse,
  NotificationListQuery,
  NotificationResponse,
  NOTIFICATION_SORT_PROPERTIES,
  NotificationSortProperty,
  ReadAllNotificationsResponse,
  UnreadCountResponse,
} from '../types/notificationTypes';

function isNotificationSortProperty(property: string): property is NotificationSortProperty {
  return (NOTIFICATION_SORT_PROPERTIES as readonly string[]).includes(property);
}

/**
 * Serializes NotificationListQuery parameters deterministically.
 */
export function serializeNotificationListQuery(
  query?: NotificationListQuery
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};

  if (!query) {
    return params;
  }

  if (typeof query.page === 'number' && query.page >= 0) {
    params.page = query.page;
  }

  if (typeof query.size === 'number' && query.size > 0) {
    params.size = query.size;
  }

  if (typeof query.read === 'boolean') {
    params.read = query.read;
  }

  if (query.type && isNotificationType(query.type)) {
    params.type = query.type;
  }

  if (query.sort && typeof query.sort === 'string') {
    const trimmed = query.sort.trim();
    if (trimmed.length > 0) {
      const [field] = trimmed.split(',');
      if (isNotificationSortProperty(field.trim())) {
        params.sort = trimmed;
      }
    }
  }

  return params;
}

export const notificationApi = {
  /**
   * 15.1. Danh sách thông báo của người dùng hiện tại
   * GET /notifications
   */
  async getNotifications(query?: NotificationListQuery): Promise<PagedData<NotificationResponse>> {
    const params = serializeNotificationListQuery(query);
    const data = await http.get<PagedData<NotificationResponse>>('/notifications', { params });

    if (!isNotificationPage(data)) {
      throw new Error('Dữ liệu danh sách thông báo máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 15.2. Đánh dấu đã đọc một thông báo
   * PUT /notifications/{notificationId}/read
   * Backend returns 200 with ApiResponse<Void> (successNoContent)
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    if (!notificationId || typeof notificationId !== 'string' || notificationId.trim().length === 0) {
      throw new Error('Mã thông báo không hợp lệ');
    }

    await http.put<undefined, void>(`/notifications/${encodeURIComponent(notificationId.trim())}/read`);
  },

  /**
   * 15.3. Đánh dấu tất cả thông báo đã đọc
   * PUT /notifications/read-all
   * Backend returns 200 with ApiResponse<ReadAllNotificationsResponse>
   */
  async markAllNotificationsRead(): Promise<ReadAllNotificationsResponse> {
    const data = await http.put<undefined, ReadAllNotificationsResponse>('/notifications/read-all');

    if (!isReadAllNotificationsResponse(data)) {
      throw new Error('Dữ liệu xác nhận đánh dấu đã đọc máy chủ trả về không hợp lệ');
    }

    return data;
  },

  /**
   * 15.4. Số lượng thông báo chưa đọc
   * GET /notifications/unread-count
   * Backend returns 200 with ApiResponse<UnreadCountResponse>
   */
  async getUnreadNotificationCount(): Promise<UnreadCountResponse> {
    const data = await http.get<UnreadCountResponse>('/notifications/unread-count');

    if (!isUnreadCountResponse(data)) {
      throw new Error('Dữ liệu số lượng thông báo chưa đọc máy chủ trả về không hợp lệ');
    }

    return data;
  },
};
