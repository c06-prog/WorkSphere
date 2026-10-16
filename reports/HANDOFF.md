# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- Current Task: ĐÓNG CHECKPOINT PHASE 9 - SERVICE REQUEST MODULE
- Latest Validated Phase 9 Implementation: `2034c4aa8fd1fc6d0720a8b8349868785158f4a6`
- Phase 9 Implementation Base: `e189306aa4d4a2f6700014d165f07d452d1cb16e`
- Operational Documentation Checkpoint: reports/DECISIONS.md (D-045), reports/PHASE_09_REPORT.md, reports/PROJECT_STATE.md
- Phase 9 Status: COMPLETED, AUDITED, HARDENED, CONCURRENCY AND TRANSACTION VALIDATED
- Working tree: clean
- Build status: BUILD SUCCESS (Maven 3.9.16, Spring Boot 4.1.1, Java target 21, Checkstyle 0 violations)
- Test status:
  - Host Suite (Oracle JDK 27, Testcontainers PostgreSQL): 210/210 PASS (0 failures, 0 errors, 0 skipped)
  - Existing Regression Suite (Phase 0 - Phase 8): 183/183 PASS
  - Phase 9 Service Category Tests (`ServiceCategoryMockMvcTest`): 10/10 PASS
  - Phase 9 Service Request Core / Workflow / Assignment / Attachment / Rating / Scoping Tests (`ServiceRequestMockMvcTest`): 17/17 PASS (bao gồm 5 hardened controlled concurrency & rollback tests)

## Phase 9 Service Request Module: COMPLETED & HARDENED

- **Service Category**:
  - Hierarchical tree structure, parent validation, activate/deactivate lifecycle, in-use protection.
  - Normalized code uniqueness (`^[A-Z0-9_]{2,50}$`).
  - Cycle detection using `Set<UUID> visited` without artificial depth limit (> 50 levels verified).
  - Optimistic locking concurrency control.
- **Request Number Allocation**:
  - Format canonical: `SR-YYYY-NNNNNN` via PostgreSQL two-key transactional advisory lock `(1301, year)`.
  - Injected `java.time.Clock` with business zone `Asia/Ho_Chi_Minh`.
  - Year-scoped MAX + 1 sequence allocation; resets safely on new calendar year.
  - Unique database constraint `uk_service_requests_request_number` as final engine guard.
  - Mechanism is transactional year-scoped allocation (strictly not a PostgreSQL sequence; non-gapless).
  - Concurrency validated: 8 concurrent workers x 5 rounds on PostgreSQL Testcontainers.
- **Service Assignment**:
  - Single active assignee invariant (`0..1`).
  - Row-level coordination lock via `PESSIMISTIC_WRITE` on `ServiceRequest`.
  - Idempotent assignment for same active assignee.
  - Reassignment deactivates old record (`is_active = FALSE`, `unassigned_at = Clock.instant()`) and flushes before inserting new record.
  - Partial unique index `uk_service_assignments_one_active` (migration `V013`) as final DB guard.
  - Database conflict mapped to `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409 Conflict).
  - Concurrency validated: 2 concurrent workers x 5 rounds (1 winner, 1 conflict).
- **Status Workflow & History**:
  - Seven canonical states: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_FOR_USER`, `RESOLVED`, `CLOSED`, `CANCELLED`.
  - Allowed transitions strictly validated; RESOLVED requires resolution comment; CLOSED records `closed_at`; CANCELLED records `cancelled_at`.
  - Status history logged in same database transaction with `changedBy` from principal and `changedAt` from Clock.
  - Transaction atomicity & rollback verified on PostgreSQL via temporary trigger failure injection.
- **Reject Resolution**:
  - Dedicated endpoint `POST /api/v1/service-requests/{requestId}/reject-resolution` restricted to original requester (others rejected with 403 Forbidden).
  - Transitions `RESOLVED -> IN_PROGRESS`, retains active assignee, requires rejection reason, logs in history.
- **Comments & Internal Notes**:
  - Public comments vs internal notes (`is_internal = true`).
  - Requester restricted to public comments; active assignee and Admin can view/create internal notes.
  - Previous assignee denied access (HTTP 403 Forbidden).
  - Query-level visibility scoping before pagination and count calculation.
- **Attachments & File Integration**:
  - Reuses Phase 8 File Module with purpose `SERVICE_ATTACHMENT` and `ACTIVE` StoredFile status.
  - Ownership validation (uploader or Admin) and cross-request reuse forbidden.
  - Linkage at Service Request level (`service_attachments` has `request_id`, no `comment_id`).
  - Download authorization inherited from Service Request access (requester, active assignee, Admin).
  - Implementation response projection per D-035 (no storage metadata leakage).
- **Service Rating**:
  - Requester-only access control; applicable strictly when request is in `CLOSED` state.
  - Score 1 to 5 stars; guarded by unique constraint `service_ratings.request_id`.
  - Concurrent duplicate submissions mapped to `SERVICE_RATING_ALREADY_EXISTS` (HTTP 409 Conflict).
- **Query-Level Scoping**:
  - Spring Data JPA `Specification<ServiceRequest>` enforcing database-level scoping for non-admins vs admins.
  - Metadata pagination and count queries match scoped dataset.
- **Comprehensive Documentation**:
  - Detailed report tracked at `reports/PHASE_09_REPORT.md`.

## Deferred Items & Known Gaps

- `NOTIFICATION_SIDE_EFFECT_DEFERRED`: Phase 9 không triển khai Notification Module; không email, push notification hoặc WebSocket. Hoãn đến phase canonical tiếp theo nếu Roadmap quy định.
- `SERVICE_REQUEST_SLA_DEFERRED`: Không có SLA engine, không tính business hours, không escalation, không pause/resume SLA.
- `SERVICE_ATTACHMENT_COMMENT_LINK_GAP`: Bảng `service_attachments` chỉ liên kết với `request_id`. File gửi kèm khi tạo comment vẫn là attachment cấp Service Request; không có `comment_id` trong schema và không được mô tả là attachment riêng của comment.
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

- **Giai đoạn 10: Asset Module** (theo đúng `docs/08_DEVELOPMENT_ROADMAP.md` Section 14, P1).
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
9. Read the relevant canonical document sections for Phase 10 (docs/08_DEVELOPMENT_ROADMAP.md Section 14, docs/05_DATABASE_DESIGN.md, docs/06_API_CONTRACT.md).
10. Identify the exact scoped task for Phase 10.
11. Do not start another roadmap phase without explicit scope.

## Model Switch Procedure

When FCM switches model:

- Continue within the same OpenCode session where possible.
- Recheck current tool output.
- Recheck git status before writing.
- Do not repeat completed commands unnecessarily.
- If state is unclear, stop writing and produce a checkpoint report.
