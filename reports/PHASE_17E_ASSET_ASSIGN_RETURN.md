# Phase 17E — Asset Assignment & Return Workflows Report

## 1. Executive Summary
- **Subphase**: Phase 17E — Asset Assignment & Return Workflows (SCR-AST-05 & SCR-AST-06)
- **Baseline Commit**: `92793890ee04b76291f2ca979c0b26b96e595f07`
- **Result**: PASS (0 TypeScript errors, 0 ESLint errors, 48 historical warnings, 113/113 Jest test suites passed, 1035/1035 tests passed)

---

## 2. Implemented Features & Screens

### 2.1 SCR-AST-05: Modal Cấp phát tài sản (`AssignAssetModal`)
- Modal cấp phát tài sản cho nhân viên khi tài sản ở trạng thái `AVAILABLE`.
- Chọn người dùng đích trực tiếp thông qua `UserPickerModal` tái sử dụng từ directory module.
- Tích hợp trường ngày thu hồi dự kiến (`expectedReturnAt`) và ghi chú (`notes`).
- Payload gửi backend: `{ assignedTo: UUID, expectedReturnAt?: ISO-UTC-string, notes?: string }`.
- **Invariants**: Tuyệt đối không gửi `version` trong request cấp phát theo đúng contract backend.
- **Concurrency**: Trang bị `submittingRef` synchronous lock ngăn duplicate submission cùng tick.
- **Authorization**: Gated chặt chẽ bởi quyền `ASSET_MANAGE` hoặc role `ADMIN`.

### 2.2 SCR-AST-06: Modal Thu hồi tài sản (`ReturnAssetModal`)
- Modal thu hồi tài sản về kho khi tài sản đang ở trạng thái `ASSIGNED` và có `currentAssignment`.
- Cho phép người quản trị chọn trạng thái đích sau khi thu hồi (`resultingAssetStatus`): `AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`.
- **Invariants**: Cấm tuyệt đối gửi `resultingAssetStatus: 'ASSIGNED'` (fail-safe typing và validation).
- **Optimistic Locking**: Gửi chính xác `AssetAssignment.version` (`assignment.version`) cho backend optimistic lock, tuyệt đối không gửi `Asset.version`.
- **Concurrency & Retry**: Trang bị `submittingRef` synchronous lock. Không tự động retry stale mutation khi gặp lỗi 409 Conflict.
- **Authorization**: Gated chặt chẽ bởi quyền `ASSET_MANAGE` hoặc role `ADMIN`.

### 2.3 AssetDetailScreen Enhancement
- Hiển thị nút hành động "Cấp phát tài sản" (`btn-asset-action-assign`) khi `canAssign` (`hasAssetManage && asset.status === 'AVAILABLE'`).
- Hiển thị nút hành động "Thu hồi tài sản" (`btn-asset-action-return`) khi `canReturn` (`hasAssetManage && asset.status === 'ASSIGNED' && Boolean(asset.currentAssignment.id)`).
- Tích hợp `ConfirmationDialog` thông báo conflict 409 với CTA "Tải lại dữ liệu" để refresh dữ liệu mới nhất từ máy chủ.

### 2.4 Error Mapping Foundation
- Cập nhật `assetErrorMapper.ts` xử lý toàn diện các mã lỗi nghiệp vụ của assignment:
  - `ASSET_ASSIGNMENT_ALREADY_INACTIVE`: dialog placement, `isConflict = true`.
  - `ASSET_ASSIGNMENT_NOT_ACTIVE`: dialog placement, `isConflict = true`.
  - `ASSET_NOT_AVAILABLE`, `ASSET_ALREADY_ASSIGNED`, `ASSET_STATUS_TRANSITION_INVALID`.

---

## 3. Verification & Quality Gates

### 3.1 Navigator Runtime Verification
- Integration test suite: `mobile/__tests__/assets/AssetNavigationIntegration.test.tsx`
- Xác minh runtime navigation luồng: `MoreScreen` -> `AssetListScreen` -> `AssetDetailScreen` -> dispatch `CreateServiceRequest` với params `{ assetId }`.
- Xác nhận target screen (`screen-create-service-request`) render thành công cùng component hiển thị thông tin tài sản liên kết (`create-service-request-asset-info`).

### 3.2 Jest Open-Handle & Full Test Suite Audit
- Lệnh chạy: `npm --prefix mobile test -- --runInBand` (không sử dụng `--forceExit`).
- Kết quả:
  - **Test Suites**: 113 passed, 113 total
  - **Tests**: 1035 passed, 1035 total
  - **Snapshots**: 0
  - **Thoát sạch**: Quá trình kiểm thử tự thoát bình thường với exit code 0.

### 3.3 TypeScript & Lint Verification
- `npm --prefix mobile run typecheck`: 0 errors.
- `npm --prefix mobile run lint`: 0 errors, 48 historical warnings (0 warning trong `src/features/assets/`).

---

## 4. Subphase Completion
Phase 17E hoàn tất toàn bộ yêu cầu kỹ thuật và nghiệp vụ, sẵn sàng chuyển tiếp sang Phase 17F (Asset Status Transition & Maintenance Integration).
