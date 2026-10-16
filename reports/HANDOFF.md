# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- Current Task: CHỐT CONTRACT VÀ KIỂM TOÁN CUỐI HARDENING PHASE 10
- Latest Validated Phase 10 Implementation: `af165119efa9d2ed7c062a53eb10da2df757bc1a` (kèm final alignment commit sắp tới)
- Phase 10 Implementation Base: `41b7a175394d41c8f39ff41615121f0f42a7a823`
- Operational Documentation Checkpoint: reports/DECISIONS.md (D-046, D-047, D-048), reports/PHASE_10_REPORT.md, reports/PROJECT_STATE.md
- Phase 10 Status: COMPLETED, AUDITED, HARDENED, CONCURRENCY AND TRANSACTION VALIDATED
- Working tree: clean (sau khi commit)
- Build status: BUILD SUCCESS (Maven 3.9.16, Spring Boot 4.1.1, Java target 21, Checkstyle 0 violations)
- Test status:
  - Host Suite (Oracle JDK 27, Testcontainers PostgreSQL): 260/260 PASS (0 failures, 0 errors, 0 skipped)
  - Regression Suite (Phase 0 - Phase 9): 206/210 PASS
  - Phase 10 Asset Tests: 50/50 PASS across 6 test classes:
    - `V016MigrationTest`: 8/8 PASS
    - `AssetCategoryMockMvcTest`: 9/9 PASS
    - `AssetCoreMockMvcTest`: 13/13 PASS
    - `AssetAssignmentAndConcurrencyMockMvcTest`: 10/10 PASS
    - `AssetRepairHistoryMockMvcTest`: 8/8 PASS
    - `AssetServiceRequestIntegrationMockMvcTest`: 6/6 PASS

## Phase 10 Asset Management Module: COMPLETED & HARDENED

- **Asset Category**:
  - Authenticated active categories list (`GET /api/v1/asset-categories`), admin pagination.
  - Code normalization: client-input, trim, uppercase, regex `^[A-Z0-9_]{2,50}$`.
  - In-use protection: cannot deactivate category if active AVAILABLE or RETIRED assets are linked (`ASSET_CATEGORY_IN_USE`, HTTP 400).
  - Optimistic locking (`@Version`) verified (`OPTIMISTIC_LOCK_CONFLICT`, HTTP 409).
- **Asset Core**:
  - Asset lifecycle: initial status `AVAILABLE`, code regex `^[A-Z0-9][A-Z0-9_-]{1,49}$`.
  - Validated transitions: `AVAILABLE -> ASSIGNED`, `ASSIGNED -> AVAILABLE/MAINTENANCE/BROKEN/RETIRED`, `MAINTENANCE -> AVAILABLE/BROKEN/RETIRED`, `BROKEN -> AVAILABLE/MAINTENANCE/RETIRED`, terminal `RETIRED`.
  - Duplicate asset code mapped to HTTP 409 `ASSET_CODE_ALREADY_EXISTS`.
  - Duplicate serial number mapped to HTTP 409 `ASSET_SERIAL_ALREADY_EXISTS`.
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
  - Non-admin (EMPLOYEE, etc.) restricted to actively assigned assets (`assigned_to = principal.userId` and assignment `status = 'ACTIVE'`).
  - `/api/v1/assets/my-assets` strictly locked to caller principal.
- **Related Service Requests Projection**:
  - Detail response includes non-deleted related Service Requests matching Phase 9 authorization: caller sees request if caller is Admin, or requester, or has active `ServiceAssignment` (`is_active = true`). Soft-deleted requests excluded. Exact IDs and request numbers asserted.
- **Repair History**:
  - Immutable historical audit log (POST only; PUT and DELETE return 405 Method Not Allowed).
  - Optional `cost`: `cost` can be null or $\ge 0$ (`NUMERIC(18,2) NULL`).
  - Optional `serviceRequestId` reference-only linkage; rejected if deleted or points to another asset.
  - Independent lifecycle: adding repair history does not automatically change Asset status or Service Request status.
- **V016 Migration & Invariants**:
  - 8 migration tests in `V016MigrationTest`: clean migration V001-V016, active assignment uniqueness constraint, category code normalization, asset code normalization, index verifications (`idx_asset_assignments_assigned_to`, `idx_asset_assignments_asset_id`, `uk_asset_assignments_one_active`, `uk_asset_categories_code`), and preflight duplicate rejection with rollback preserving data integrity.

## Deferred Items & Known Gaps

- `ASSET_ASSIGNMENT_LOST_DAMAGED_WORKFLOW_DEFERRED`: Schema enum `AssetAssignmentStatus` contains `ACTIVE`, `RETURNED`, `LOST`, `DAMAGED`. Canonical contract `docs/06_API_CONTRACT.md` mục 14.7 đã chuẩn hóa: vòng đời Phase 10 hỗ trợ là `ACTIVE -> RETURNED`; `LOST` và `DAMAGED` là schema-reserved values không mở qua API Phase 10. Quy trình xử lý phân công thất thoát/hư hỏng hoãn lại rõ ràng, không còn unresolved contract gap.
- `NOTIFICATION_SIDE_EFFECT_DEFERRED`: Phase 10 không triển khai Notification Module; không email, push notification hoặc WebSocket.
- `SERVICE_REQUEST_SLA_DEFERRED`: Không có SLA engine, không tính business hours, không escalation, không pause/resume SLA.
- `SERVICE_ATTACHMENT_COMMENT_LINK_GAP`: Bảng `service_attachments` chỉ liên kết với `request_id`.
- `FILE_ORPHAN_RECONCILIATION_GAP`: Cần worker hoặc operational process reconciliation định kỳ.
- Technical Debt mức Low:
  - `TASK_FLYWAY_CONFIGURATION_MODULE_LOCATION_LOW`: TaskFlywayConfiguration hiện ở task.infrastructure.
  - `DATA_INTEGRITY_ERROR_MAPPING_FALLBACK_LOW`: Cải tiến trích xuất constraint driver cho task_assignments tương tự Asset module.

## Next Permitted Phase

- **Giai đoạn 11: Notification Module** (hoặc Audit / Checkpoint trước khi bắt đầu Phase 11).
- Không bắt đầu triển khai Phase 11 trong phiên hiện tại.
- Không bắt đầu triển khai React Native / mobile source trong giai đoạn này.

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
