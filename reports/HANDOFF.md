# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- Current Checkpoint HEAD: 6a72c01d8f6f6d9684d24d2699b6742c2a513e78
- origin/main: 6a72c01d8f6f6d9684d24d2699b6742c2a513e78
- Latest validated implementation: 6a72c01d8f6f6d9684d24d2699b6742c2a513e78 (feat(file): implement secure file storage module)
- Implementation Base: 6a72c01d8f6f6d9684d24d2699b6742c2a513e78 (feat(file): implement secure file storage module)
- Operational Documentation Checkpoint: reports/PHASE_08_REPORT.md
- Working tree: clean
- Build status: BUILD SUCCESS (Maven 3.9.16, Java target 21, Checkstyle 0 violations)
- Test status:
  - Host Suite (Oracle JDK 27, Testcontainers PostgreSQL): 152/152 PASS
  - Container Suite (Docker eclipse-temurin:21-jdk): Compile PASS, Checkstyle 0 violations, Unit tests 16/16 PASS, H2 context 1/1 PASS

## Phase 8 Status: COMPLETED

Phase 8 (File Module & Task Attachment Integration) đã hoàn tất toàn diện, được kiểm toán và kiểm thử đầy đủ:

- **Core File Module**: StoredFile entity, trạng thái, mục đích sử dụng (purpose); FileStorageService abstraction; LocalFileSystemStorageService với Java NIO, atomic move, thư mục tạm `.tmp/`, chống path traversal.
- **Security & Validation**: Chuẩn hóa tên file an toàn (FilenameSanitizer, RFC 5987 UTF-8 Content-Disposition), giới hạn dung lượng (ảnh 10MB, tài liệu 20MB), xác thực magic bytes (JPEG/PNG/WEBP/PDF), kiểm tra cấu trúc ZIP trong bộ nhớ cho DOCX/XLSX an toàn chống Zip bomb mà không giải nén ra đĩa.
- **Endpoints & Lifecycle**: `POST /api/v1/files` (201 Created), `GET /api/v1/files/{fileId}/download` (streaming Resource, nosniff, phân quyền uploader/Admin/Project Member), `DELETE /api/v1/files/{fileId}` (soft-delete retention, chặn xóa file đã gắn kết với mã lỗi 422). Cơ chế compensating cleanup tự động xóa file vật lý nếu metadata DB ghi thất bại.
- **Task Attachment Integration**: `TaskAttachment` entity và repository, liên kết tệp đính kèm nguyên tử trong bình luận công việc (`attachmentFileIds`), tổng hợp `attachmentCount` cho Task Detail và Task List thông qua batch query tránh triệt để N+1 query.
- **Web Runtime and Browser Automation Authorization**: Đã bổ sung chính sách D-026 và D-027 trong `reports/DECISIONS.md`, cấu hình Microsoft Edge và Edge WebDriver trong `reports/ENVIRONMENT_TOOL_REGISTRY.md`.

## Deferred / Known Gaps

- `TASK_DELETE_RULE_AMBIGUITY_DEFERRED`: Định nghĩa “Business history quan trọng” chưa đầy đủ trong canonical docs; giữ logic xét status history.
- `FILE_VIRUS_SCANNING_DEFERRED`: ClamAV daemon hoãn đến môi trường production; kiểm tra in-flight qua magic bytes và ZIP entry inspection.
- `FILE_CLOUD_STORAGE_DEFERRED`: Amazon S3 / MinIO hoãn đến production; LocalFileSystemStorageService đáp ứng dev/test.
- `FILE_PURGE_WORKER_DEFERRED`: Xóa vật lý các tệp đã xóa mềm hoãn đến khi có background scheduled purge job.
- `TASK_DETAIL_ATTACHMENT_LIST_API_GAP`: Task Detail trả về `attachmentCount` theo đúng canonical contract; danh sách chi tiết từng file trong Task Detail chưa có trong docs/06_API_CONTRACT.md.
- `TASK_FLYWAY_CONFIGURATION_MODULE_LOCATION_LOW`: TaskFlywayConfiguration hiện ở `task.infrastructure`.
- `DATA_INTEGRITY_ERROR_MAPPING_FALLBACK_LOW`: Cải tiến kiểm tra mã lỗi `23505` trong refactor sau.
- `TEMPORARY_PASSWORD_FLOW_GAP`: Luồng kích hoạt và endpoint thiết lập mật khẩu lần đầu tiếp tục hoãn.
- `TEAM_API_CONTRACT_GAP`: Team REST controllers hoãn vì `06_API_CONTRACT.md` chưa định nghĩa endpoints.
- `DASHBOARD_AGGREGATED_API_GAP`: API `GET /api/v1/dashboard/me` chưa có backend controller.
- `PUT_ME_PASSWORD_TEST_GAP`: Test coverage cho luồng đổi mật khẩu người dùng hiện tại tiếp tục hoãn.

## Next Permitted Phase

- **Giai đoạn 9: Service Request Module** (theo đúng `docs/08_DEVELOPMENT_ROADMAP.md` Section 13, P0).
- Phải bắt đầu bằng nhiệm vụ khảo sát phạm vi (Audit/Plan) của Giai đoạn 9 trước khi viết mã nguồn.
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
