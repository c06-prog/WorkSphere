# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- Current Checkpoint HEAD: daa69a102b2f77ecc70eb2b7b08614c302ab5e03
- origin/main: daa69a102b2f77ecc70eb2b7b08614c302ab5e03
- Latest validated implementation: e2622d263ae04358bfb6f9f1617036a6aa478249 (fix(task): harden assignment and task invariants)
- Implementation Base: abefa44b0d6ec00a28798b74b17b7ecbbb726168 (feat(task): implement task management module)
- Operational Documentation Checkpoint: daa69a102b2f77ecc70eb2b7b08614c302ab5e03 (docs(ops): add V012 preflight and Java 21 validation)
- Working tree: clean
- Build status: BUILD SUCCESS (Maven 3.9.16, Java target 21, Checkstyle 0 violations)
- Test status:
  - Host Suite (Oracle JDK 27, Testcontainers PostgreSQL): 100/100 PASS
  - Container Suite (Docker eclipse-temurin:21-jdk): Compile PASS, Checkstyle 0 violations, Unit tests 16/16 PASS, H2 context 1/1 PASS

## Phase 7 Status: COMPLETED

Phase 7 (Task Management Module) đã hoàn tất toàn diện, được kiểm toán độc lập, vá lỗi bất biến và kiểm chuẩn vận hành:

- **Task Core**: Vòng đời trạng thái, ma trận chuyển trạng thái hợp lệ, tính toán tiến độ, thời hạn, và optimistic locking đã được xác minh.
- **Subtask Hierarchy**: Phân cấp công việc con, thuật toán phát hiện chu trình bằng `Set<UUID> visited` (đã kiểm thử chuỗi 52 cấp thành công không lỗi recursion) đã được xác minh.
- **Task Assignment**: Phân công và gỡ phân công được chốt chặn an toàn với partial unique index PostgreSQL `uk_task_assignments_active` (migration `V012`). Kiểm thử đồng thời 4 luồng cạnh tranh 5 lần liên tiếp xác nhận đúng 1 bản ghi active được commit.
- **Status History**: Ghi nhận lịch sử trạng thái kèm người thay đổi và lý do; đã kiểm chứng tính nguyên tử và rollback giao dịch trên engine PostgreSQL thật khi có lỗi.
- **Task Comments**: Triển khai đầy đủ 4 endpoints phân quyền chặt chẽ (chỉ tác giả hoặc System Admin mới có quyền sửa/xóa; PM non-admin bị từ chối 422 FORBIDDEN; comment cha khác task hoặc soft-deleted bị từ chối 404).
- **V012 Operational Runbook**: Hoàn thành và theo dõi tại `reports/runbooks/V012_ACTIVE_TASK_ASSIGNMENT_UNIQUENESS.md` với quy trình Go/No-Go, query tiền kiểm và hướng dẫn xử lý dữ liệu trùng lặp fail-safe.

## Deferred / Known Gaps

- `TASK_DELETE_RULE_AMBIGUITY_DEFERRED`: Định nghĩa “Business history quan trọng” chưa đầy đủ trong canonical docs; giữ logic hiện tại xét status history (`TASK_CANNOT_DELETE_HAS_HISTORY`), cấm thay đổi ngầm trong các phase tiếp theo.
- `TASK_ATTACHMENT_DEFERRED_UNTIL_PHASE_08`: File attachment cho Task hoãn đến Phase 8 (File Module) theo quy tắc Roadmap.
- `TASK_FLYWAY_CONFIGURATION_MODULE_LOCATION_LOW`: TaskFlywayConfiguration hiện ở `task.infrastructure`, sẽ chuyển sang `shared.infrastructure` trong đợt refactor riêng.
- `DATA_INTEGRITY_ERROR_MAPPING_FALLBACK_LOW`: Cải tiến kiểm tra mã lỗi `23505` và so khớp tên constraint trong refactor sau.
- `TEMPORARY_PASSWORD_FLOW_GAP`: User creation in `PENDING` status with hashed temporary password. Luồng kích hoạt và endpoint thiết lập mật khẩu lần đầu tiếp tục hoãn.
- `TEAM_API_CONTRACT_GAP`: Team REST controllers hoãn vì `06_API_CONTRACT.md` chưa định nghĩa endpoints.
- `DASHBOARD_AGGREGATED_API_GAP`: API `GET /api/v1/dashboard/me` chưa có backend controller.
- `PUT_ME_PASSWORD_TEST_GAP`: Test coverage cho luồng đổi mật khẩu người dùng hiện tại tiếp tục hoãn.

## Next Permitted Phase

- **Giai đoạn 8: File Module** (theo đúng `docs/08_DEVELOPMENT_ROADMAP.md` Section 12, P0 - Nền tảng bắt buộc cho Attachment).
- Phải bắt đầu bằng nhiệm vụ khảo sát phạm vi (Audit/Plan) của Giai đoạn 8 trước khi viết mã nguồn.
- Không bắt đầu Phase 8 trong nhiệm vụ này.
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
9. Read the relevant canonical document sections for Phase 8 (docs/08_DEVELOPMENT_ROADMAP.md Section 12, docs/05_DATABASE_DESIGN.md Section 7, docs/06_API_CONTRACT.md Section 11).
10. Identify the exact scoped task (Khảo sát phạm vi Phase 8: File Module).
11. Do not start another roadmap phase without explicit scope.

## Model Switch Procedure

When FCM switches model:

- Continue within the same OpenCode session where possible.
- Recheck current tool output.
- Recheck git status before writing.
- Do not repeat completed commands unnecessarily.
- If state is unclear, stop writing and produce a checkpoint report.
