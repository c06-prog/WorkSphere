/**
 * Phase 18A: Presentation-Safe Notification Error Mapper
 * Maps NormalizedApiError into standardized NotificationPresentationError for UI display.
 * Strict Security Invariants:
 * - Never reflects internal stack traces, recipient IDs or raw backend exceptions.
 * - Maps Vietnamese user-friendly messages for notification retrieval, read mutations, and unread counts.
 */

import { NormalizedApiError, normalizeError } from '../../../shared/api';

export type NotificationErrorPlacement =
  | 'banner'
  | 'dialog'
  | 'toast'
  | 'general';

export type NotificationActionContext =
  | 'list'
  | 'markRead'
  | 'markAllRead'
  | 'unreadCount';

export interface NotificationPresentationError {
  message: string;
  placement: NotificationErrorPlacement;
  retryable: boolean;
  isNotFound: boolean;
  isForbidden: boolean;
  isUnauthorized: boolean;
  traceId?: string;
}

/**
 * Maps any caught error or NormalizedApiError into a presentation-safe NotificationPresentationError.
 */
export function mapNotificationError(
  error: unknown,
  context: NotificationActionContext = 'general' as NotificationActionContext
): NotificationPresentationError {
  const normalized: NormalizedApiError = normalizeError(error);
  const traceId = normalized.traceId;

  // 1. Explicit backend business error codes
  if (normalized.backendCode) {
    switch (normalized.backendCode) {
      case 'NOTIFICATION_NOT_FOUND':
        return {
          message: 'Không tìm thấy thông báo hoặc thông báo đã được xử lý',
          placement: 'toast',
          retryable: false,
          isNotFound: true,
          isForbidden: false,
          isUnauthorized: false,
          traceId,
        };
      case 'NOTIFICATION_ACCESS_DENIED':
      case 'ACCESS_DENIED':
        return {
          message: 'Bạn không có quyền thao tác trên thông báo này',
          placement: 'dialog',
          retryable: false,
          isNotFound: false,
          isForbidden: true,
          isUnauthorized: false,
          traceId,
        };
      default:
        break;
    }
  }

  // 2. HTTP Status Code Mapping
  if (normalized.status === 401) {
    return {
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      placement: 'dialog',
      retryable: false,
      isNotFound: false,
      isForbidden: false,
      isUnauthorized: true,
      traceId,
    };
  }

  if (normalized.status === 403) {
    return {
      message: 'Bạn không có quyền thực hiện thao tác thông báo này',
      placement: 'dialog',
      retryable: false,
      isNotFound: false,
      isForbidden: true,
      isUnauthorized: false,
      traceId,
    };
  }

  if (normalized.status === 404) {
    return {
      message: 'Không tìm thấy dữ liệu thông báo được yêu cầu',
      placement: context === 'markRead' ? 'toast' : 'dialog',
      retryable: false,
      isNotFound: true,
      isForbidden: false,
      isUnauthorized: false,
      traceId,
    };
  }

  if (normalized.status === 400 || normalized.status === 422) {
    return {
      message: 'Yêu cầu xử lý thông báo không hợp lệ',
      placement: 'toast',
      retryable: false,
      isNotFound: false,
      isForbidden: false,
      isUnauthorized: false,
      traceId,
    };
  }

  // 3. Network, Timeout, Server Errors
  if (normalized.kind === 'NETWORK_ERROR') {
    return {
      message: 'Không có kết nối mạng. Vui lòng kiểm tra lại đường truyền internet.',
      placement: 'banner',
      retryable: true,
      isNotFound: false,
      isForbidden: false,
      isUnauthorized: false,
      traceId,
    };
  }

  if (normalized.kind === 'TIMEOUT' || normalized.status === 408 || normalized.backendCode === 'TIMEOUT') {
    return {
      message: 'Kết nối máy chủ bị quá hạn. Vui lòng thử lại sau.',
      placement: 'banner',
      retryable: true,
      isNotFound: false,
      isForbidden: false,
      isUnauthorized: false,
      traceId,
    };
  }

  if (normalized.status && normalized.status >= 500) {
    return {
      message: 'Hệ thống thông báo tạm thời gián đoạn. Vui lòng thử lại sau.',
      placement: 'banner',
      retryable: true,
      isNotFound: false,
      isForbidden: false,
      isUnauthorized: false,
      traceId,
    };
  }

  // 4. Default / Contextual Fallbacks
  let defaultMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  if (context === 'list') {
    defaultMessage = 'Không thể tải danh sách thông báo. Vui lòng thử lại.';
  } else if (context === 'markRead') {
    defaultMessage = 'Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại.';
  } else if (context === 'markAllRead') {
    defaultMessage = 'Không thể đánh dấu tất cả thông báo đã đọc. Vui lòng thử lại.';
  } else if (context === 'unreadCount') {
    defaultMessage = 'Không thể cập nhật số lượng thông báo chưa đọc.';
  }

  return {
    message: defaultMessage,
    placement: context === 'unreadCount' ? 'toast' : 'banner',
    retryable: true,
    isNotFound: false,
    isForbidden: false,
    isUnauthorized: false,
    traceId,
  };
}
