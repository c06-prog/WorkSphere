# WorkSphere Project State

## Git Checkpoint

- Branch: main
- HEAD: abefa44b0d6ec00a28798b74b17b7ecbbb726168
- origin/main: abefa44b0d6ec00a28798b74b17b7ecbbb726168
- Working tree at checkpoint: clean

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
- Docker: verified (Docker Desktop 4.94.0, Engine 29.8.2, jenkins-lts running, worksphere-dev-pg exited)
- Tool Installation Authorization: enabled with safeguards (D-019, D-020, allowlist, user action protection)
- Tool Registry: created at reports/ENVIRONMENT_TOOL_REGISTRY.md (23 core tools documented)
- Phase 7 Implementation: commit abefa44b0d6ec00a28798b74b17b7ecbbb726168 đã được triển khai và audit độc lập
- Phase 7 Audit Status: chưa được đóng vì còn các findings cần lập kế hoạch vá (patch planning)

## Audit Findings Phase 7 (Pending Resolution)

- HIGH:
  - `TASK_ASSIGNMENT_CONCURRENCY_RISK`: Bảng `task_assignments` thiếu database unique constraint hoặc partial unique index cho `(task_id, assignee_id) WHERE is_active = true`. Uniqueness chỉ được bảo vệ qua exists-check ở application service.
- MEDIUM:
  - `TASK_HIERARCHY_DEPTH_POLICY_GAP`: Giới hạn duyệt cây tổ tiên 50 cấp ném `TASK_PARENT_CYCLE_DETECTED`, gán nhầm độ sâu phân cấp thành chu trình dù không có vòng lặp.
  - `TASK_STATUS_HISTORY_ROLLBACK_TEST_GAP`: `@Transactional` trên `changeStatus` chưa có integration test xác minh Task status được rollback khi insert Status History gặp lỗi trên PostgreSQL thật.
  - `TASK_DELETE_RULE_AMBIGUITY`: `TASK_CANNOT_DELETE_HAS_HISTORY` chặn xóa mềm task ngay sau transition đầu tiên; chưa định nghĩa rõ phạm vi "lịch sử nghiệp vụ quan trọng" và chưa xử lý subtask dangling khi xóa cha.
  - `TASK_COMMENT_AUTHORIZATION_DEVIATION`: Logic cho phép `PROJECT_MANAGER` sửa/xóa comment của người khác, trong khi canonical doc quy định tác giả hoặc quản trị viên (System Admin).

## Latest Validated Implementation

- Commit:
  abefa44b0d6ec00a28798b74b17b7ecbbb726168

- Commit message:
  feat(task): implement task management module

## Latest Evidence

- Task Management Backend: 29 tracked files (Domain, Repositories, Services, Controller, DTOs, Tests, Report)
- Maven clean test: BUILD SUCCESS (exit code 0)
- Checkstyle: 0 violations
- Total tests: 90
- Passed: 90
- Failed: 0
- Errors: 0
- Skipped: 0
- Flaky / Rerun: 0
- PostgreSQL Testcontainers: PASS (Image: postgres:15-alpine)
- Canonical documents: unchanged (10/10 files preserved)
- Flyway V001 to V011: unchanged
- Migration V012: not created
- HEAD equals origin/main
- Working tree is clean

## Known Gaps

- TEMPORARY_PASSWORD_FLOW_GAP: Admin tạo User với trạng thái PENDING và mật khẩu tạm thời hash BCrypt. Luồng kích hoạt, cấp token và endpoint thiết lập mật khẩu lần đầu chưa có trong canonical docs, tiếp tục hoãn (deferred).
- TEAM_API_CONTRACT_GAP: Team và Team Member domain/repository/service đã hoàn thành nhưng chưa có REST controller vì 06_API_CONTRACT.md chưa định nghĩa endpoints.
- DASHBOARD_AGGREGATED_API_GAP: API GET /api/v1/dashboard/me có trong hợp đồng nhưng chưa có backend controller.
- TASK_ATTACHMENT_DEFERRED_UNTIL_PHASE_08: Đính kèm tệp cho Task chờ module File / `stored_files` ở Phase 8.

## Next Permitted Task

- **PHASE_07_PATCH_PLANNING**.
- Không đánh dấu Phase 7 hoàn tất khi chưa xử lý các audit findings.
- Không bắt đầu Phase 8 (File Module).
- Không bắt đầu triển khai React Native / mobile.

## Trust Rules

- Verify this file against Git at the start of every session.
- Git history and build/test outputs override stale content in this file.
- Update this file only after validation evidence exists.
- Never mark a phase completed based only on model statements.

## Recent Git Log

abefa44 (HEAD -> main, origin/main, origin/HEAD) feat(task): implement task management module
c9702ac docs(agent): checkpoint visual prototype
b58d5d8 feat(design): add interactive mobile prototype
94a8377 docs(agent): authorize mobile test runtime
e670233 docs(design): add mobile UI UX baseline
