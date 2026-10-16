# WorkSphere Project State

## Git Checkpoint

- Branch: main
- Current Checkpoint: `46b3b5ca7023f4b1c5e4633def1f0f8e16816602`
- Latest Implementation Commit: `46b3b5ca7023f4b1c5e4633def1f0f8e16816602`
- Phase 10 Implementation Base: `41b7a175394d41c8f39ff41615121f0f42a7a823`
- Working tree at checkpoint: clean

## Latest Implementation & Hardening

- Implementation Commit: `46b3b5ca7023f4b1c5e4633def1f0f8e16816602`
- Commit message: `feat(asset): implement asset module`
- Phase 10 Hardening Status: COMPLETED, AUDITED, HARDENED
- Phase 10 Report Checkpoint: `reports/PHASE_10_REPORT.md`

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
    - Allocation series is not guaranteed gapless (strictly not described as PostgreSQL sequence).
  - Assignment:
    - Active cardinality strictly 0..1 per Service Request.
    - Row-level coordination lock via `PESSIMISTIC_WRITE` on `ServiceRequest`.
    - Idempotent assignment for same active assignee.
    - Reassignment history with `unassigned_at` timestamp and deactivation flush before new assignment insert.
    - Partial unique index `uk_service_assignments_one_active` (migration `V013`) as final database guard.
    - Exception translation mapping SQLState 23505 to `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409).
    - Controlled concurrency validation with multiple competing workers (two requests may both succeed with 200 if row lock serializes them, or concurrent race yields 409 SERVICE_ASSIGNMENT_CONFLICT; no HTTP 500; exactly 1 active assignment preserved).
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

- Phase 10 (Asset Management Module): COMPLETED, AUDITED, HARDENED, CONCURRENCY AND TRANSACTION VALIDATED
  - Category: Authenticated active list (`GET /api/v1/asset-categories`), admin pagination, create with trim/uppercase normalization (`^[A-Z0-9_]{2,50}$`), in-use check on AVAILABLE and RETIRED assets (`ASSET_CATEGORY_IN_USE`, 400), optimistic locking (`OPTIMISTIC_LOCK_CONFLICT`, 409).
  - Asset Core: Create with initial AVAILABLE status, code normalization (`^[A-Z0-9][A-Z0-9_-]{1,49}$`), duplicate code/serial rejection (409), status transition matrix, RETIRED terminal state.
  - Assignment & Concurrency: Pessimistic locking + V016 partial unique index, no direct reassignment, controlled concurrency (5 rounds x 2 workers on PostgreSQL Testcontainers) with strict canonical assertions (winner 201, loser 400 or 409, 0 500s).
  - Return & Rollback: Selectable resultingAssetStatus (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`), resulting status `ASSIGNED` rejected (400), ACID rollback verified on PostgreSQL via trigger failure injection.
  - Read Scoping: Query-level JPA Specification subqueries (Admin global scope vs non-admin active assigned scope), my-assets caller locked.
  - Related Service Requests: Projection in detail matches Phase 9 authorization (Admin sees all non-deleted, non-admin sees if requester OR active assignee; soft-deleted excluded).
  - Repair History: Immutable audit record (405 on PUT/DELETE), SR reference validation, no auto status change.
  - Migration V016: 8 tests in `V016MigrationTest` verifying clean migration V001-V016, constraints, indexes, and preflight NO-GO rollback with zero data loss.

## Latest Evidence

- Host runtime: Oracle JDK 27
- Project target: Java 21
- Maven: 3.9.16
- Spring Boot: 4.1.1 (verified directly from backend/pom.xml)
- PostgreSQL: postgres:15-alpine via Testcontainers
- Full backend suite: 260/260 PASS (206/210 regression + 50 Phase 10 tests)
  - 0 failures, 0 errors, 0 skipped
  - Maven execution: BUILD SUCCESS (exit code 0)
- Phase 10 test suites (50 tests):
  - `V016MigrationTest`: 8/8 PASS
  - `AssetCategoryMockMvcTest`: 9/9 PASS
  - `AssetCoreMockMvcTest`: 13/13 PASS
  - `AssetAssignmentAndConcurrencyMockMvcTest`: 10/10 PASS (hardened concurrency assertions & return rollback test with response safety)
  - `AssetRepairHistoryMockMvcTest`: 8/8 PASS (bao gồm kiểm thử chi phí null/optional)
  - `AssetServiceRequestIntegrationMockMvcTest`: 6/6 PASS
- Checkstyle: 0 violations
- Concurrency evidence:
  - Asset assignment: 2 concurrent workers x 5 rounds on PostgreSQL Testcontainers (verified exactly 1 winner 201 with matching assignedTo, loser strictly 400/409, no 500, exactly 1 active assignment preserved)
- Rollback evidence:
  - Asset return rollback verified on PostgreSQL via BEFORE UPDATE trigger failure injection; asset remains ASSIGNED, assignment remains ACTIVE, versions unchanged, returnedAt remains null, response payload safe.
- Database & Migrations:
  - V001 to V016 applied and validated on PostgreSQL Testcontainers
  - Migrations 100% immutable and tracked (V001-V016 intact; zero V017)
- Canonical documents: Section 14.7 patched to clarify assignment lifecycle and schema-reserved states
- Working tree: clean
- HEAD equals origin/main before audit commit

## Deferred Items & Known Gaps

- ASSET_ASSIGNMENT_LOST_DAMAGED_WORKFLOW_DEFERRED: Giá trị enum `LOST` và `DAMAGED` trong `AssetAssignmentStatus` là schema-reserved enum values; `docs/06_API_CONTRACT.md` mục 14.7 đã chuẩn hóa phạm vi vòng đời Phase 10 là `ACTIVE -> RETURNED`; quy trình xử lý phân công thất thoát/hư hỏng hoãn lại rõ ràng, không còn unresolved contract gap.
- NOTIFICATION_SIDE_EFFECT_DEFERRED: Phase 9/10 không triển khai Notification Module; không email, push notification hoặc WebSocket. Hoãn đến phase canonical tiếp theo nếu Roadmap quy định.
- SERVICE_REQUEST_SLA_DEFERRED: Không có SLA engine, không tính business hours, không escalation, không pause/resume SLA.
- SERVICE_ATTACHMENT_COMMENT_LINK_GAP: Bảng `service_attachments` chỉ liên kết với `request_id`. File gửi kèm khi tạo comment vẫn là attachment cấp Service Request; không có `comment_id` trong schema và không được mô tả là attachment riêng của comment.
- FILE_ORPHAN_RECONCILIATION_GAP: Nếu metadata persistence và compensating physical cleanup cùng thất bại, physical file có thể trở thành orphan.
- Technical Debt mức Low:
  - TASK_FLYWAY_CONFIGURATION_MODULE_LOCATION_LOW: TaskFlywayConfiguration hiện ở task.infrastructure. Có thể chuyển sang shared.infrastructure trong đợt refactor riêng.
  - DATA_INTEGRITY_ERROR_MAPPING_FALLBACK_LOW: Exception mapping cho task_assignments có thể nâng cấp sang trích xuất constraint PostgreSQL driver tương tự Asset module.

## Next Permitted Phase

- **Giai đoạn 11: Notification Module** (hoặc Audit / Checkpoint trước khi bắt đầu Phase 11).
- Không bắt đầu triển khai Phase 11 trong phiên hiện tại.
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
