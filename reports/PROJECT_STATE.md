# WorkSphere Project State

## Git Checkpoint

- Branch: main
- Latest Validated Implementation: `ed2599d7f34644a7b03a29ffdb607b52d427e68f`
- Phase 8 Hardening Commit: `3a8cdde8deeb447af97149b1d3885814897203e5`
- Phase 8 Implementation Base: `6a72c01d8f6f6d9684d24d2699b6742c2a513e78`
- Working tree at checkpoint: clean

## Latest Validated Implementation

- Commit: `ed2599d7f34644a7b03a29ffdb607b52d427e68f`
- Commit message: `fix(file): verify symlink and archive resource safety`
- Hardening Base: `3a8cdde8deeb447af97149b1d3885814897203e5`
- Implementation Base: `6a72c01d8f6f6d9684d24d2699b6742c2a513e78`
- Phase 8 Report Checkpoint: `reports/PHASE_08_REPORT.md`

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
- IDE Extension Discovery, Installation and Automation Authorization: enabled and active (D-033, D-034, Antigravity extensions inventory verified at C:\Users\dienm\.antigravity-ide\extensions with 10 verified extension suites, PostgreSQL prioritization over mssql)
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
  - Upload (`POST /api/v1/files`), Download (`GET /api/v1/files/{fileId}/download`), and Soft Delete (`DELETE /api/v1/files/{fileId}`): verified.
  - Access control and authorization: unlinked files restricted to uploader/Admin, task-linked files restricted to active project members of the task's project, cross-project and inactive member downloads rejected: verified.
  - Linkage protection: files attached to tasks or service requests cannot be deleted via File API (HTTP 422 `FILE_ALREADY_LINKED`): verified.
  - Compensating cleanup: storage cleanup failure on rollback preserves primary persistence exception: verified.
  - Task Attachment integration: `TaskAttachment` entity, comment attachment integration (`attachmentFileIds`), atomic transaction, and N+1 safe `attachmentCount` batch query: verified.
  - Comprehensive report at reports/PHASE_08_REPORT.md.

## Latest Evidence

- Backend Test Suite on Host (Oracle JDK 27, Testcontainers postgres:15-alpine):
  - Checkstyle: 0 violations
  - Total tests: 170/170 PASS (100 regression + 70 File & Attachment module tests)
  - Failures: 0 | Errors: 0 | Skipped: 0
  - Maven execution: BUILD SUCCESS (exit code 0)
- Java 21 Targeted Validation Suite (Docker eclipse-temurin:21-jdk, runtime Temurin-21.0.12.1+1):
  - Checkstyle: 0 violations PASS
  - Targeted storage & validation tests: 33/33 PASS (`LocalFileSystemStorageTest` 8/8 PASS, `FileValidationServiceTest` 25/25 PASS)
  - Real Linux filesystem symlink validation: store, load, and delete traversing symbolic links strictly rejected with outside directory completely preserved (`TESTED_ON_LINUX_CONTAINER`)
- Database & Migrations:
  - V001 to V012: unchanged 100%
  - V012 applied and validated on PostgreSQL
  - Zero schema drift, no V013 created
- Canonical documents: unchanged 100% (10/10 canonical documents in docs/ preserved)
- Working tree: clean
- HEAD equals origin/main before memory update: verified (`ed2599d7f34644a7b03a29ffdb607b52d427e68f`)

## Deferred Items & Known Gaps

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

- **Giai đoạn 9: Service Request Module** (theo đúng docs/08_DEVELOPMENT_ROADMAP.md Section 13, P0).
- Phải bắt đầu bằng nhiệm vụ khảo sát phạm vi (Audit/Plan) của Giai đoạn 9 trước khi viết mã nguồn.
- Không bắt đầu triển khai React Native / mobile source trong giai đoạn này.

## Trust Rules

- Verify this file against Git at the start of every session.
- Git history and build/test outputs override stale content in this file.
- Update this file only after validation evidence exists.
- Never mark a phase completed based only on model statements.

## Recent Git Log

- ed2599d fix(file): verify symlink and archive resource safety
- 3a8cdde fix(file): harden storage security, zip bomb defense, and download authorization
- 5d45728 docs(agent): authorize web runtime and browser automation
- 6a72c01 feat(file): implement secure file storage module
- 1306570 docs(agent): checkpoint phase 7 completion
- daa69a1 docs(ops): add V012 preflight and Java 21 validation
