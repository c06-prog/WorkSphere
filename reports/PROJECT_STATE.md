# WorkSphere Project State

## Git Checkpoint

- Branch: main
- Current Checkpoint HEAD: 6a72c01d8f6f6d9684d24d2699b6742c2a513e78
- origin/main: 6a72c01d8f6f6d9684d24d2699b6742c2a513e78
- Working tree at checkpoint: clean

## Latest Validated Implementation

- Commit: 6a72c01d8f6f6d9684d24d2699b6742c2a513e78
- Commit message: feat(file): implement secure file storage module
- Implementation Base: 6a72c01d8f6f6d9684d24d2699b6742c2a513e78
- Phase 8 Report Checkpoint: reports/PHASE_08_REPORT.md

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
- Tool Registry: updated at reports/ENVIRONMENT_TOOL_REGISTRY.md (26 entries, including Microsoft Edge 155.0.4283.45 and Edge WebDriver entry)
- Phase 7 (Task Management Module): COMPLETED, AUDITED, PATCHED, OPERATIONALLY VALIDATED
  - Task Core lifecycle, workflow state machine, optimistic locking, allowedActions computation: verified.
  - Subtask hierarchy and cycle detection via visited set (52 levels tested without recursion overflow): verified.
  - Task Assignment with partial unique index V012 (concurrency tested 5 times with 4 threads, 1 winner): verified.
  - Status History and transactional rollback on PostgreSQL engine failure: verified.
  - Task Comment authorization (author and System Admin only, PM non-admin forbidden): verified.
  - V012 Operational Runbook created and tracked at reports/runbooks/V012_ACTIVE_TASK_ASSIGNMENT_UNIQUENESS.md.
- Phase 8 (File Module & Task Attachment Integration): COMPLETED, AUDITED, VALIDATED
  - StoredFile entity, status, purpose enum, and repository: verified.
  - FileStorageService abstraction and LocalFileSystemStorageService with atomic move, traversal defense, and temp staging: verified.
  - Safe validation (magic bytes for JPEG/PNG/WEBP/PDF, zip-bomb/traversal safe in-memory inspection for DOCX/XLSX, size limits): verified.
  - Upload, download streaming with nosniff and RFC 5987 UTF-8 Content-Disposition, and soft-delete retention: verified.
  - TaskAttachment entity, repository, comment attachment integration (attachmentFileIds), and N+1 safe attachmentCount aggregation: verified.
  - Comprehensive report at reports/PHASE_08_REPORT.md.

## Latest Evidence

- Backend Test Suite on Host (Oracle JDK 27, Testcontainers postgres:15-alpine):
  - Checkstyle: 0 violations
  - Total tests: 152/152 PASS (100 regression + 52 File & Attachment module tests)
  - Failures: 0 | Errors: 0 | Skipped: 0
  - Maven execution: BUILD SUCCESS (exit code 0)
- Java 21 Validation Suite (Docker eclipse-temurin:21-jdk, runtime Temurin-21.0.12.1+1):
  - Checkstyle: 0 violations PASS
  - javac [release 21] 110 source files: PASS
  - Unit tests (TaskTest, TaskWorkflowTest): 16/16 PASS
  - H2 context integration test (BackendApplicationTests): 1/1 PASS
- Database & Migrations:
  - V001 to V012: unchanged 100%
  - V012 applied and validated on PostgreSQL
  - Zero schema drift, no V013 created
- Canonical documents: unchanged 100% (10/10 canonical documents in docs/ preserved)
- Working tree: clean
- HEAD equals origin/main: verified

## Deferred Items & Known Gaps

- TASK_DELETE_RULE_AMBIGUITY_DEFERRED: Canonical docs chưa định nghĩa đầy đủ "business history quan trọng". Logic hiện tại chỉ kiểm tra task status history (TASK_CANNOT_DELETE_HAS_HISTORY).
- FILE_VIRUS_SCANNING_DEFERRED: ClamAV daemon hoãn đến môi trường production; kiểm tra in-flight qua magic bytes và ZIP entry inspection.
- FILE_CLOUD_STORAGE_DEFERRED: Amazon S3 / MinIO hoãn đến production; LocalFileSystemStorageService đáp ứng dev/test.
- FILE_PURGE_WORKER_DEFERRED: Xóa vật lý các tệp đã xóa mềm hoãn đến khi có background scheduled purge job.
- TASK_DETAIL_ATTACHMENT_LIST_API_GAP: Task Detail trả về attachmentCount theo đúng canonical contract; danh sách chi tiết từng file trong Task Detail chưa có trong docs/06_API_CONTRACT.md.
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

6a72c01 (HEAD -> main, origin/main, origin/HEAD) feat(file): implement secure file storage module
1306570 docs(agent): checkpoint phase 7 completion
daa69a1 docs(ops): add V012 preflight and Java 21 validation
e2622d2 fix(task): harden assignment and task invariants
d548dcb docs(agent): codify proactive execution scope and autonomy principles
cd3a201 docs(agent): authorize managed tool installation
abefa44 feat(task): implement task management module
