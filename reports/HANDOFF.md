# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- Current Task: PHASE 14E - PROJECT MANAGEMENT ACTIONS
- Status: Phase 14E BLOCKED by reference-data gaps (PROJECT_MEMBER_SELECTION_API_GAP, PROJECT_CREATE_REFERENCE_DATA_GAP). Source left clean and uncorrupted; no free-text UUID entry exposed. Baseline metrics preserved: 50 test suites, 437 tests PASS.
- Baseline Checkpoint: `f0eca143763e80a43d8230bcf9f28eea778428e1`
- Phase 14E Report: `reports/PHASE_14E_PROJECT_MANAGEMENT_REPORT.md`
- Next Action: `BACKEND_REFERENCE_DATA_API_PROVISION` or `ARCHITECTURE_GOVERNANCE_REVIEW` for unprivileged user search endpoint.
- Scope Boundary:
  - Subphase 14E BLOCKED (`PHASE_14E_REFERENCE_DATA_BLOCKED`).
  - Audited Reference Data Status:
    1. `departmentId` available via `GET /api/v1/departments`.
    2. `initialMemberIds` (`SCR-PRJ-03`) missing unprivileged user lookup source (`PROJECT_CREATE_REFERENCE_DATA_GAP`).
    3. `userId` for `SCR-PRJ-07 Add Member` missing unprivileged user lookup source (`PROJECT_MEMBER_SELECTION_API_GAP`). Only `GET /api/v1/admin/users` exists, requiring `USER_READ` (Admin only). Non-admin Project Managers cannot query candidate users, and free-text UUID controls are strictly forbidden by UX and security standards.
  - Phase 14E Implementation Deferred until reference data API is provisioned.
  - NO Create Project form (`CreateProjectScreen.tsx` deferred to 14E).
  - NO Edit Project form (`EditProjectScreen.tsx` deferred to 14E).
  - NO Change Status modal (`ChangeStatusModal.tsx` deferred to 14E).
  - NO Member Management screen (`ProjectMembersScreen.tsx` deferred to 14E).
  - NO Milestone Management full screen (`ProjectMilestonesScreen.tsx` deferred to 14E).
  - NO backend or Flyway migration edits.
  - NO third-party packages installed (zero new dependencies).
- Phase 13 Final Scope & Delivered Invariants:
  - Mobile Auth state machine, in-memory access token, hardware Keychain refresh token.
  - All screens implemented: `Login` (`SCR-AUTH-02`), `ForgotPassword` (`SCR-AUTH-03`), `ResetPassword` (`SCR-AUTH-04`), `Profile` (`SCR-ACC-01`), `EditProfile`, `ChangePassword` (`SCR-ACC-02`), `Settings` (`SCR-ACC-03`), `Logout Confirmation` (`SCR-ACC-04`).
  - Single-flight token refresh, serialized FIFO credential coordinator, network error recoverable bootstrap, deduplicated terminal cleanup.
  - Quality Metrics: 38/38 test suites, 325/325 tests PASS. Clean Android Gradle build success. Android emulator smoke verified on `emulator-5554`.
  - Zero console.log, zero token/password leaks.
  - Dedicated Audit Report: `reports/PHASE_13_FINAL_AUDIT.md`.

## Phase 11 Notification and Personal Dashboard Module: COMPLETED, AUDITED & HARDENED

- **V017 Migration**:
  - `V017__add_notification_idempotency_and_query_indexes.sql`: Controlled deterministic data backfill (`LEGACY_MIGRATION:{notificationId}`).
  - Thêm cột `event_key VARCHAR(255) NOT NULL`.
  - Unique constraint idempotency: `CREATE UNIQUE INDEX uk_notifications_recipient_event ON notifications(recipient_id, event_key)`.
  - Composite query index: `CREATE INDEX idx_notifications_recipient_created_at ON notifications(recipient_id, created_at DESC)`.
  - 3 index hiện hữu được giữ nguyên: `idx_notifications_recipient_id`, `idx_notifications_recipient_read`, `idx_notifications_created_at`.
  - Không có dòng notification nào bị xóa; toàn bộ các cột nghiệp vụ (title, message, reference fields, isRead, readAt, createdAt) được bảo toàn 100%.
  - Ngữ nghĩa transactional DDL/DML rollback của PostgreSQL được chứng minh bằng test độc lập; lỗi di trú phục hồi schema và data về trạng thái pre-V017.
- **Notification Domain & Delivery Model**:
  - Thực thể `Notification` và `NotificationPreference`.
  - 8 loại notification canonical: `PROJECT_MEMBER_ADDED`, `TASK_ASSIGNED`, `TASK_STATUS_CHANGED`, `TASK_DUE_SOON`, `TASK_OVERDUE`, `SERVICE_REQUEST_ASSIGNED`, `SERVICE_REQUEST_UPDATED`, `COMMENT_ADDED`.
  - Mô hình phân phối: DATABASE IN-APP NOTIFICATION CENTER ONLY.
  - Không có Push (FCM/APNs), Email delivery, WebSocket/SSE, Kafka/RabbitMQ hay Redis.
  - Tùy chọn `inAppEnabled` được thực thi nghiêm ngặt; `pushEnabled`/`emailEnabled` chỉ lưu cấu hình; tắt in-app bỏ qua chèn notification an toàn, không tạo pending event, không backfill.
  - Owner-scoped query: người dùng chỉ xem thông báo của chính mình; truy cập thông báo của người khác trả về HTTP 404 `NOTIFICATION_NOT_FOUND`; ADMIN không bypass quyền sở hữu cá nhân. Không có endpoint xóa, lưu trữ (archive), hay detail riêng lẻ.
  - Đánh dấu đã đọc lũy đẳng (`PUT /api/v1/notifications/{id}/read`), đánh dấu tất cả đã đọc, đếm số lượng chưa đọc.
  - Preference API: `GET` / `PUT /api/v1/notification-preferences` với giá trị mặc định cho 8 loại; validate trùng lặp type và type không hợp lệ.
- **Idempotency & An Toàn Giao Dịch**:
  - Native insert: `ON CONFLICT (recipient_id, event_key) DO NOTHING`.
  - Trùng lặp (`affectedRows = 0`) là thành công lũy đẳng; không ném lỗi; không đánh dấu giao dịch nguồn rollback-only; giao dịch nguồn commit thành công.
  - Lỗi CSDL thực sự khác vẫn rollback giao dịch nguồn.
  - Cùng eventKey có thể gửi cho nhiều recipient khác nhau; các eventKey khác nhau cho cùng một recipient.
- **Event Integrations & Stable Keys**:
  - Project Member Added: `PROJECT_MEMBER_ADDED:{projectId}:{membershipId}`.
  - Task Assigned: `TASK_ASSIGNED:{taskId}:{assignmentId}`.
  - Task Status Changed: `TASK_STATUS_CHANGED:{taskId}:{statusHistoryId}` (sử dụng immutable history ID).
  - Task Public Comment: `COMMENT_ADDED:TASK:{commentId}`.
  - Service Request Assigned: `SERVICE_REQUEST_UPDATED:{requestId}:ASSIGNED:{assignmentId}`.
  - Service Request Status Changed: `SERVICE_REQUEST_UPDATED:{requestId}:{statusHistoryId}` (sử dụng immutable history ID).
  - Service Request Public Comment: `COMMENT_ADDED:SERVICE_REQUEST:{commentId}`.
  - Asset Assigned: `ASSET_ASSIGNED:{assetId}:{assignmentId}`.
  - Task Due Soon: `TASK_DUE_SOON:{taskId}:{dueAtEpochMilli}` (sử dụng epoch millisecond).
  - Task Overdue: `TASK_OVERDUE:{taskId}:{dueAtEpochMilli}` (sử dụng epoch millisecond).
  - Danh sách người nhận deduplicate qua Set<UUID>, loại trừ actor, tôn trọng preference; PM/TL xác định theo active project membership role; Service Request internal notes không thông báo cho requester.
- **Source Transaction Atomicity**:
  - Thay đổi nghiệp vụ + Chèn Notification trong cùng một database transaction.
  - Kiểm thử failure injection trên Task status change và Asset assignment: giao dịch rollback toàn bộ (status, version, history count, notification count không đổi); response HTTP 500 `INTERNAL_ERROR` an toàn, không rò rỉ SQL/trigger/stack trace/PSQLException.
- **TaskDeadlineScanner**:
  - Cấu hình: delay `PT15M`, batch size `100`, enabled mặc định.
  - Điều phối đa instance: PostgreSQL transaction advisory lock `(1101, 1)`; bỏ qua an toàn khi lock bận.
  - Toàn bộ chu kỳ (lock, tất cả keyset pages, inserts, commit) nằm trong một `@Transactional` duy nhất.
  - Keyset pagination `(lastDueDate, lastTaskId)` sắp xếp `dueDate ASC, id ASC`; xử lý tuần tự toàn bộ task vượt quá batch size; triệt tiêu nguy cơ starvation.
  - Ranh giới thời gian nghiêm ngặt: `now <= dueDate < now + 72 hours` với `dueDate.isBefore(threshold)` cho `TASK_DUE_SOON` và `dueDate < now` cho `TASK_OVERDUE`. Loại trừ task đã hoàn thành hoặc bị xóa.
  - Kiểm thử starvation 25 task với batch size 10 duyệt qua 3 trang; kiểm thử preseed 10 task không chặn 15 task sau; kiểm thử tranh chấp advisory lock trên 2 session độc lập.
- **Personal Dashboard API**:
  - Endpoint: `GET /api/v1/dashboard/me` (duy nhất; không có endpoint hay stub cho Project Dashboard).
  - Áp dụng phạm vi cá nhân cho mọi vai trò, kể cả ADMIN.
  - Thống kê Task theo active assignment (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `overdue`, `dueSoon`).
  - Thống kê Service Request theo requester HOẶC active assignee với `COUNT(DISTINCT sr.id)` (`OPEN`, `IN_PROGRESS`, `WAITING_FOR_USER`, `RESOLVED`).
  - Thống kê Project theo active membership (`ACTIVE`, `ON_HOLD`).
  - Top 5 Upcoming Tasks (`dueSoon`, sắp xếp `dueDate ASC, id ASC`).
  - Top 5 Recent Notifications (sắp xếp `createdAt DESC, id DESC`).
  - Mẫu mốc thời gian `Clock.instant()` đồng nhất một lần duy nhất trong toàn request.
- **Hạ Tầng Kiểm Thử**:
  - `NotificationTestCleanupListener`: Kiểm tra sự tồn tại của bảng trước khi xóa (`to_regclass` trên PostgreSQL, JDBC metadata trên non-Postgres); chỉ xóa `notifications` và `notification_preferences`; không xóa bảng nghiệp vụ/user/role; không nuốt lỗi SQLException.
  - `V016MigrationTest`: target `016`, độc lập hoàn toàn với V017, bảo toàn toàn bộ assertions trước đó.

## Phase 10 Asset Management Module: COMPLETED & HARDENED

- **Asset Category**:
  - Authenticated active categories list (`GET /api/v1/asset-categories` - requires authentication, returns 401 if unauthorized; strictly not public), admin pagination (`GET /api/v1/admin/asset-categories`).
  - Code normalization: client-input, trim, uppercase, regex `^[A-Z0-9_]{2,50}$`, immutable after creation, permanent global uniqueness.
  - In-use protection: cannot deactivate category if active AVAILABLE or RETIRED assets are linked (`ASSET_CATEGORY_IN_USE`, HTTP 400).
  - Optimistic locking (`@Version`) verified (`OPTIMISTIC_LOCK_CONFLICT`, HTTP 409).
- **Asset Core**:
  - Asset lifecycle: initial status strictly `AVAILABLE`, code regex `^[A-Z0-9][A-Z0-9_-]{1,49}$`, immutable after creation.
  - Validated transitions: `AVAILABLE -> ASSIGNED`, `ASSIGNED -> AVAILABLE/MAINTENANCE/BROKEN/RETIRED`, `MAINTENANCE -> AVAILABLE/BROKEN/RETIRED`, `BROKEN -> AVAILABLE/MAINTENANCE/RETIRED`, terminal `RETIRED`.
  - Duplicate asset code mapped to HTTP 409 `ASSET_CODE_ALREADY_EXISTS`.
  - Duplicate serial number mapped to HTTP 409 `ASSET_SERIAL_ALREADY_EXISTS`.
  - Soft-delete filtering (`is_deleted = false`), optimistic locking (`@Version`), audit principal and Clock.
- **Assignment & Concurrency**:
  - Single active assignment invariant guarded by pessimistic write lock + V016 partial unique index `uk_asset_assignments_one_active`.
  - Reassignment directly is forbidden; asset must be returned before new assignment.
  - Concurrency validated: 5 rounds x 2 concurrent workers on PostgreSQL Testcontainers; exactly 1 winner (201 Created), loser strictly canonical 400 (`ASSET_NOT_AVAILABLE` / `ASSET_ALREADY_ASSIGNED`) or 409 (`ASSET_ASSIGNMENT_CONFLICT`), zero 500s.
  - Driver-level constraint extraction: PSQLException server error message constraint extracted via reflection for `uk_asset_assignments_one_active`, `uk_assets_asset_code`, and `uk_assets_serial_number`.
- **Return & Transaction Rollback**:
  - `PUT /api/v1/assets/{assetId}/assignments/{assignmentId}/return` requires `resultingAssetStatus` (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`).
  - Resulting status `ASSIGNED` rejected (HTTP 400).
  - Transaction atomicity & rollback verified on PostgreSQL via BEFORE UPDATE trigger failure injection on target asset row; asset remains ASSIGNED, assignment remains ACTIVE, versions unchanged, returnedAt remains null. Response on error is verified safe (no leak of SQL, trigger, or stack trace).
- **Read Scoping & Security**:
  - System Admin has global asset visibility.
  - Non-admin (EMPLOYEE, TEAM_LEADER, PROJECT_MANAGER) restricted to actively assigned assets (`assigned_to = principal.userId` and assignment `status = 'ACTIVE'`).
  - `/api/v1/assets/my-assets` strictly locked to caller principal; unauthorized detail access returns `ASSET_ACCESS_DENIED` (HTTP 403).
- **Related Service Requests Projection**:
  - Detail response includes non-deleted related Service Requests matching Phase 9 authorization: caller sees request if caller is Admin, or requester, or has active `ServiceAssignment` (`is_active = true`). Soft-deleted requests excluded. Exact IDs and request numbers asserted.
- **Repair History**:
  - Immutable historical audit log (POST and GET only; PUT and DELETE return 405 Method Not Allowed).
  - Optional `cost`: `cost` can be null or $\ge 0$ (`NUMERIC(18,2) NULL`).
  - Optional `serviceRequestId` reference-only linkage; rejected if deleted or points to another asset.
  - Independent lifecycle: adding repair history does not automatically change Asset status or Service Request status.
- **V016 Migration & Invariants**:
  - 8 migration tests in `V016MigrationTest`: clean migration V001-V016, active assignment uniqueness constraint, category code normalization, asset code normalization, index verifications (`idx_asset_assignments_assigned_to`, `idx_asset_assignments_asset_id`, `uk_asset_assignments_one_active`, `uk_asset_categories_code`), and preflight duplicate rejection with rollback preserving data integrity.

## Deferred Items & Known Gaps

- `RESET_PASSWORD_DEEP_LINK_DEFERRED`: Deep link routing cho token reset mật khẩu hoãn lại; token truyền qua typed route param hoặc nhập thủ công.
- `SETTINGS_POLICY_URL_DEFERRED`: URL chính sách công khai hoãn đến khi có tài liệu web hosting; hiển thị thông tin nội bộ.
- `MOBILE_APP_VERSION_NATIVE_WIRING_DEFERRED`: Native runtime bridge cho app version hoãn để tránh phụ thuộc native bên thứ ba; dùng metadata từ package.json.
- `APP_VERSION_SOURCE_DRIFT_RECONCILED_AS_DEFERRED`: Reconciled divergence between package.json (0.0.1), Android build.gradle (1.0), and iOS MARKETING_VERSION; unified native versioning deferred to CI/CD release phase.
- `IOS_BUILD_ON_MACOS_DEFERRED`: Biên dịch native iOS hoãn đến khi có môi trường macOS.
- `ANDROID_NATIVE_CI_BUILD_DEFERRED`: Biên dịch Android native trên GitHub Actions runner hoãn lại.
- `AUTH_E2E_CREDENTIALS_NOT_AVAILABLE_SAFE_SKIP`: Kiểm thử E2E live device tự động bỏ qua an toàn khi không có biến môi trường credentials.
- `AUTH_REFRESH_ROTATION_E2E_DEFERRED`: Kiểm thử live token rotation trên thiết bị thật hoãn đến môi trường E2E có tài khoản hoạt động.
- `CHANGE_PASSWORD_REAL_E2E_DEFERRED`: Kiểm thử đổi mật khẩu trên thiết bị thật hoãn đến môi trường E2E có tài khoản hoạt động.
- `OFFLINE_BOOTSTRAP_E2E_DEFERRED`: Kiểm thử bật tắt airplane mode thủ công trên thiết bị hoãn; kiểm thử đơn vị tự động đã bao phủ đầy đủ.
- `AXIOS_MULTIPART_CONTENT_TYPE_OVERRIDE_REQUIRED`: Ghi đè thủ công header Content-Type khi upload tệp nhị phân hoãn đến Phase 15+.
- `FONT_INTER_ASSET_BUNDLING_DEFERRED`: Phông chữ Inter asset chưa bundle; mobile sử dụng system font mặc định.
- `MOBILE_ICON_PACKAGE_DEFERRED`: Thư viện vector icon bên thứ ba hoãn đến Phase 14+ UI refinement.
- `NOTIFICATION_RETENTION_CLEANUP_DEFERRED`: Dọn dẹp thông báo cũ theo thời gian hoãn đến vận hành production.
- `PROJECT_DASHBOARD_PROJECTION_DEFERRED`: Endpoint GET /projects/{projectId}/dashboard hoãn lại.
- `SERVICE_REQUEST_INTERNAL_NOTE_NOTIFICATION_DEFERRED`: Thông báo nội bộ cho Service Request hoãn lại.
- `PUSH_NOTIFICATION_DELIVERY_DEFERRED`: Phân phối Push notification (FCM/APNs) hoãn lại ngoài phạm vi Phase 11.
- `EMAIL_NOTIFICATION_DELIVERY_DEFERRED`: Phân phối Email delivery hoãn lại ngoài phạm vi Phase 11.
- `REALTIME_NOTIFICATION_DELIVERY_DEFERRED`: Phân phối WebSocket/SSE realtime hoãn lại ngoài phạm vi Phase 11.
- `ASSET_ASSIGNMENT_LOST_DAMAGED_WORKFLOW_DEFERRED`: Schema enum `AssetAssignmentStatus` contains `ACTIVE`, `RETURNED`, `LOST`, `DAMAGED`. Canonical contract `docs/06_API_CONTRACT.md` mục 14.7 đã chuẩn hóa: vòng đời Phase 10 hỗ trợ là `ACTIVE -> RETURNED`; `LOST` và `DAMAGED` là schema-reserved values không mở qua API Phase 10. Quy trình xử lý phân công thất thoát/hư hỏng hoãn lại rõ ràng, không còn unresolved contract gap.
- `ASSET_ATTACHMENT_DEFERRED`: Chưa có liên kết tài liệu/hình ảnh đính kèm cho tài sản; chưa có `ASSET_ATTACHMENT` trong `FilePurpose`.
- `ASSET_BARCODE_QR_DEFERRED`: Chưa triển khai sinh Barcode hoặc mã QR cho tài sản ở backend.
- `ASSET_DEPRECIATION_DEFERRED`: Chưa triển khai công cụ khấu hao hoặc kế toán tài sản.
- `POSTGRES_CONSTRAINT_METADATA_REFLECTION_LOW`: Trích xuất tên ràng buộc CSDL qua reflection do dependency driver PostgreSQL nằm ở scope runtime; fallback qua chuỗi message an toàn, không phải blocker.
- `SERVICE_REQUEST_SLA_DEFERRED`: Không có SLA engine, không tính business hours, không escalation, không pause/resume SLA.
- `SERVICE_ATTACHMENT_COMMENT_LINK_GAP`: Bảng `service_attachments` chỉ liên kết với `request_id`.
- `FILE_ORPHAN_RECONCILIATION_GAP`: Cần worker hoặc operational process reconciliation định kỳ.
- `FILE_STORAGE_TOCTOU_LOW`: Existing symlink escape đã được chặn và kiểm thử thành công trên Linux container. Môi trường production phải bảo vệ storage root bằng phân quyền hệ điều hành phù hợp.
- `FILE_VIRUS_SCANNING_DEFERRED`: ClamAV daemon hoãn đến môi trường production; kiểm tra in-flight qua magic bytes và ZIP entry inspection.
- `CLOUD_STORAGE_PROVIDER_DEFERRED`: Production provider chưa được chọn. Local filesystem là provider Development/Test.
- `TASK_DETAIL_ATTACHMENT_ITEMS_API_GAP`: Canonical API định nghĩa `attachmentCount`; schema chi tiết cho danh sách attachment items trong Task Detail chưa được định nghĩa.
- `TASK_DELETE_RULE_AMBIGUITY_DEFERRED`: Định nghĩa “Business history quan trọng” chưa đầy đủ trong canonical docs; giữ logic xét status history.
- `TASK_FLYWAY_CONFIGURATION_MODULE_LOCATION_LOW`: TaskFlywayConfiguration hiện ở task.infrastructure. Có thể chuyển sang shared.infrastructure trong đợt refactor riêng.
- `DATA_INTEGRITY_ERROR_MAPPING_FALLBACK_LOW`: Exception mapping cho task_assignments có thể nâng cấp sang trích xuất constraint PostgreSQL driver tương tự Asset module.
- `AUTH_TEST_ACCOUNT_PROVISIONING_RESOLVED`: Khắc phục triệt để qua E2eUserProvisioner (D-056). Mặc định disabled, chỉ chạy trên profile dev khi có cờ tường minh và nạp biến môi trường ngoài Git.
- `TEMPORARY_PASSWORD_FLOW_GAP`: Luồng kích hoạt và endpoint thiết lập mật khẩu lần đầu tiếp tục hoãn; mobile mapping ACCOUNT_PENDING sang thông báo liên hệ admin.
- `TEAM_API_CONTRACT_GAP`: Team REST controllers hoãn vì `06_API_CONTRACT.md` chưa định nghĩa endpoints.
- `PUT_ME_PASSWORD_TEST_GAP`: Test coverage cho luồng đổi mật khẩu người dùng hiện tại tiếp tục hoãn.

## Next Permitted Phase

- **Giai đoạn 14: Mobile Dashboard và Projects** (theo đúng `docs/08_DEVELOPMENT_ROADMAP.md` Mục 18, P0).
  - Scope: Dashboard cá nhân (tích hợp `GET /api/v1/dashboard/me`), Danh sách dự án, Chi tiết dự án, Thành viên dự án.
  - Phụ thuộc: Phase 13 Mobile Authentication đã hoàn tất và kiểm toán độc lập PASS (`PHASE_13_FINAL_AUDIT_PASS_WITH_E2E_DEFERRALS`).
  - Pre-audit Report: `reports/PRE_PHASE_14_DASHBOARD_PROJECTS_AUDIT.md`.
  - Contract Reconciliation Report: `reports/PHASE_14_CONTRACT_RECONCILIATION.md`.
  - Architectural Decision: `D-061` in `reports/DECISIONS.md`.
  - Phase 14 Status: `AUDITED, CONTRACT_RECONCILED, DECISION_FROZEN, IMPLEMENTATION_NOT_STARTED`.
  - Next Action: `PHASE 14A IMPLEMENTATION`.

## New Session Procedure

1. Read AGENTS.md.
2. Read reports/PROJECT_STATE.md.
3. Read reports/DECISIONS.md.
4. Read reports/HANDOFF.md.
5. Read reports/ENVIRONMENT_TOOL_REGISTRY.md.
6. Run git status --short.
7. Run git log --oneline --decorate -5.
8. Compare HEAD with origin/main.
9. Read the relevant canonical document sections for Phase 13 when scoped.
10. Do not start another roadmap phase without explicit scope.

## Model Switch Procedure

When FCM switches model:

- Continue within the same OpenCode session where possible.
- Recheck current tool output.
- Recheck git status before writing.
- Do not repeat completed commands unnecessarily.
- If state is unclear, stop writing and produce a checkpoint report.
