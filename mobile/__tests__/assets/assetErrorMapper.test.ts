import { mapAssetError } from '../../src/features/assets/errors/assetErrorMapper';
import { NormalizedApiError } from '../../src/shared/api';

describe('Asset Error Mapper (mapAssetError)', () => {
  describe('Specific Backend Business Codes', () => {
    it('maps ASSET_NOT_FOUND to dialog with isNotFound=true', () => {
      const error: NormalizedApiError = {
        kind: 'NOT_FOUND',
        backendCode: 'ASSET_NOT_FOUND',
        status: 404,
        message: 'Raw error',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Không tìm thấy thông tin tài sản');
      expect(result.placement).toBe('dialog');
      expect(result.isNotFound).toBe(true);
      expect(result.retryable).toBe(false);
    });

    it('maps ASSET_CATEGORY_NOT_FOUND to dialog with isNotFound=true', () => {
      const error: NormalizedApiError = {
        kind: 'NOT_FOUND',
        backendCode: 'ASSET_CATEGORY_NOT_FOUND',
        status: 404,
        message: 'Category missing',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Không tìm thấy loại tài sản hoặc loại tài sản đã dừng hoạt động');
      expect(result.placement).toBe('dialog');
      expect(result.isNotFound).toBe(true);
    });

    it('maps ASSET_CATEGORY_ALREADY_INACTIVE to form placement', () => {
      const error: NormalizedApiError = {
        kind: 'VALIDATION_ERROR',
        backendCode: 'ASSET_CATEGORY_ALREADY_INACTIVE',
        status: 400,
        message: 'Category inactive',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Loại tài sản này hiện đang ngừng hoạt động');
      expect(result.placement).toBe('form');
    });

    it('maps OPTIMISTIC_LOCK_CONFLICT to dialog with isConflict=true', () => {
      const error: NormalizedApiError = {
        kind: 'CONFLICT',
        backendCode: 'OPTIMISTIC_LOCK_CONFLICT',
        status: 409,
        message: 'Concurrent update',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Dữ liệu đã bị thay đổi bởi giao dịch khác. Vui lòng tải lại trang.');
      expect(result.placement).toBe('dialog');
      expect(result.isConflict).toBe(true);
    });

    it('maps ASSET_NOT_AVAILABLE to status placement', () => {
      const error: NormalizedApiError = {
        kind: 'VALIDATION_ERROR',
        backendCode: 'ASSET_NOT_AVAILABLE',
        status: 400,
        message: 'Not available',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Tài sản không ở trạng thái sẵn sàng để cấp phát');
      expect(result.placement).toBe('status');
      expect(result.isConflict).toBe(false);
    });

    it('maps ASSET_ALREADY_ASSIGNED to assignments placement with isConflict=true', () => {
      const error: NormalizedApiError = {
        kind: 'CONFLICT',
        backendCode: 'ASSET_ALREADY_ASSIGNED',
        status: 409,
        message: 'Already assigned',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Tài sản đã được cấp phát cho người dùng khác');
      expect(result.placement).toBe('assignments');
      expect(result.isConflict).toBe(true);
    });

    it('maps ASSET_STATUS_TRANSITION_INVALID to status placement', () => {
      const error: NormalizedApiError = {
        kind: 'VALIDATION_ERROR',
        backendCode: 'ASSET_STATUS_TRANSITION_INVALID',
        status: 400,
        message: 'Invalid transition',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Chuyển đổi trạng thái tài sản không hợp lệ');
      expect(result.placement).toBe('status');
    });

    it('maps ASSET_RETIRED to dialog', () => {
      const error: NormalizedApiError = {
        kind: 'VALIDATION_ERROR',
        backendCode: 'ASSET_RETIRED',
        status: 400,
        message: 'Retired',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Tài sản đã thanh lý không thể thay đổi trạng thái hoặc chỉnh sửa');
      expect(result.placement).toBe('dialog');
    });

    it('maps ASSET_CODE_ALREADY_EXISTS to form with isConflict=true', () => {
      const error: NormalizedApiError = {
        kind: 'CONFLICT',
        backendCode: 'ASSET_CODE_ALREADY_EXISTS',
        status: 409,
        message: 'Asset code exists',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Mã tài sản đã tồn tại trong hệ thống');
      expect(result.placement).toBe('form');
      expect(result.isConflict).toBe(true);
    });

    it('maps ASSET_SERIAL_NUMBER_ALREADY_EXISTS to form with isConflict=true', () => {
      const error: NormalizedApiError = {
        kind: 'CONFLICT',
        backendCode: 'ASSET_SERIAL_NUMBER_ALREADY_EXISTS',
        status: 409,
        message: 'Serial exists',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Số serial của tài sản đã tồn tại trong hệ thống');
      expect(result.placement).toBe('form');
      expect(result.isConflict).toBe(true);
    });

    it('maps ASSET_ASSIGNMENT_NOT_FOUND to dialog placement with isNotFound=true', () => {
      const error: NormalizedApiError = {
        kind: 'NOT_FOUND',
        backendCode: 'ASSET_ASSIGNMENT_NOT_FOUND',
        status: 404,
        message: 'Assignment not found',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Không tìm thấy lượt bàn giao cấp phát tài sản này');
      expect(result.placement).toBe('dialog');
      expect(result.isNotFound).toBe(true);
    });

    it('maps ASSET_ASSIGNMENT_ALREADY_INACTIVE to dialog placement with isConflict=true', () => {
      const error: NormalizedApiError = {
        kind: 'CONFLICT',
        backendCode: 'ASSET_ASSIGNMENT_ALREADY_INACTIVE',
        status: 409,
        message: 'Assignment inactive',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Lượt bàn giao này đã kết thúc trước đó');
      expect(result.placement).toBe('dialog');
      expect(result.isConflict).toBe(true);
    });

    it('maps ASSET_ACCESS_DENIED to dialog with isForbidden=true', () => {
      const error: NormalizedApiError = {
        kind: 'FORBIDDEN',
        backendCode: 'ASSET_ACCESS_DENIED',
        status: 403,
        message: 'Access denied',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Bạn không có quyền truy cập hoặc thao tác trên tài sản này');
      expect(result.placement).toBe('dialog');
      expect(result.isForbidden).toBe(true);
    });

    it('maps USER_INACTIVE to assignments placement', () => {
      const error: NormalizedApiError = {
        kind: 'VALIDATION_ERROR',
        backendCode: 'USER_INACTIVE',
        status: 400,
        message: 'User inactive',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Người dùng được chọn hiện không ở trạng thái hoạt động');
      expect(result.placement).toBe('assignments');
    });

    it('maps SERVICE_REQUEST_NOT_FOUND to repair placement with isNotFound=true', () => {
      const error: NormalizedApiError = {
        kind: 'NOT_FOUND',
        backendCode: 'SERVICE_REQUEST_NOT_FOUND',
        status: 404,
        message: 'Service request not found',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Không tìm thấy yêu cầu dịch vụ liên kết');
      expect(result.placement).toBe('repair');
      expect(result.isNotFound).toBe(true);
    });
  });

  describe('Normalized Fallback Categories', () => {
    it('handles VALIDATION_ERROR with fieldErrors', () => {
      const error: NormalizedApiError = {
        kind: 'VALIDATION_ERROR',
        status: 400,
        message: 'Validation failed',
        fieldErrors: {
          assetCode: 'Mã tài sản không được để trống',
          assetName: 'Tên tài sản không được để trống',
        },
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Validation failed');
      expect(result.placement).toBe('form');
      expect(result.fieldErrors).toEqual({
        assetCode: 'Mã tài sản không được để trống',
        assetName: 'Tên tài sản không được để trống',
      });
    });

    it('handles UNAUTHORIZED category', () => {
      const error: NormalizedApiError = {
        kind: 'UNAUTHORIZED',
        status: 401,
        message: 'Unauthorized',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      expect(result.placement).toBe('dialog');
      expect(result.retryable).toBe(false);
    });

    it('handles FORBIDDEN category', () => {
      const error: NormalizedApiError = {
        kind: 'FORBIDDEN',
        status: 403,
        message: 'Forbidden',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Bạn không có quyền thực hiện thao tác này trên tài sản.');
      expect(result.placement).toBe('dialog');
      expect(result.isForbidden).toBe(true);
    });

    it('handles NOT_FOUND category fallback', () => {
      const error: NormalizedApiError = {
        kind: 'NOT_FOUND',
        status: 404,
        message: 'Not found',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Tài nguyên tài sản không tồn tại hoặc đã bị xóa.');
      expect(result.placement).toBe('dialog');
      expect(result.isNotFound).toBe(true);
    });

    it('handles CONFLICT category fallback', () => {
      const error: NormalizedApiError = {
        kind: 'CONFLICT',
        status: 409,
        message: 'Conflict',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Dữ liệu đã bị thay đổi bởi giao dịch khác. Vui lòng tải lại trang.');
      expect(result.placement).toBe('dialog');
      expect(result.isConflict).toBe(true);
    });

    it('handles NETWORK_ERROR category', () => {
      const error: NormalizedApiError = {
        kind: 'NETWORK_ERROR',
        status: 0,
        message: 'Network offline',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
      expect(result.placement).toBe('banner');
      expect(result.retryable).toBe(true);
    });

    it('handles TIMEOUT category', () => {
      const error: NormalizedApiError = {
        kind: 'TIMEOUT',
        status: 0,
        message: 'Timeout',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
      expect(result.placement).toBe('banner');
      expect(result.retryable).toBe(true);
    });

    it('handles SERVER_ERROR category', () => {
      const error: NormalizedApiError = {
        kind: 'SERVER_ERROR',
        status: 500,
        message: 'Server error',
        traceId: 'trace-12345',
      };

      const result = mapAssetError(error);

      expect(result.message).toBe('Hệ thống đang gặp sự cố khi xử lý dữ liệu tài sản. Vui lòng thử lại sau.');
      expect(result.placement).toBe('dialog');
      expect(result.retryable).toBe(true);
      expect(result.traceId).toBe('trace-12345');
    });

    it('handles unexpected raw error object', () => {
      const raw = new Error('Unexpected crash');
      const result = mapAssetError(raw);

      expect(result.placement).toBe('general');
      expect(result.retryable).toBe(false);
    });
  });
});
