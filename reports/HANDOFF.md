# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- HEAD: abefa44b0d6ec00a28798b74b17b7ecbbb726168
- origin/main: abefa44b0d6ec00a28798b74b17b7ecbbb726168
- Last completed implementation commit:
  abefa44b0d6ec00a28798b74b17b7ecbbb726168 (feat(task): implement task management module)
- Working tree: clean
- Build status: BUILD SUCCESS (Maven 3.9.16, Java target 21, Checkstyle 0 violations)
- Test status: 90/90 PASS (59 regression tests + 31 Phase 7 tests) trên PostgreSQL Testcontainers

## Environment & Tool Registry

- Hồ sơ công cụ và môi trường: `reports/ENVIRONMENT_TOOL_REGISTRY.md`
- Quyền cài đặt công cụ có kiểm soát (Managed Tool Installation): Đã được phê duyệt với các nguyên tắc an toàn tại AGENTS.md, DECISIONS.md (D-019, D-020).
- Kênh ưu tiên: winget chính thức, verified publisher, license tương thích, dữ liệu lớn ưu tiên lưu trữ tại ổ D:.
- Safeguards: Bắt buộc dừng và thông báo `BLOCKED_FOR_USER_ACTION` khi gặp UAC, đăng nhập tài khoản, thanh toán hoặc điều khoản pháp lý.

## Phase 7 Status & Audit Findings

Phase 7 đã triển khai và hoàn thành audit độc lập, nhưng **chưa được đánh dấu hoàn tất** do tồn tại các findings sau:

- **HIGH**:
  - `TASK_ASSIGNMENT_CONCURRENCY_RISK`: Bảng `task_assignments` thiếu database unique constraint hoặc partial unique index cho `(task_id, assignee_id) WHERE is_active = true`. Uniqueness chỉ được bảo vệ qua exists-check ở application service.
- **MEDIUM**:
  - `TASK_HIERARCHY_DEPTH_POLICY_GAP`: Giới hạn duyệt cây tổ tiên 50 cấp ném `TASK_PARENT_CYCLE_DETECTED`, gán nhầm độ sâu phân cấp thành chu trình dù không có vòng lặp.
  - `TASK_STATUS_HISTORY_ROLLBACK_TEST_GAP`: `@Transactional` trên `changeStatus` chưa có integration test xác minh Task status được rollback khi insert Status History gặp lỗi trên PostgreSQL thật.
  - `TASK_DELETE_RULE_AMBIGUITY`: `TASK_CANNOT_DELETE_HAS_HISTORY` chặn xóa mềm task ngay sau transition đầu tiên; chưa định nghĩa rõ phạm vi "lịch sử nghiệp vụ quan trọng" và chưa xử lý subtask dangling khi xóa cha.
  - `TASK_COMMENT_AUTHORIZATION_DEVIATION`: Logic cho phép `PROJECT_MANAGER` sửa/xóa comment của người khác, trong khi canonical doc quy định tác giả hoặc quản trị viên (System Admin).

## Deferred / Known Gaps

- `TEMPORARY_PASSWORD_FLOW_GAP`: User creation in `PENDING` status with hashed temporary password. Luồng kích hoạt và endpoint thiết lập mật khẩu lần đầu tiếp tục hoãn.
- `TEAM_API_CONTRACT_GAP`: Team REST controllers hoãn vì `06_API_CONTRACT.md` chưa định nghĩa endpoints.
- `DASHBOARD_AGGREGATED_API_GAP`: API `GET /api/v1/dashboard/me` chưa có backend controller.
- `TASK_ATTACHMENT_DEFERRED_UNTIL_PHASE_08`: File attachment cho Task hoãn đến Phase 8 (File Module).

## Next Permitted Task

- **Phase 7 patch planning (Kế hoạch vá lỗi và xử lý findings Phase 7)**.
- Không đóng Phase 7 khi chưa có kế hoạch xử lý findings.
- Không bắt đầu Phase 8 (File Module).
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
9. Read the relevant canonical document sections.
10. Identify the exact scoped task (Phase 7 patch planning).
11. Do not start another roadmap phase without explicit scope.

## Model Switch Procedure

When FCM switches model:

- Continue within the same OpenCode session where possible.
- Recheck current tool output.
- Recheck git status before writing.
- Do not repeat completed commands unnecessarily.
- If state is unclear, stop writing and produce a checkpoint report.
