# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- Current Checkpoint: `41c648adee102ed8adbc796abe10308e608c68eb`
- Latest Validated Implementation: `ed2599d7f34644a7b03a29ffdb607b52d427e68f` (`fix(file): verify symlink and archive resource safety`)
- Hardening Checkpoint: `3a8cdde8deeb447af97149b1d3885814897203e5` (`fix(file): harden storage security, zip bomb defense, and download authorization`)
- Base Implementation: `6a72c01d8f6f6d9684d24d2699b6742c2a513e78` (`feat(file): implement secure file storage module`)
- Operational Documentation Checkpoint: reports/PHASE_08_REPORT.md
- Working tree: clean
- Build status: BUILD SUCCESS (Maven 3.9.16, Java target 21, Checkstyle 0 violations)
- Test status:
  - Host Suite (Oracle JDK 27, Testcontainers PostgreSQL): 170/170 PASS
  - Container Suite (Docker eclipse-temurin:21-jdk): 33/33 PASS (Compile PASS, Checkstyle 0 violations, `LocalFileSystemStorageTest` 8/8 PASS, `FileValidationServiceTest` 25/25 PASS)
  - Real Symlink Validation: PASS (`TESTED_ON_LINUX_CONTAINER`) for store, load, and delete traversal attacks
  - ZIP Bomb / Archive Safety Validation: PASS for entry count, declared size/ratio, actual live streaming expansion, and path traversal variants

## Phase 8 Status: COMPLETED, AUDITED, HARDENED, SECURITY VALIDATED

Phase 8 (File Module & Task Attachment Integration) đã hoàn tất toàn diện, được kiểm toán, làm cứng bảo mật và kiểm thử độc lập thành công:

- **Core File Module**: StoredFile domain entity, vòng đời trạng thái (`ACTIVE`, `QUARANTINED`, `DELETED`), mục đích sử dụng (`FilePurpose`); `FileStorageService` abstraction; `LocalFileSystemStorageService` với Java NIO, atomic move, thư mục tạm `.tmp/`, chống ghi đè tệp đích, và cơ chế phòng vệ symlink escape.
- **Security & Validation**: Chuẩn hóa tên tệp an toàn (`FilenameSanitizer`, RFC 5987 UTF-8 `Content-Disposition`, loại bỏ null bytes và CRLF), giới hạn dung lượng (ảnh $\le$ 10MB, tài liệu $\le$ 20MB), xác thực chữ ký nhị phân magic bytes (JPEG/PNG/WEBP/PDF), kiểm tra cấu trúc ZIP trong bộ nhớ cho DOCX (`word/`) và XLSX (`xl/`) chống Zip bomb đa tầng (giới hạn 200 entries, 50MB uncompressed/entry, 100MB tổng uncompressed, compression ratio $\le$ 100 qua `CountingInputStream`, chặn tuyệt đối traversal `..`, `\`, `/`, `C:`).
- **Endpoints & Lifecycle**: `POST /api/v1/files` (201 Created), `GET /api/v1/files/{fileId}/download` (streaming `Resource`, `X-Content-Type-Options: nosniff`, phân quyền truy cập chặt chẽ), `DELETE /api/v1/files/{fileId}` (soft-delete retention, chặn xóa tệp đã gắn kết với mã lỗi 422 `FILE_ALREADY_LINKED`). Cơ chế compensating cleanup tự động xóa tệp vật lý nếu metadata DB ghi thất bại, bảo toàn nguyên vẹn exception nghiệp vụ gốc.
- **Task Attachment Integration**: `TaskAttachment` entity và repository, liên kết tệp đính kèm nguyên tử trong cùng transaction lưu trữ bình luận công việc (`attachmentFileIds`), tổng hợp `attachmentCount` cho Task Detail và Task List thông qua batch query tránh triệt để N+1 query.
- **IDE Extension Authorization**: Quyền phát hiện, cài đặt và tự động hóa extension trong Antigravity IDE được kích hoạt (D-033, D-034, kiểm kê 10 extension suite tại `C:\Users\dienm\.antigravity-ide\extensions`, PostgreSQL là canonical/mặc định, mssql được phép dùng khi task cụ thể yêu cầu).
- **Service Request Module & Authorization Audit**: Đã hoàn tất audit và chốt các quyết định thiết kế tiền triển khai (D-035 đến D-041), báo cáo chi tiết tại `reports/ROLE_PERMISSION_AUDIT.md`:
  - `ROLE_PERMISSION_SEED_GAP_CONFIRMED`: Clean database audit xác nhận `role_permissions` có 0 dòng sau migration `V001`-`V012`.
  - `TEST_AUTHORITY_FIXTURE_MASKS_SEED_GAP`: Toàn bộ các test suite hiện tại che giấu việc thiếu seed production bằng cách tự chạy `INSERT INTO role_permissions` trong `@BeforeEach`.
  - `ROLE_PERMISSION_CANONICAL_MATRIX_GAP`: Thiếu ma trận chính thức gán quyền 4 roles × 29 permissions trong canonical docs.
  - `SERVICE_AUTHORIZATION_MAPPING_GAP`: Quyền `SERVICE_REQUEST_ASSIGN` được yêu cầu bởi endpoint nhưng chưa được gán cho role nào trong canonical docs.
  - Bắt buộc bảo vệ cardinality 0..1 active assignee bằng database invariant: partial unique index `uk_service_assignments_one_active` trên `service_assignments(request_id) WHERE is_active = TRUE;` thông qua migration `V013__add_service_request_assignment_invariants.sql` (tách riêng với `V014` seed phân quyền).
  - Ban hành Runbook preflight kiểm tra vi phạm dữ liệu tại `reports/runbooks/V013_SERVICE_ASSIGNMENT_UNIQUENESS_PLAN.md`.
  - Chốt row khóa phối hợp: Khóa bản ghi `ServiceRequest` (`findByIdForUpdate` với `PESSIMISTIC_WRITE` và timeout 5000ms), tuân thủ thứ tự khóa (lock `ServiceRequest` trước), tuyệt đối không giữ lock trong File I/O hoặc network call.
  - Quy chuẩn giao thức transaction phân công lại: lock request, kiểm tra idempotent nếu trùng assignee, deactivate bản ghi cũ (`is_active = FALSE`, `unassigned_at = server Clock time`), flush, tạo bản ghi mới với `assigned_by` từ principal.
  - Xử lý ngoại lệ chính xác: duyệt `SQLException` cause chain, kiểm tra SQLState `23505` và tên constraint `uk_service_assignments_one_active`. Đề xuất mã lỗi `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409 Conflict), ghi nhận `CANONICAL_PATCH_REQUIRED` và `SERVICE_ASSIGNMENT_ERROR_CODE_GAP` theo governance.
  - Chốt PostgreSQL Two-Key Advisory Lock `(1301, year)` kết hợp `SUBSTRING FROM 9` đã kiểm chứng thực tế trên PostgreSQL 15, non-gapless nature, và timeout fallback về infrastructure mapping.
  - Xác minh toàn diện mã lỗi danh mục: tất cả mã lỗi danh mục đều có sẵn trong canonical Section 20.6 (`SERVICE_CATEGORY_*`), không có gap mã lỗi category.
  - Làm rõ ngữ nghĩa projection: `createdAt` trong `ServiceAttachmentResponse` là `service_attachments.created_at`.
- **Mobile Module**: Chưa bắt đầu (Zero mobile code).

## Deferred / Known Gaps

- `ROLE_PERMISSION_SEED_GAP_CONFIRMED`: Bảng `role_permissions` có 0 dòng sau khi chạy clean migrations `V001`-`V012` trên PostgreSQL sạch. Mọi endpoint `@PreAuthorize("hasAuthority(...)")` sẽ trả về HTTP 403 Forbidden trên production.
- `TEST_AUTHORITY_FIXTURE_MASKS_SEED_GAP`: Toàn bộ các test suite hiện tại che giấu việc thiếu seed production bằng cách tự chèn quyền vào `role_permissions` trong `@BeforeEach`.
- `ROLE_PERMISSION_CANONICAL_MATRIX_GAP`: Tài liệu canonical hiện chưa có ma trận ánh xạ chính thức gán 29 permissions cho 4 System Roles. Cần được Product Owner phê duyệt trước khi lập migration seed `V014`.
- `SERVICE_AUTHORIZATION_MAPPING_GAP`: Bảng liên kết `role_permissions` chưa được seed trong bất kỳ bản Flyway migration nào (`V001`-`V012`). Quyền `SERVICE_REQUEST_ASSIGN` được yêu cầu bởi endpoint nhưng chưa được gán cho bất kỳ vai trò nào trong canonical docs.
- `SERVICE_ASSIGNMENT_ERROR_CODE_GAP`: `docs/06_API_CONTRACT.md` Section 13 và Section 20.6 chưa định nghĩa mã lỗi nghiệp vụ cho trường hợp vi phạm phân công đồng thời. Đề xuất chuẩn thiết kế `SERVICE_ASSIGNMENT_CONFLICT` (HTTP 409 Conflict) đã lập tại D-036; yêu cầu vá canonical (`CANONICAL_PATCH_REQUIRED`) trước khi đưa vào production code.
- `SERVICE_ASSIGNMENT_CONCURRENCY_SCHEMA_GAP`: Quyết định ban đầu D-036 chỉ dựa vào Application Service check mà chưa có database constraint để bảo vệ active assignee cardinality 0..1 trước race condition. Đã giải quyết bằng kế hoạch migration V013 trong Phase 9 tạo partial unique index `uk_service_assignments_one_active` trên `service_assignments(request_id) WHERE is_active = TRUE;`.
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
