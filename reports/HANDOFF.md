# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- Current Task: KHẮC PHỤC ROLE-PERMISSION NỀN TẢNG VÀ CANONICAL BLOCKERS TRƯỚC PHASE 9
- Latest Validated Checkpoint: Prior `b9bc66e6f593fe1d09d1bbc48855a5f7be6bd09b`, updated in this remediation.
- Operational Documentation Checkpoint: reports/ROLE_PERMISSION_AUDIT.md
- Working tree: clean
- Build status: BUILD SUCCESS (Maven 3.9.16, Java target 21, Checkstyle 0 violations)
- Test status:
  - Host Suite (Oracle JDK 27, Testcontainers PostgreSQL): 177/177 PASS (0 failures, 0 errors, 0 skipped)
  - V013 Partial Unique Index `uk_service_assignments_one_active` Verified: PASS
  - V014 Canonical Role-Permission Seed Verified: PASS (74 mappings: ADMIN=29, PM=19, LEADER=14, EMP=12)
  - Clean Authentication & PreAuthorize Flow Verified: `RolePermissionSeedIntegrationTest` (7/7 PASS without any fixture injections)

## Foundation Authorization Remediation & Canonical Blockers: RESOLVED

Nhiệm vụ khắc phục nền tảng phân quyền và chốt canonical blockers trước Phase 9 đã hoàn thành:

- **Canonical Role-Permission Matrix**: Đã ban hành chính thức Section 2.6 trong [02_USER_ROLES_AND_WORKFLOWS.md](file:///D:/WorkSphere/docs/02_USER_ROLES_AND_WORKFLOWS.md) định nghĩa toàn bộ 29 permissions cho 4 System Roles. Thẩm quyền `SERVICE_REQUEST_ASSIGN` được cấp cho `ADMIN` trong MVP.
- **Canonical Error Code Patch**: Đã cập nhật chính thức mã lỗi `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409 Conflict) vào [06_API_CONTRACT.md](file:///D:/WorkSphere/docs/06_API_CONTRACT.md) Section 13.6 và 20.6.
- **Flyway Migrations**:
  - `V013__add_service_request_assignment_invariants.sql`: Tạo partial unique index `uk_service_assignments_one_active` trên `service_assignments(request_id) WHERE is_active = TRUE`.
  - `V014__seed_role_permissions.sql`: Seed 74 bản ghi liên kết quyền hạn với `ON CONFLICT (role_id, permission_id) DO NOTHING`.
- **Clean Authentication Integration Test**:
  - `RolePermissionSeedIntegrationTest.java`: 7 bài test chạy trên clean PostgreSQL Testcontainers, login thật qua `/api/v1/auth/login`, nhận JWT thật và gọi các endpoint `@PreAuthorize`, xác minh phân quyền nạp 100% từ migration V014 mà không có bất kỳ câu lệnh fixture nào.
  - Toàn bộ 177/177 tests của repository và Checkstyle 0 lỗi đều PASS.

## Deferred / Known Gaps

- [RESOLVED] `ROLE_PERMISSION_SEED_GAP_CONFIRMED`: Đã khắc phục bằng bản di trú `V014__seed_role_permissions.sql` nạp 74 bản ghi liên kết chính thức cho 4 System Roles.
- [RESOLVED] `TEST_AUTHORITY_FIXTURE_MASKS_SEED_GAP`: Đã bổ sung `RolePermissionSeedIntegrationTest.java` kiểm chứng luồng phân quyền sạch từ CSDL seed thật.
- [RESOLVED] `ROLE_PERMISSION_CANONICAL_MATRIX_GAP`: Đã giải quyết bằng Section 2.6 trong `02_USER_ROLES_AND_WORKFLOWS.md`.
- [RESOLVED] `SERVICE_AUTHORIZATION_MAPPING_GAP`: Đã giải quyết bằng việc cấp quyền `SERVICE_REQUEST_ASSIGN` cho `ADMIN` trong MVP.
- [RESOLVED] `SERVICE_ASSIGNMENT_ERROR_CODE_GAP`: Đã cập nhật mã lỗi `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409 Conflict) vào `06_API_CONTRACT.md`.
- [RESOLVED] `SERVICE_ASSIGNMENT_CONCURRENCY_SCHEMA_GAP`: Đã giải quyết bằng partial unique index `uk_service_assignments_one_active` trong `V013`.
- `SERVICE_CATEGORY_ERROR_CODES`: Đã đối chiếu toàn diện với Section 20.6. Tất cả các mã lỗi danh mục đều có sẵn trong canonical contract (`SERVICE_CATEGORY_*`), không có gap mã lỗi category.
- `FILE_ORPHAN_RECONCILIATION_GAP`: Nếu metadata persistence và compensating physical cleanup cùng thất bại, physical file có thể trở thành orphan. Exception gốc được giữ nguyên, failure được log an toàn bằng fileId mà không lộ physical path. Cần reconciliation worker hoặc operational process trước khi đưa vào production.
- `FILE_STORAGE_TOCTOU_LOW`: Existing symlink escape đã được chặn và kiểm thử thành công trên Linux container. Java NIO portable API không loại bỏ tuyệt đối TOCTOU trước actor đã có quyền can thiệp trực tiếp filesystem lưu trữ. Môi trường production phải bảo vệ storage root bằng phân quyền hệ điều hành phù hợp.
- `FILE_VIRUS_SCANNING_DEFERRED`: ClamAV daemon hoãn đến môi trường production; kiểm tra in-flight qua magic bytes và ZIP entry inspection.
- `CLOUD_STORAGE_PROVIDER_DEFERRED`: Production provider chưa được chọn. Local filesystem là provider Development/Test. FileStorageService abstraction cho phép bổ sung provider sau mà không ảnh hưởng controller/domain. Không mặc định chọn S3, MinIO hoặc Azure Blob.
- `TASK_DETAIL_ATTACHMENT_ITEMS_API_GAP`: Canonical API trong docs/06_API_CONTRACT.md định nghĩa `attachmentCount`; schema chi tiết cho danh sách attachment items trong Task Detail chưa được định nghĩa. Hệ thống không tự ý phát minh response payload.
- `TASK_DELETE_RULE_AMBIGUITY_DEFERRED`: Định nghĩa “Business history quan trọng” chưa đầy đủ trong canonical docs; giữ logic xét status history.
- `TASK_FLYWAY_CONFIGURATION_MODULE_LOCATION_LOW`: TaskFlywayConfiguration hiện ở `task.infrastructure`.
- `DATA_INTEGRITY_ERROR_MAPPING_FALLBACK_LOW`: Cải tiến kiểm tra mã lỗi `23505` trong refactor sau.
- `TEMPORARY_PASSWORD_FLOW_GAP`: Luồng kích hoạt và endpoint thiết lập mật khẩu lần đầu tiếp tục hoãn.
- `TEAM_API_CONTRACT_GAP`: Team REST controllers hoãn vì `06_API_CONTRACT.md` chưa định nghĩa endpoints.
- `DASHBOARD_AGGREGATED_API_GAP`: API `GET /api/v1/dashboard/me` chưa có backend controller.
- `PUT_ME_PASSWORD_TEST_GAP`: Test coverage cho luồng đổi mật khẩu người dùng hiện tại tiếp tục hoãn.
- `FILE_ORPHAN_RECONCILIATION_GAP`: Nếu metadata persistence và compensating physical cleanup cùng thất bại, physical file có thể trở thành orphan. Exception gốc được giữ nguyên, failure được log an toàn bằng fileId mà không lộ physical path. Cần reconciliation worker hoặc operational process trước khi đưa vào production.
- `FILE_STORAGE_TOCTOU_LOW`: Existing symlink escape đã được chặn và kiểm thử thành công trên Linux container. Java NIO portable API không loại bỏ tuyệt đối TOCTOU trước actor đã có quyền can thiệp trực tiếp filesystem lưu trữ. Môi trường production phải bảo vệ storage root bằng phân quyền hệ điều hành phù hợp.
- `FILE_VIRUS_SCANNING_DEFERRED`: ClamAV daemon hoãn đến môi trường production; kiểm tra in-flight qua magic bytes và ZIP entry inspection.
- `CLOUD_STORAGE_PROVIDER_DEFERRED`: Production provider chưa được chọn. Local filesystem là provider Development/Test. FileStorageService abstraction cho phép bổ sung provider sau mà không ảnh hưởng controller/domain. Không mặc định chọn S3, MinIO hoặc Azure Blob.
- `TASK_DETAIL_ATTACHMENT_ITEMS_API_GAP`: Canonical API trong docs/06_API_CONTRACT.md định nghĩa `attachmentCount`; schema chi tiết cho danh sách attachment items trong Task Detail chưa được định nghĩa. Hệ thống không tự ý phát minh response payload.
- `TASK_DELETE_RULE_AMBIGUITY_DEFERRED`: Định nghĩa “Business history quan trọng” chưa đầy đủ trong canonical docs; giữ logic xét status history.
- `TASK_FLYWAY_CONFIGURATION_MODULE_LOCATION_LOW`: TaskFlywayConfiguration hiện ở `task.infrastructure`.
- `DATA_INTEGRITY_ERROR_MAPPING_FALLBACK_LOW`: Cải tiến kiểm tra mã lỗi `23505` trong refactor sau.
- `TEMPORARY_PASSWORD_FLOW_GAP`: Luồng kích hoạt và endpoint thiết lập mật khẩu lần đầu tiếp tục hoãn.
- `TEAM_API_CONTRACT_GAP`: Team REST controllers hoãn vì `06_API_CONTRACT.md` chưa định nghĩa endpoints.
- `DASHBOARD_AGGREGATED_API_GAP`: API `GET /api/v1/dashboard/me` chưa có backend controller.
- `PUT_ME_PASSWORD_TEST_GAP`: Test coverage cho luồng đổi mật khẩu người dùng hiện tại tiếp tục hoãn.

## Next Permitted Phase

- **Giai đoạn 9: Service Request Module** (theo đúng `docs/08_DEVELOPMENT_ROADMAP.md` Section 13, P0).
- Phải bắt đầu bằng nhiệm vụ khảo sát phạm vi (Audit/Plan) của Giai đoạn 9 trước khi viết mã nguồn.
- Không bắt đầu triển khai React Native / mobile source.

## New Session Procedure

1. Read AGENTS.md.
2. Read reports/PROJECT_STATE.md.
3. Read reports/DECISIONS.md.
4. Read reports/HANDOFF.md.
5. Read reports/ENVIRONMENT_TOOL_REGISTRY.md.
6. Run git status --short.
7. Run git log --oneline --decorate -5.
8. Compare HEAD with origin/main.
9. Read the relevant canonical document sections for Phase 9 (docs/08_DEVELOPMENT_ROADMAP.md Section 13, docs/05_DATABASE_DESIGN.md Section 9, docs/06_API_CONTRACT.md Section 9).
10. Identify the exact scoped task (Khảo sát phạm vi Phase 9: Service Request Module).
11. Do not start another roadmap phase without explicit scope.

## Model Switch Procedure

When FCM switches model:

- Continue within the same OpenCode session where possible.
- Recheck current tool output.
- Recheck git status before writing.
- Do not repeat completed commands unnecessarily.
- If state is unclear, stop writing and produce a checkpoint report.
