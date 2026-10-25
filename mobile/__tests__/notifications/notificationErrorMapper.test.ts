import {
  mapNotificationError,
} from '../../src/features/notifications/errors/notificationErrorMapper';
import { NormalizedApiError } from '../../src/shared/api';

describe('Notification Error Mapper', () => {
  it('maps explicit NOTIFICATION_NOT_FOUND error code', () => {
    const error: NormalizedApiError = {
      kind: 'NOT_FOUND',
      message: 'Notification not found',
      status: 404,
      backendCode: 'NOTIFICATION_NOT_FOUND',
      traceId: 'trace-notif-1',
    };

    const result = mapNotificationError(error, 'markRead');
    expect(result.message).toBe('Không tìm thấy thông báo hoặc thông báo đã được xử lý');
    expect(result.placement).toBe('toast');
    expect(result.isNotFound).toBe(true);
    expect(result.retryable).toBe(false);
    expect(result.traceId).toBe('trace-notif-1');
  });

  it('maps ACCESS_DENIED error code', () => {
    const error: NormalizedApiError = {
      kind: 'FORBIDDEN',
      message: 'Access denied',
      status: 403,
      backendCode: 'ACCESS_DENIED',
    };

    const result = mapNotificationError(error);
    expect(result.message).toBe('Bạn không có quyền thao tác trên thông báo này');
    expect(result.placement).toBe('dialog');
    expect(result.isForbidden).toBe(true);
  });

  it('maps HTTP 401 Unauthorized', () => {
    const error: NormalizedApiError = {
      kind: 'UNAUTHORIZED',
      message: 'Token expired',
      status: 401,
    };

    const result = mapNotificationError(error);
    expect(result.message).toBe('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    expect(result.placement).toBe('dialog');
    expect(result.isUnauthorized).toBe(true);
  });

  it('maps HTTP 403 Forbidden', () => {
    const error: NormalizedApiError = {
      kind: 'FORBIDDEN',
      message: 'Forbidden',
      status: 403,
    };

    const result = mapNotificationError(error);
    expect(result.message).toBe('Bạn không có quyền thực hiện thao tác thông báo này');
    expect(result.placement).toBe('dialog');
    expect(result.isForbidden).toBe(true);
  });

  it('maps HTTP 404 Not Found based on context', () => {
    const error: NormalizedApiError = {
      kind: 'NOT_FOUND',
      message: 'Not found',
      status: 404,
    };

    const markReadResult = mapNotificationError(error, 'markRead');
    expect(markReadResult.placement).toBe('toast');

    const listResult = mapNotificationError(error, 'list');
    expect(listResult.placement).toBe('dialog');
  });

  it('maps NETWORK_ERROR securely without leaking raw internals', () => {
    const error: NormalizedApiError = {
      kind: 'NETWORK_ERROR',
      message: 'Network error details',
    };

    const result = mapNotificationError(error);
    expect(result.message).toBe('Không có kết nối mạng. Vui lòng kiểm tra lại đường truyền internet.');
    expect(result.placement).toBe('banner');
    expect(result.retryable).toBe(true);
  });

  it('maps TIMEOUT error', () => {
    const error: NormalizedApiError = {
      kind: 'TIMEOUT',
      message: 'Timeout details',
      status: 408,
    };

    const result = mapNotificationError(error);
    expect(result.message).toBe('Kết nối máy chủ bị quá hạn. Vui lòng thử lại sau.');
    expect(result.placement).toBe('banner');
    expect(result.retryable).toBe(true);
  });

  it('maps 5xx Server Error', () => {
    const error: NormalizedApiError = {
      kind: 'SERVER_ERROR',
      message: 'Internal server error',
      status: 500,
    };

    const result = mapNotificationError(error);
    expect(result.message).toBe('Hệ thống thông báo tạm thời gián đoạn. Vui lòng thử lại sau.');
    expect(result.placement).toBe('banner');
    expect(result.retryable).toBe(true);
  });

  it('provides contextual fallback messages for general errors', () => {
    const generalError = new Error('Unknown runtime error');

    expect(mapNotificationError(generalError, 'list').message).toBe(
      'Không thể tải danh sách thông báo. Vui lòng thử lại.'
    );
    expect(mapNotificationError(generalError, 'markRead').message).toBe(
      'Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại.'
    );
    expect(mapNotificationError(generalError, 'markAllRead').message).toBe(
      'Không thể đánh dấu tất cả thông báo đã đọc. Vui lòng thử lại.'
    );
    expect(mapNotificationError(generalError, 'unreadCount').message).toBe(
      'Không thể cập nhật số lượng thông báo chưa đọc.'
    );
  });
});
