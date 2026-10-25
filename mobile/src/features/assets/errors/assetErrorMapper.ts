/**
 * Phase 17A: Presentation-Safe Asset Error Mapper
 * Maps NormalizedApiError into standardized AssetPresentationError for UI display.
 * Strict Security Invariants:
 * - Never reflects internal stack traces or raw database exceptions.
 * - Handles optimistic lock conflict (HTTP 409 OPTIMISTIC_LOCK_CONFLICT) with reload flag.
 * - Maps Vietnamese user-friendly messages for asset validation, status transitions,
 *   assignments, and return rules per Decision D-066 and 06_API_CONTRACT.md section 14.
 */

import { NormalizedApiError, normalizeError } from '../../../shared/api';

export type AssetErrorPlacement =
  | 'form'
  | 'dialog'
  | 'banner'
  | 'status'
  | 'assignments'
  | 'repair'
  | 'general';

export interface AssetPresentationError {
  message: string;
  placement: AssetErrorPlacement;
  retryable: boolean;
  isConflict: boolean;
  isNotFound: boolean;
  isForbidden: boolean;
  fieldErrors?: Record<string, string>;
  traceId?: string;
}

/**
 * Maps any caught error or NormalizedApiError into a presentation-safe AssetPresentationError.
 */
export function mapAssetError(error: unknown): AssetPresentationError {
  const normalized: NormalizedApiError = normalizeError(error);
  const traceId = normalized.traceId;
  const fieldErrors = normalized.fieldErrors;

  // 1. Map explicit backend business error codes
  if (normalized.backendCode) {
    switch (normalized.backendCode) {
      case 'ASSET_NOT_FOUND':
        return {
          message: 'Không tìm thấy thông tin tài sản',
          placement: 'dialog',
          retryable: false,
          isConflict: false,
          isNotFound: true,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_CATEGORY_NOT_FOUND':
        return {
          message: 'Không tìm thấy loại tài sản hoặc loại tài sản đã dừng hoạt động',
          placement: 'dialog',
          retryable: false,
          isConflict: false,
          isNotFound: true,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_CATEGORY_ALREADY_INACTIVE':
        return {
          message: 'Loại tài sản này hiện đang ngừng hoạt động',
          placement: 'form',
          retryable: false,
          isConflict: false,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'OPTIMISTIC_LOCK_CONFLICT':
        return {
          message: 'Dữ liệu đã bị thay đổi bởi giao dịch khác. Vui lòng tải lại trang.',
          placement: 'dialog',
          retryable: false,
          isConflict: true,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_NOT_AVAILABLE':
        return {
          message: 'Tài sản không ở trạng thái sẵn sàng để cấp phát',
          placement: 'status',
          retryable: false,
          isConflict: false,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_ALREADY_ASSIGNED':
        return {
          message: 'Tài sản đã được cấp phát cho người dùng khác',
          placement: 'assignments',
          retryable: false,
          isConflict: true,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_STATUS_TRANSITION_INVALID':
        return {
          message: 'Chuyển đổi trạng thái tài sản không hợp lệ',
          placement: 'status',
          retryable: false,
          isConflict: false,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_RETIRED':
        return {
          message: 'Tài sản đã thanh lý không thể thay đổi trạng thái hoặc chỉnh sửa',
          placement: 'dialog',
          retryable: false,
          isConflict: false,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_CODE_ALREADY_EXISTS':
        return {
          message: 'Mã tài sản đã tồn tại trong hệ thống',
          placement: 'form',
          retryable: false,
          isConflict: true,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_SERIAL_ALREADY_EXISTS':
      case 'ASSET_SERIAL_NUMBER_ALREADY_EXISTS':
        return {
          message: 'Số serial của tài sản đã tồn tại trong hệ thống',
          placement: 'form',
          retryable: false,
          isConflict: true,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_ASSIGNMENT_NOT_FOUND':
        return {
          message: 'Không tìm thấy lượt bàn giao cấp phát tài sản này',
          placement: 'dialog',
          retryable: false,
          isConflict: false,
          isNotFound: true,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_ASSIGNMENT_ALREADY_INACTIVE':
        return {
          message: 'Lượt bàn giao này đã kết thúc trước đó',
          placement: 'dialog',
          retryable: false,
          isConflict: true,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_ASSIGNMENT_NOT_ACTIVE':
        return {
          message: 'Phân công không ở trạng thái hoạt động',
          placement: 'dialog',
          retryable: false,
          isConflict: true,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'ASSET_ACCESS_DENIED':
        return {
          message: 'Bạn không có quyền truy cập hoặc thao tác trên tài sản này',
          placement: 'dialog',
          retryable: false,
          isConflict: false,
          isNotFound: false,
          isForbidden: true,
          traceId,
        };

      case 'USER_INACTIVE':
        return {
          message: 'Người dùng được chọn hiện không ở trạng thái hoạt động',
          placement: 'assignments',
          retryable: false,
          isConflict: false,
          isNotFound: false,
          isForbidden: false,
          traceId,
        };

      case 'SERVICE_REQUEST_NOT_FOUND':
        return {
          message: 'Không tìm thấy yêu cầu dịch vụ liên kết',
          placement: 'repair',
          retryable: false,
          isConflict: false,
          isNotFound: true,
          isForbidden: false,
          traceId,
        };

      default:
        break;
    }
  }

  // 2. Map based on normalized error kind
  switch (normalized.kind) {
    case 'CONFLICT':
      return {
        message: 'Dữ liệu đã bị thay đổi bởi giao dịch khác. Vui lòng tải lại trang.',
        placement: 'dialog',
        retryable: false,
        isConflict: true,
        isNotFound: false,
        isForbidden: false,
        traceId,
      };

    case 'NOT_FOUND':
      return {
        message: 'Tài nguyên tài sản không tồn tại hoặc đã bị xóa.',
        placement: 'dialog',
        retryable: false,
        isConflict: false,
        isNotFound: true,
        isForbidden: false,
        traceId,
      };

    case 'FORBIDDEN':
      return {
        message: 'Bạn không có quyền thực hiện thao tác này trên tài sản.',
        placement: 'dialog',
        retryable: false,
        isConflict: false,
        isNotFound: false,
        isForbidden: true,
        traceId,
      };

    case 'UNAUTHORIZED':
      return {
        message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
        placement: 'dialog',
        retryable: false,
        isConflict: false,
        isNotFound: false,
        isForbidden: false,
        traceId,
      };

    case 'VALIDATION_ERROR':
      return {
        message: normalized.message || 'Dữ liệu tài sản không hợp lệ. Vui lòng kiểm tra lại.',
        placement: 'form',
        retryable: false,
        isConflict: false,
        isNotFound: false,
        isForbidden: false,
        fieldErrors,
        traceId,
      };

    case 'NETWORK_ERROR':
    case 'TIMEOUT':
      return {
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
        placement: 'banner',
        retryable: true,
        isConflict: false,
        isNotFound: false,
        isForbidden: false,
        traceId,
      };

    case 'SERVER_ERROR':
      return {
        message: 'Hệ thống đang gặp sự cố khi xử lý dữ liệu tài sản. Vui lòng thử lại sau.',
        placement: 'dialog',
        retryable: true,
        isConflict: false,
        isNotFound: false,
        isForbidden: false,
        traceId,
      };

    default:
      return {
        message: 'Đã có lỗi xảy ra khi xử lý thông tin tài sản. Vui lòng thử lại.',
        placement: 'general',
        retryable: false,
        isConflict: false,
        isNotFound: false,
        isForbidden: false,
        traceId,
      };
  }
}
