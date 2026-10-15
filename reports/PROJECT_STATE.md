# WorkSphere Project State

## Git Checkpoint

- Branch: main
- Current Checkpoint HEAD: daa69a102b2f77ecc70eb2b7b08614c302ab5e03
- origin/main: daa69a102b2f77ecc70eb2b7b08614c302ab5e03
- Working tree at checkpoint: clean

## Latest Validated Implementation

- Commit: e2622d263ae04358bfb6f9f1617036a6aa478249
- Commit message: fix(task): harden assignment and task invariants
- Implementation Base: abefa44b0d6ec00a28798b74b17b7ecbbb726168 (feat(task): implement task management module)
- Operational Documentation Checkpoint: daa69a102b2f77ecc70eb2b7b08614c302ab5e03 (docs(ops): add V012 preflight and Java 21 validation)

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
- Tool Registry: updated at reports/ENVIRONMENT_TOOL_REGISTRY.md (24 entries, including Java 21 validation container)
- Phase 7 (Task Management Module): COMPLETED, AUDITED, PATCHED, OPERATIONALLY VALIDATED
  - Task Core lifecycle, workflow state machine, optimistic locking, allowedActions computation: verified.
  - Subtask hierarchy and cycle detection via visited set (52 levels tested without recursion overflow): verified.
  - Task Assignment with partial unique index V012 (concurrency tested 5 times with 4 threads, 1 winner): verified.
  - Status History and transactional rollback on PostgreSQL engine failure: verified.
  - Task Comment authorization (author and System Admin only, PM non-admin forbidden): verified.
  - V012 Operational Runbook created and tracked at reports/runbooks/V012_ACTIVE_TASK_ASSIGNMENT_UNIQUENESS.md.

## Latest Evidence

- Backend Test Suite on Host (Oracle JDK 27, Testcontainers postgres:15-alpine):
  - Checkstyle: 0 violations
  - Total tests: 100/100 PASS (59 regression + 41 Task module tests)
  - Failures: 0 | Errors: 0 | Skipped: 0
  - Maven execution: BUILD SUCCESS (exit code 0)
- Java 21 Validation Suite (Docker eclipse-temurin:21-jdk, runtime Temurin-21.0.12.1+1):
  - Checkstyle: 0 violations PASS
  - javac [release 21] 110 source files: PASS
  - Unit tests (TaskTest, TaskWorkflowTest): 16/16 PASS
  - H2 context integration test (BackendApplicationTests): 1/1 PASS
  - Lưu ý phạm vi: Java 21 full Testcontainers suite bên trong container tạm thời KHÔNG thực thi vì Docker socket có chủ đích không được mount để bảo vệ an toàn hệ thống và tránh Docker-in-Docker phức tạp.
- Database & Migrations:
  - V001 to V011: unchanged 100%
  - V012: applied and validated on PostgreSQL (partial unique index uk_task_assignments_active verified in pg_indexes)
  - V012 preflight runbook: created at reports/runbooks/V012_ACTIVE_TASK_ASSIGNMENT_UNIQUENESS.md
- Canonical documents: unchanged 100% (10/10 canonical documents in docs/ preserved)
- Working tree: clean
- HEAD equals origin/main: verified

## Deferred Items & Known Gaps

- TASK_DELETE_RULE_AMBIGUITY_DEFERRED: Canonical docs chưa định nghĩa đầy đủ "business history quan trọng". Logic hiện tại chỉ kiểm tra task status history (TASK_CANNOT_DELETE_HAS_HISTORY). Phase sau không được âm thầm thay đổi rule này mà phải chờ quyết định thiết kế chính thức.
- TASK_ATTACHMENT_DEFERRED_UNTIL_PHASE_08: Bảng task_attachments giữ nguyên trong database; không triển khai Entity/Service/API do phụ thuộc File Module và stored_files theo Roadmap.
- Technical Debt mức Low:
  - TASK_FLYWAY_CONFIGURATION_MODULE_LOCATION_LOW: TaskFlywayConfiguration hiện ở task.infrastructure. Có thể chuyển sang shared.infrastructure trong đợt refactor riêng; không phải lỗi chặn.
  - DATA_INTEGRITY_ERROR_MAPPING_FALLBACK_LOW: Exception mapping còn fallback message.contains("task_assignments"). Nên nâng cấp sang duyệt SQLException chain, mã lỗi 23505 và tên constraint cụ thể trong refactor riêng; không phải lỗi chặn.
- Deferred gaps cũ:
  - TEMPORARY_PASSWORD_FLOW_GAP: Admin tạo User với trạng thái PENDING và mật khẩu tạm thời hash BCrypt. Luồng kích hoạt, cấp token và endpoint thiết lập mật khẩu lần đầu chưa có trong canonical docs, tiếp tục hoãn.
  - TEAM_API_CONTRACT_GAP: Team và Team Member domain/repository/service đã hoàn thành nhưng chưa có REST controller vì 06_API_CONTRACT.md chưa định nghĩa endpoints.
  - DASHBOARD_AGGREGATED_API_GAP: API GET /api/v1/dashboard/me có trong hợp đồng nhưng chưa có backend controller.
  - PUT_ME_PASSWORD_TEST_GAP: Test coverage cho luồng đổi mật khẩu người dùng hiện tại tiếp tục hoãn.

## Next Permitted Phase

- **Giai đoạn 8: File Module** (theo đúng docs/08_DEVELOPMENT_ROADMAP.md Section 12, P0 - Nền tảng bắt buộc cho Attachment).
- Phải bắt đầu bằng nhiệm vụ khảo sát phạm vi (Audit/Plan) của Giai đoạn 8 trước khi viết mã nguồn.
- Không bắt đầu triển khai React Native / mobile source trong giai đoạn này.

## Trust Rules

- Verify this file against Git at the start of every session.
- Git history and build/test outputs override stale content in this file.
- Update this file only after validation evidence exists.
- Never mark a phase completed based only on model statements.

## Recent Git Log

daa69a1 (HEAD -> main, origin/main, origin/HEAD) docs(ops): add V012 preflight and Java 21 validation
e2622d2 fix(task): harden assignment and task invariants
d548dcb docs(agent): codify proactive execution scope and autonomy principles
cd3a201 docs(agent): authorize managed tool installation
abefa44 feat(task): implement task management module
