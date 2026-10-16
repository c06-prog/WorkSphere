# WorkSphere Project State

## Git Checkpoint

- Branch: main
- Current Checkpoint: `2034c4aa8fd1fc6d0720a8b8349868785158f4a6`
- Latest Validated Implementation: `2034c4aa8fd1fc6d0720a8b8349868785158f4a6`
- Phase 9 Hardening Commit: `2034c4aa8fd1fc6d0720a8b8349868785158f4a6`
- Phase 9 Implementation Base: `e189306aa4d4a2f6700014d165f07d452d1cb16e`
- Working tree at checkpoint: clean

## Latest Validated Implementation

- Commit: `2034c4aa8fd1fc6d0720a8b8349868785158f4a6`
- Commit message: `fix(service-request): harden concurrency and rollback behavior`
- Hardening Base: `2034c4aa8fd1fc6d0720a8b8349868785158f4a6`
- Implementation Base: `e189306aa4d4a2f6700014d165f07d452d1cb16e`
- Phase 9 Report Checkpoint: `reports/PHASE_09_REPORT.md`

## Validated Progress

- Phase 0: completed
- Phase 1: completed
- Phase 2: completed
- Phase 3: PostgreSQL validation completed
- Phase 4: Authentication and Authorization completed
- Phase 5: Organization and User Management completed and independently audited
- Phase 6: Project Module completed, audited and patched (LAST_PROJECT_MANAGER_INVARIANT_GAP resolved)
- Mobile UI/UX Specification Baseline: completed and pushed (14 documents in design/)
- Visual UI Prototype: completed, browser validated on real Microsoft Edge, and pushed
- Prototype Runtime: HTML5, CSS3, JavaScript, zero third-party dependencies (no npm, no CDN)
- Validated Viewports: 411 × 914 dp (emulator-5554 / Android 15) and 360 × 800 dp (Android Small)
- Android Test Lab: verified (emulator-5554, Android 15, API 35, 1080x2400, 420dpi)
- ADB: verified (D:\AndroidSDK\platform-tools\adb.exe, version 1.0.41)
- Docker: verified (Docker Desktop 4.94.0, Engine 29.8.2, jenkins-lts running, worksphere-dev-pg available)
- Tool Installation Authorization: enabled with safeguards (D-019, D-020, D-021, allowlist, user action protection)
- Web Runtime and Browser Automation Authorization: enabled and active (D-026, D-027, Microsoft Edge headless priority, profile test isolation at D:\AI\Profiles\Edge\WorkSphere)
- IDE Extension Discovery, Installation and Automation Authorization: enabled and active (D-033, D-034, Antigravity extensions inventory verified at C:\Users\dienm\.antigravity-ide\extensions with 10 verified extension suites, PostgreSQL canonical/default, SQL Server permitted when specifically required)
- Tool Registry: updated at reports/ENVIRONMENT_TOOL_REGISTRY.md (26 host tools + Section 3 with 10 verified Antigravity IDE extension suites)
- Phase 7 (Task Management Module): COMPLETED, AUDITED, PATCHED, OPERATIONALLY VALIDATED
  - Task Core lifecycle, workflow state machine, optimistic locking, allowedActions computation: verified.
  - Subtask hierarchy and cycle detection via visited set (52 levels tested without recursion overflow): verified.
  - Task Assignment with partial unique index V012 (concurrency tested 5 times with 4 threads, 1 winner): verified.
  - Status History and transactional rollback on PostgreSQL engine failure: verified.
  - Task Comment authorization (author and System Admin only, PM non-admin forbidden): verified.
  - V012 Operational Runbook created and tracked at reports/runbooks/V012_ACTIVE_TASK_ASSIGNMENT_UNIQUENESS.md.
- Phase 8 (File Module & Task Attachment Integration): COMPLETED, AUDITED, HARDENED, SECURITY VALIDATED
  - StoredFile domain entity, status lifecycle (ACTIVE, QUARANTINED, DELETED), purpose enum, and repository: verified.
  - FileStorageService abstraction and LocalFileSystemStorageService with atomic move, temp staging `.tmp/`, traversal defense, and destination overwrite protection: verified.
  - Safe validation: basename sanitization (RFC 5987 UTF-8 Content-Disposition), MIME/magic-byte checks (JPEG, PNG, WEBP, PDF), and in-memory ZipInputStream structure inspection for DOCX (`word/`) and XLSX (`xl/`): verified.
  - ZIP bomb & resource safety: entry count $\le$ 200, entry uncompressed size $\le$ 50MB, total uncompressed size $\le$ 100MB, compression ratio $\le$ 100.0, live ratio tracking via CountingInputStream, and strict traversal blocking (`..`, `\`, leading `/`, drive letter `C:`): verified.
  - SHA-256 integrity calculation and streaming download with `X-Content-Type-Options: nosniff`: verified.
  - Upload (`POST /api/v1/files`), Download (`GET /api/v1/files/{fileId}/download`), and Soft Delete (`DELETE /api/v1/files/{fileId}` - returns 200 OK + `ApiResponse<Void>`, correcting prior memory references citing 204): verified.
  - Access control and authorization: unlinked files restricted to uploader/Admin, task-linked files restricted to active project members of the task's project, cross-project and inactive member downloads rejected: verified.
  - Linkage protection: files attached to tasks or service requests cannot be deleted via File API (HTTP 422 `FILE_ALREADY_LINKED`): verified.
  - Compensating cleanup: storage cleanup failure on rollback preserves primary persistence exception: verified.
  - Task Attachment integration: `TaskAttachment` entity, comment attachment integration (`attachmentFileIds`), atomic transaction, and N+1 safe `attachmentCount` batch query: verified.
  - Comprehensive report at reports/PHASE_08_REPORT.md.
- Phase 9 (Service Request Module): COMPLETED, AUDITED, HARDENED, CONCURRENCY AND TRANSACTION VALIDATED
  - Service Category:
    - Hierarchical categories with parent-child relationship.
    - Code normalization (regex `^[A-Z0-9_]{2,50}$`) and uniqueness (`SERVICE_CATEGORY_CODE_ALREADY_EXISTS`, 409).
    - Active/inactive lifecycle (`SERVICE_CATEGORY_ALREADY_ACTIVE`, `SERVICE_CATEGORY_ALREADY_INACTIVE`).
    - Parent validation (`SERVICE_CATEGORY_PARENT_INVALID`).
    - Set<UUID> cycle detection (`SERVICE_CATEGORY_CYCLE_DETECTED`).
    - Valid depth greater than 50 verified without artificial recursion limit.
    - Optimistic locking concurrency control.
    - In-use protection preventing deactivation of categories in active requests (`SERVICE_CATEGORY_IN_USE`, 400).
  - Service Request Core:
    - Create, list, detail, and update while in OPEN state.
    - Soft-delete filtering (`is_deleted = false`).
    - Query-level authorization scoping via Spring Data JPA Specification (Admin global scope vs non-admin requester/assignee scope).
    - Pagination, filtering (status, priority, category, search), and sorting with matching countQuery.
    - Optimistic locking concurrency control via @Version (`OPTIMISTIC_LOCK_CONFLICT`, 409).
  - Request Number:
    - Canonical format: `SR-YYYY-NNNNNN` (e.g., `SR-2026-000001`).
    - Injected `java.time.Clock` with business zone `Asia/Ho_Chi_Minh`.
    - PostgreSQL two-key transactional advisory lock: `SELECT pg_advisory_xact_lock(1301, :year)` (module key `1301`).
    - Year-scoped MAX + 1 allocation with automatic reset on new calendar year.
    - Unique database constraint `uk_service_requests_request_number` as final engine guard.
    - Non-gapless allocation mechanism (strictly not described as PostgreSQL sequence).
  - Assignment:
    - Active cardinality strictly 0..1 per Service Request.
    - Row-level coordination lock via `PESSIMISTIC_WRITE` on `ServiceRequest`.
    - Idempotent assignment for same active assignee.
    - Reassignment history with `unassigned_at` timestamp and deactivation flush before new assignment insert.
    - Partial unique index `uk_service_assignments_one_active` (migration `V013`) as final database guard.
    - Exception translation mapping SQLState 23505 to `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409).
    - Controlled concurrency validation with multiple competing workers (1 winner, 1 conflict).
  - Workflow:
    - Seven canonical states: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_FOR_USER`, `RESOLVED`, `CLOSED`, `CANCELLED`.
    - Allowed transitions strictly validated; RESOLVED requires resolution comment; CLOSED records `closed_at`; CANCELLED records `cancelled_at`.
  - Status History:
    - Same database transaction as request state mutation.
    - changedBy from principal, changedAt from injected Clock.
    - Atomic rollback verified on PostgreSQL via trigger failure injection.
  - Reject Resolution:
    - Dedicated endpoint: `POST /api/v1/service-requests/{requestId}/reject-resolution`.
    - Requester-only access control (non-requester rejected with HTTP 403 Forbidden).
    - Transitions from `RESOLVED` back to `IN_PROGRESS`.
    - Resolution rejection reason required and recorded in status history.
    - Active assignee retained.
  - Comments:
    - Public comments accessible to requester, assignee, and Admin.
    - Internal notes (`is_internal = true`) restricted to active assignee and Admin.
    - Requester denied from creating or viewing internal notes.
    - Query-level visibility filtering before pagination and count metadata calculation.
    - Previous assignee denied access.
  - Attachments:
    - Purpose `SERVICE_ATTACHMENT` only and `ACTIVE` StoredFile status.
    - Ownership validation: must be uploaded by current user or Admin.
    - Zero cross-request reuse.
    - Linkage at Service Request level (`service_attachments` table has `request_id`, no `comment_id`).
    - Download authorization inherited from Service Request relation (requester, active assignee, Admin).
    - Implementation response projection per D-035 (no storage metadata leakage).
  - Rating:
    - Requester-only access control.
    - Applicable strictly when request is in `CLOSED` state.
    - Score range 1 to 5 stars.
    - Single rating per request enforced by unique constraint `service_ratings.request_id`.
    - Concurrent duplicate mapping to `SERVICE_RATING_ALREADY_EXISTS` (HTTP 409).

## Latest Evidence

- Host runtime: Oracle JDK 27
- Project target: Java 21
- Maven: 3.9.16
- Spring Boot: 4.1.1 (verified directly from backend/pom.xml)
- PostgreSQL: postgres:15-alpine via Testcontainers
- Full backend suite: 210/210 PASS (183 regression + 27 Phase 9 tests)
  - 0 failures, 0 errors, 0 skipped
  - Maven execution: BUILD SUCCESS (exit code 0)
- Phase 9 test suites:
  - ServiceCategoryMockMvcTest: 10/10 PASS
  - ServiceRequestMockMvcTest: 17/17 PASS
- Checkstyle: 0 violations
- Concurrency evidence:
  - Request-number allocation: 8 concurrent workers x 5 rounds (verified unique allocations and no duplicates)
  - Service assignment: 2 concurrent workers x 5 rounds (verified 1 winner, 1 conflict, invariant preserved)
  - Service rating: 2 concurrent workers x 5 rounds (verified 1 winner, 1 conflict, duplicate mapped to 409)
- Rollback evidence:
  - Status history rollback verified on PostgreSQL via temporary trigger failure injection
  - ServiceRequest status, version, and timestamps unchanged; history count unchanged
- Database & Migrations:
  - V001 to V015 applied and validated on PostgreSQL Testcontainers
  - Migrations 100% immutable and tracked (no V016 needed)
- Canonical documents: unchanged 100% (10/10 canonical documents in docs/ preserved)
- Working tree: clean
- HEAD equals origin/main before memory update
- No Phase 10 source code implemented
- No mobile implementation started

## Deferred Items & Known Gaps

- NOTIFICATION_SIDE_EFFECT_DEFERRED: Phase 9 không triển khai Notification Module; không email, push notification hoặc WebSocket. Hoãn đến phase canonical tiếp theo nếu Roadmap quy định.
- SERVICE_REQUEST_SLA_DEFERRED: Không có SLA engine, không tính business hours, không escalation, không pause/resume SLA.
- SERVICE_ATTACHMENT_COMMENT_LINK_GAP: Bảng `service_attachments` chỉ liên kết với `request_id`. File gửi kèm khi tạo comment vẫn là attachment cấp Service Request; không có `comment_id` trong schema và không được mô tả là attachment riêng của comment.
- FILE_ORPHAN_RECONCILIATION_GAP: Nếu metadata persistence và compensating physical cleanup cùng thất bại, physical file có thể trở thành orphan. Exception gốc được giữ nguyên, failure được log an toàn bằng fileId mà không lộ physical path. Cần reconciliation worker hoặc operational process trước khi đưa vào production.
- FILE_STORAGE_TOCTOU_LOW: Existing symlink escape đã được chặn và kiểm thử thành công trên Linux container. Java NIO portable API không loại bỏ tuyệt đối TOCTOU trước actor đã có quyền can thiệp trực tiếp filesystem lưu trữ. Môi trường production phải bảo vệ storage root bằng phân quyền hệ điều hành phù hợp.
- FILE_VIRUS_SCANNING_DEFERRED: ClamAV daemon hoãn đến môi trường production; kiểm tra in-flight qua magic bytes và ZIP entry inspection.
- CLOUD_STORAGE_PROVIDER_DEFERRED: Production provider chưa được chọn. Local filesystem là provider Development/Test. FileStorageService abstraction cho phép bổ sung provider sau mà không ảnh hưởng controller/domain. Không mặc định chọn S3, MinIO hoặc Azure Blob.
- TASK_DETAIL_ATTACHMENT_ITEMS_API_GAP: Canonical API trong docs/06_API_CONTRACT.md định nghĩa `attachmentCount`; schema chi tiết cho danh sách attachment items trong Task Detail chưa được định nghĩa. Hệ thống không tự ý phát minh response payload.
- TASK_DELETE_RULE_AMBIGUITY_DEFERRED: Canonical docs chưa định nghĩa đầy đủ "business history quan trọng". Logic hiện tại chỉ kiểm tra task status history (TASK_CANNOT_DELETE_HAS_HISTORY).
- Technical Debt mức Low:
  - TASK_FLYWAY_CONFIGURATION_MODULE_LOCATION_LOW: TaskFlywayConfiguration hiện ở task.infrastructure. Có thể chuyển sang shared.infrastructure trong đợt refactor riêng.
  - DATA_INTEGRITY_ERROR_MAPPING_FALLBACK_LOW: Exception mapping còn fallback message.contains("task_assignments"). Nên nâng cấp sang duyệt SQLException chain.
- Deferred gaps cũ:
  - TEMPORARY_PASSWORD_FLOW_GAP: Admin tạo User với trạng thái PENDING và mật khẩu tạm thời hash BCrypt.
  - TEAM_API_CONTRACT_GAP: Team và Team Member domain/repository/service đã hoàn thành nhưng chưa có REST controller vì 06_API_CONTRACT.md chưa định nghĩa endpoints.
  - DASHBOARD_AGGREGATED_API_GAP: API GET /api/v1/dashboard/me có trong hợp đồng nhưng chưa có backend controller.
  - PUT_ME_PASSWORD_TEST_GAP: Test coverage cho luồng đổi mật khẩu người dùng hiện tại tiếp tục hoãn.

## Next Permitted Phase

- **Giai đoạn 10: Asset Module** (theo đúng `docs/08_DEVELOPMENT_ROADMAP.md` Section 14, P1).
- Không bắt đầu triển khai Phase 10 trong phiên hiện tại.
- Không bắt đầu triển khai React Native / mobile source trong giai đoạn này.

## Trust Rules

- Verify this file against Git at the start of every session.
- Git history and build/test outputs override stale content in this file.
- Update this file only after validation evidence exists.
- Never mark a phase completed based only on model statements.

## Recent Git Log

- 2034c4a fix(service-request): harden concurrency and rollback behavior
- e189306 feat(service-request): implement service request module
- fb8f41b fix(project): enforce member-scoped project reads
- 3e05c7c fix(auth): grant project read to members and harden matrix validation
- 1767951 fix(auth): seed canonical role permissions
- b9bc66e docs(audit): audit role-permission seeds and identify phase 9 blockers
- e811261 docs(design): finalize phase 9 locking and error semantics
- 41c648a docs(design): harden phase 9 assignment concurrency decision
