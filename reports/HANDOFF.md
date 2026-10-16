# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- Current Task: TRIỂN KHAI PHASE 9 - SERVICE REQUEST MODULE
- Latest Validated Checkpoint: Prior `fb8f41b03b110e069cb2639a39ab6981463c0294`
- Operational Documentation Checkpoint: reports/DECISIONS.md (D-045), reports/PHASE_09_REPORT.md
- Working tree: clean
- Build status: BUILD SUCCESS (Maven 3.9.16, Java target 21, Checkstyle 0 violations)
- Test status:
  - Host Suite (Oracle JDK 27, Testcontainers PostgreSQL): 205/205 PASS (0 failures, 0 errors, 0 skipped)
  - Existing Regression Suite (Phase 0 - Phase 8): 183/183 PASS
  - Phase 9 Service Category Tests (`ServiceCategoryMockMvcTest`): 10/10 PASS
  - Phase 9 Service Request Core / Workflow / Assignment / Attachment / Rating / Scoping Tests (`ServiceRequestMockMvcTest`): 12/12 PASS

## Phase 9 Service Request Module: COMPLETED & VERIFIED

- **Service Category**: Hierarchy, cycle detection with Set<UUID>, normalized code uniqueness, active public list, admin list, activate/deactivate, in-use protection.
- **Request Number**: Sequence format `SR-YYYY-NNNNNN` via PostgreSQL two-key advisory lock `(1301, year)` and year rollover handling.
- **Service Request Core**: Status workflow (7 states, 8 transitions), history audit logging in same transaction, optimistic locking, soft-delete predicate.
- **Service Assignment**: Single active assignee invariant (`0..1`), idempotent assignment, atomic reassignment with `unassigned_at`, partial unique index `uk_service_assignments_one_active` final DB guard with 409 conflict mapping.
- **Reject Resolution**: Dedicated endpoint `POST /service-requests/{requestId}/reject-resolution` restricted to original requester, transitions `RESOLVED -> IN_PROGRESS`, preserves active assignee, logs reason in status history.
- **Comments**: Public and internal notes, query-level visibility scoping.
- **Attachments**: Linkage to `StoredFile` (purpose `SERVICE_ATTACHMENT`, `ACTIVE` status, uploader/Admin check, zero cross-request reuse, download access control, D-035 projection).
- **Rating**: Requester-only, `CLOSED` status only, score 1..5, guarded by `service_ratings.request_id` unique constraint (409 conflict).
- **Query Scoping**: Enforced in PostgreSQL via Spring Data JPA `Specification<ServiceRequest>` for non-admins vs admins.
- **Report**: Comprehensive report written to `reports/PHASE_09_REPORT.md`.

Kiểm toán độc lập phát hiện rò rỉ dữ liệu (data leak) khi các endpoint đọc dự án không kiểm tra quyền thành viên và không phân vùng dữ liệu ở tầng truy vấn:

- **Vá mã nguồn Production**:
  - `ProjectRepository.java`: Cập nhật `searchProjects` và `countQuery` bổ sung điều kiện lọc SQL JPQL:
    `AND (:memberUserId IS NULL OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.projectId = p.id AND pm.userId = :memberUserId AND pm.active = true))`
    Đảm bảo phân vùng dữ liệu 100% tại CSDL, không lọc in-memory, metadata phân trang chính xác tuyệt đối.
  - `ProjectApplicationService.java`: Thêm kiểm tra `verifyProjectReadAccess` trong `getProjectDetail`; truyền `memberUserId` (null nếu Admin, userId nếu non-admin) vào repository `searchProjects`.
  - `ProjectMemberApplicationService.java`: Thêm kiểm tra `verifyProjectReadAccess` trong `getMembers`.
  - `MilestoneApplicationService.java`: Thêm kiểm tra `verifyProjectReadAccess` trong `getMilestones`.
  - `ProjectController.java`: Truyền `principal` xác thực vào cả 4 endpoint đọc: `getProjects`, `getProjectDetail`, `getProjectMembers`, `getMilestones`.
- **Kiểm thử tích hợp**:
  - Bổ sung 5 kịch bản tích hợp toàn diện trong `RolePermissionSeedIntegrationTest.java` (Test 9, 10, 11, 12, 13) sử dụng login và JWT thật từ V015 trên PostgreSQL Testcontainers sạch.
  - Toàn bộ 183/183 test và Checkstyle 0 lỗi đều PASS.

## Foundation Authorization Remediation & Canonical Blockers: RESOLVED

Nhiệm vụ vá lỗi truy cập thành viên dự án và làm cứng ma trận phân quyền trước Phase 9 đã hoàn thành:

- **Canonical Role-Permission Matrix Hardening**: Đã cập nhật Section 2.6 trong [02_USER_ROLES_AND_WORKFLOWS.md](file:///D:/WorkSphere/docs/02_USER_ROLES_AND_WORKFLOWS.md):
  - Cấp quyền `PROJECT_READ` cho cả 4 System Roles: `ADMIN`, `PROJECT_MANAGER`, `TEAM_LEADER`, `EMPLOYEE`.
  - Quy định rõ ràng business relation required: *Thành viên dự án đang hoạt động (Active Project Member) hoặc phạm vi quản trị canonical của ADMIN*.
  - Sửa toàn bộ số thứ tự section trong cột Canonical rationale tham chiếu đúng [06_API_CONTRACT.md](file:///D:/WorkSphere/docs/06_API_CONTRACT.md) (Section 11: Project API, Section 12: Task API, Section 17: Admin APIs, Section 18: Audit API).
- **Flyway Migration V015**:
  - Tạo `V015__correct_project_read_permissions_and_validate_role_matrix.sql` cấp `PROJECT_READ` cho `TEAM_LEADER` và `EMPLOYEE`.
  - Khối PostgreSQL `DO $$ ... END $$;` kiểm tra chặt chẽ số lượng và invariant: 4 roles, 29 permissions, 29 ADMIN, 19 PM, 15 LEADER, 13 EMP, 76 total mappings; kiểm tra `PROJECT_READ` có đủ trên 4 roles; kiểm tra `SERVICE_REQUEST_ASSIGN` và `SERVICE_CATEGORY_MANAGE` duy nhất thuộc `ADMIN`. Fail-fast nếu có bất kỳ sai lệch nào.
- **Exact Set Difference & Real Member Access Integration Tests**:
  - `RolePermissionSeedIntegrationTest.java`: Bổ sung kiểm tra hiệu tập hợp 2 chiều đối xứng (symmetric difference check) giữa EXPECTED và ACTUAL, đảm bảo không thiếu và không thừa bất kỳ permission nào cho từng role.
  - Bổ sung test tích hợp xác thực thực tế: Nhân viên (`EMPLOYEE`) và Trưởng nhóm (`TEAM_LEADER`) là active project member đăng nhập thật, nhận JWT thật và gọi `GET /api/v1/projects/{projectId}` thành công (200 OK).
  - Cập nhật fixture trong `ProjectMockMvcTest.java` sử dụng unprivileged token khi kiểm thử gate 403 của `@PreAuthorize`.
  - Toàn bộ 179/179 tests của repository và Checkstyle 0 lỗi đều PASS.

## Deferred / Known Gaps

- [RESOLVED] `PROJECT_READ_PERMISSION_MATRIX_RISK`: Đã giải quyết bằng migration `V015` và cập nhật Section 2.6 canonical matrix.
- [RESOLVED] `ROLE_PERMISSION_SEED_SILENT_OMISSION_RISK`: Đã giải quyết bằng khối DO block fail-fast validation guard trong `V015`.
- [RESOLVED] `ROLE_PERMISSION_MATRIX_EVIDENCE_GAP`: Đã giải quyết bằng kiểm tra hiệu tập hợp hai chiều (exact set difference) trong `RolePermissionSeedIntegrationTest` và rà soát số section canonical.

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

- **Giai đoạn 10: Asset Management Module** (theo đúng `docs/08_DEVELOPMENT_ROADMAP.md` Section 14, P0).
- Không bắt đầu triển khai Phase 10 trong phiên hiện tại.
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
