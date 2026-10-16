# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- Current Task: KIỂM TOÁN VÀ LÀM CỨNG QUYẾT ĐỊNH PHASE 11 TRƯỚC IMPLEMENTATION
- Base Phase 10 Implementation: `46b3b5ca7023f4b1c5e4633def1f0f8e16816602`
- First Hardening Commit: `af165119efa9d2ed7c062a53eb10da2df757bc1a`
- Latest Validated Phase 10 Implementation: `cd9c972cb18c0158807c47a260e21ddfca019427`
- Phase 11 Design Finalization Checkpoint: `12100a9292da398a00b4a71837615a20757650ca`
- Operational Documentation Checkpoint: reports/DECISIONS.md (D-046, D-047, D-048, D-049, D-050), reports/PHASE_10_REPORT.md, reports/PROJECT_STATE.md, reports/HANDOFF.md, reports/runbooks/V017_NOTIFICATION_IDEMPOTENCY_PLAN.md
- Phase 10 Status: COMPLETED, AUDITED, HARDENED, AUTHORIZATION, CONCURRENCY AND TRANSACTION VALIDATED
- Phase 11 Design Status: FINALIZED AND HARDENED (Decisions D-049, D-050)
- Working tree: clean (sau khi commit)
- Build status: BUILD SUCCESS (Maven 3.9.16, Spring Boot 4.1.1, Java target 21, Checkstyle 0 violations)
- Test status:
  - Host Suite (Oracle JDK 27, Testcontainers PostgreSQL): 260/260 PASS (0 failures, 0 errors, 0 skipped)
  - Regression Suite (Phase 0 - Phase 9): 206/210 PASS
  - Phase 10 Asset Tests: 50/50 PASS across 6 test classes (run twice consecutively, 0 flakiness):
    - `V016MigrationTest`: 8/8 PASS
    - `AssetCategoryMockMvcTest`: 9/9 PASS
    - `AssetCoreMockMvcTest`: 13/13 PASS
    - `AssetAssignmentAndConcurrencyMockMvcTest`: 10/10 PASS
    - `AssetRepairHistoryMockMvcTest`: 8/8 PASS
    - `AssetServiceRequestIntegrationMockMvcTest`: 6/6 PASS

## Phase 10 Asset Management Module: COMPLETED & HARDENED

- **Asset Category**:
  - Authenticated active categories list (`GET /api/v1/asset-categories` - requires authentication, returns 401 if unauthorized; strictly not public), admin pagination (`GET /api/v1/admin/asset-categories`).
  - Code normalization: client-input, trim, uppercase, regex `^[A-Z0-9_]{2,50}$`, immutable after creation, permanent global uniqueness.
  - In-use protection: cannot deactivate category if active AVAILABLE or RETIRED assets are linked (`ASSET_CATEGORY_IN_USE`, HTTP 400).
  - Optimistic locking (`@Version`) verified (`OPTIMISTIC_LOCK_CONFLICT`, HTTP 409).
- **Asset Core**:
  - Asset lifecycle: initial status strictly `AVAILABLE`, code regex `^[A-Z0-9][A-Z0-9_-]{1,49}$`, immutable after creation.
  - Validated transitions: `AVAILABLE -> ASSIGNED`, `ASSIGNED -> AVAILABLE/MAINTENANCE/BROKEN/RETIRED`, `MAINTENANCE -> AVAILABLE/BROKEN/RETIRED`, `BROKEN -> AVAILABLE/MAINTENANCE/RETIRED`, terminal `RETIRED`.
  - Duplicate asset code mapped to HTTP 409 `ASSET_CODE_ALREADY_EXISTS`.
  - Duplicate serial number mapped to HTTP 409 `ASSET_SERIAL_ALREADY_EXISTS`.
  - Soft-delete filtering (`is_deleted = false`), optimistic locking (`@Version`), audit principal and Clock.
- **Assignment & Concurrency**:
  - Single active assignment invariant guarded by pessimistic write lock + V016 partial unique index `uk_asset_assignments_one_active`.
  - Reassignment directly is forbidden; asset must be returned before new assignment.
  - Concurrency validated: 5 rounds x 2 concurrent workers on PostgreSQL Testcontainers; exactly 1 winner (201 Created), loser strictly canonical 400 (`ASSET_NOT_AVAILABLE` / `ASSET_ALREADY_ASSIGNED`) or 409 (`ASSET_ASSIGNMENT_CONFLICT`), zero 500s.
  - Driver-level constraint extraction: PSQLException server error message constraint extracted via reflection for `uk_asset_assignments_one_active`, `uk_assets_asset_code`, and `uk_assets_serial_number`.
- **Return & Transaction Rollback**:
  - `PUT /api/v1/assets/{assetId}/assignments/{assignmentId}/return` requires `resultingAssetStatus` (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`).
  - Resulting status `ASSIGNED` rejected (HTTP 400).
  - Transaction atomicity & rollback verified on PostgreSQL via BEFORE UPDATE trigger failure injection on target asset row; asset remains ASSIGNED, assignment remains ACTIVE, versions unchanged, returnedAt remains null. Response on error is verified safe (no leak of SQL, trigger, or stack trace).
- **Read Scoping & Security**:
  - System Admin has global asset visibility.
  - Non-admin (EMPLOYEE, TEAM_LEADER, PROJECT_MANAGER) restricted to actively assigned assets (`assigned_to = principal.userId` and assignment `status = 'ACTIVE'`).
  - `/api/v1/assets/my-assets` strictly locked to caller principal; unauthorized detail access returns `ASSET_ACCESS_DENIED` (HTTP 403).
- **Related Service Requests Projection**:
  - Detail response includes non-deleted related Service Requests matching Phase 9 authorization: caller sees request if caller is Admin, or requester, or has active `ServiceAssignment` (`is_active = true`). Soft-deleted requests excluded. Exact IDs and request numbers asserted.
- **Repair History**:
  - Immutable historical audit log (POST and GET only; PUT and DELETE return 405 Method Not Allowed).
  - Optional `cost`: `cost` can be null or $\ge 0$ (`NUMERIC(18,2) NULL`).
  - Optional `serviceRequestId` reference-only linkage; rejected if deleted or points to another asset.
  - Independent lifecycle: adding repair history does not automatically change Asset status or Service Request status.
- **V016 Migration & Invariants**:
  - 8 migration tests in `V016MigrationTest`: clean migration V001-V016, active assignment uniqueness constraint, category code normalization, asset code normalization, index verifications (`idx_asset_assignments_assigned_to`, `idx_asset_assignments_asset_id`, `uk_asset_assignments_one_active`, `uk_asset_categories_code`), and preflight duplicate rejection with rollback preserving data integrity.

## Deferred Items & Known Gaps

- `ASSET_ASSIGNMENT_LOST_DAMAGED_WORKFLOW_DEFERRED`: Schema enum `AssetAssignmentStatus` contains `ACTIVE`, `RETURNED`, `LOST`, `DAMAGED`. Canonical contract `docs/06_API_CONTRACT.md` mục 14.7 đã chuẩn hóa: vòng đời Phase 10 hỗ trợ là `ACTIVE -> RETURNED`; `LOST` và `DAMAGED` là schema-reserved values không mở qua API Phase 10. Quy trình xử lý phân công thất thoát/hư hỏng hoãn lại rõ ràng, không còn unresolved contract gap.
- `NOTIFICATION_SIDE_EFFECT_DEFERRED`: Phase 9/10 không triển khai Notification Module; không email, push notification hoặc WebSocket. Hoãn đến phase canonical tiếp theo nếu Roadmap quy định.
- `ASSET_ATTACHMENT_DEFERRED`: Chưa có liên kết tài liệu/hình ảnh đính kèm cho tài sản; chưa có `ASSET_ATTACHMENT` trong `FilePurpose`.
- `ASSET_BARCODE_QR_DEFERRED`: Chưa triển khai sinh Barcode hoặc mã QR cho tài sản ở backend.
- `ASSET_DEPRECIATION_DEFERRED`: Chưa triển khai công cụ khấu hao hoặc kế toán tài sản.
- `POSTGRES_CONSTRAINT_METADATA_REFLECTION_LOW`: Trích xuất tên ràng buộc CSDL qua reflection do dependency driver PostgreSQL nằm ở scope runtime; fallback qua chuỗi message an toàn, không phải blocker.
- `SERVICE_REQUEST_SLA_DEFERRED`: Không có SLA engine, không tính business hours, không escalation, không pause/resume SLA.
- `SERVICE_ATTACHMENT_COMMENT_LINK_GAP`: Bảng `service_attachments` chỉ liên kết với `request_id`.
- `FILE_ORPHAN_RECONCILIATION_GAP`: Cần worker hoặc operational process reconciliation định kỳ.
- `FILE_STORAGE_TOCTOU_LOW`: Existing symlink escape đã được chặn và kiểm thử thành công trên Linux container. Môi trường production phải bảo vệ storage root bằng phân quyền hệ điều hành phù hợp.
- `FILE_VIRUS_SCANNING_DEFERRED`: ClamAV daemon hoãn đến môi trường production; kiểm tra in-flight qua magic bytes và ZIP entry inspection.
- `CLOUD_STORAGE_PROVIDER_DEFERRED`: Production provider chưa được chọn. Local filesystem là provider Development/Test.
- `TASK_DETAIL_ATTACHMENT_ITEMS_API_GAP`: Canonical API định nghĩa `attachmentCount`; schema chi tiết cho danh sách attachment items trong Task Detail chưa được định nghĩa.
- `TASK_DELETE_RULE_AMBIGUITY_DEFERRED`: Định nghĩa “Business history quan trọng” chưa đầy đủ trong canonical docs; giữ logic xét status history.
- `TASK_FLYWAY_CONFIGURATION_MODULE_LOCATION_LOW`: TaskFlywayConfiguration hiện ở task.infrastructure. Có thể chuyển sang shared.infrastructure trong đợt refactor riêng.
- `DATA_INTEGRITY_ERROR_MAPPING_FALLBACK_LOW`: Exception mapping cho task_assignments có thể nâng cấp sang trích xuất constraint PostgreSQL driver tương tự Asset module.
- `TEMPORARY_PASSWORD_FLOW_GAP`: Luồng kích hoạt và endpoint thiết lập mật khẩu lần đầu tiếp tục hoãn.
- `TEAM_API_CONTRACT_GAP`: Team REST controllers hoãn vì `06_API_CONTRACT.md` chưa định nghĩa endpoints.
- `NOTIFICATION_RETENTION_CLEANUP_DEFERRED`: Phase 11 retains read notifications; auto-delete/cleanup scheduler deferred.
- `PROJECT_DASHBOARD_PROJECTION_DEFERRED`: Project Dashboard GET /projects/{projectId}/dashboard deferred.
- `SERVICE_REQUEST_INTERNAL_NOTE_NOTIFICATION_DEFERRED`: Internal note notification deferred.
- `PUT_ME_PASSWORD_TEST_GAP`: Test coverage cho luồng đổi mật khẩu người dùng hiện tại tiếp tục hoãn.

## Next Permitted Phase

- **Giai đoạn 12: Báo cáo, Thống kê và Xuất dữ liệu** (theo đúng `docs/08_DEVELOPMENT_ROADMAP.md` Section 16, P1).
- Phase 11 (Notification và Personal Dashboard) đã hoàn thành, kiểm thử 290/290 PASS, Checkstyle 0 violations.
- Không tự ý triển khai Phase 12 nếu task chưa yêu cầu.
- Không triển khai React Native / mobile source trong giai đoạn này.

## New Session Procedure

1. Read AGENTS.md.
2. Read reports/PROJECT_STATE.md.
3. Read reports/DECISIONS.md.
4. Read reports/HANDOFF.md.
5. Read reports/ENVIRONMENT_TOOL_REGISTRY.md.
6. Run git status --short.
7. Run git log --oneline --decorate -5.
8. Compare HEAD with origin/main.
9. Read the relevant canonical document sections for Phase 11 when scoped.
10. Do not start another roadmap phase without explicit scope.

## Model Switch Procedure

When FCM switches model:

- Continue within the same OpenCode session where possible.
- Recheck current tool output.
- Recheck git status before writing.
- Do not repeat completed commands unnecessarily.
- If state is unclear, stop writing and produce a checkpoint report.
