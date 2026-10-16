# Phase 10 Implementation & Hardening Report - Asset Module

## 1. Executive Summary & Checkpoint

- **Initial Base Checkpoint**: `41b7a175394d41c8f39ff41615121f0f42a7a823` (`docs(design): finalize phase 10 asset policies`).
- **Implementation Checkpoint**: `46b3b5ca7023f4b1c5e4633def1f0f8e16816602` (`feat(asset): implement asset module`).
- **Hardening Scope**:
  - Assignment concurrency exact error & response assertions.
  - Return transaction failure-injection rollback verification on PostgreSQL.
  - Related Service Request authorization consistency with Phase 9 (requester OR active assignee).
  - PostgreSQL driver constraint-name extraction (`PSQLException.getServerErrorMessage().getConstraint()`).
  - Schema mapping consistency (NUMERIC precision/scale, `@Version` presence on entities vs database tables).
  - V016 migration test coverage expansion (clean migrate, preflight failure & rollback).
- **Completion Status**:
  - Checkstyle: **0 violations**.
  - Test Suite: **259/259 PASS** (210 regression tests + 49 Phase 10 tests).
  - PostgreSQL Testcontainers clean migration, invariants, preflight failure & rollback verified.
- **Phase Scope Boundary**:
  - Closed backend Asset Module scope completed.
  - Out of scope strictly deferred: Asset Attachment, Barcode/QR generation, Depreciation calculation, Notification delivery, Repair workflow state machine, Dashboard, Mobile implementation, Phase 11.

---

## 2. Canonical Scope & Architecture Mapping

- **Canonical Sources**:
  - `docs/01_PROJECT_SCOPE.md`: Asset management boundary.
  - `docs/02_USER_ROLES_AND_WORKFLOWS.md`: Asset lifecycle, allocation, and return workflows.
  - `docs/04_SYSTEM_ARCHITECTURE.md`: Spring Boot Modular Monolith package organization and layer decoupling.
  - `docs/05_DATABASE_DESIGN.md`: Asset table schemas (`asset_categories`, `assets`, `asset_assignments`, `asset_repair_histories`).
  - `docs/06_API_CONTRACT.md`: Endpoints 14.0–14.9, error payloads, and HTTP status mappings.
  - `reports/DECISIONS.md`: Decisions `D-046` and `D-047`.
  - `reports/runbooks/V016_ASSET_INVARIANTS_AND_INDEXES_PLAN.md`: Database invariants, normalization, and index strategy.

- **Package Architecture**:
  - `com.worksphere.asset.domain`: Entities (`AssetCategory`, `Asset`, `AssetAssignment`, `AssetRepairHistory`) and enums (`AssetStatus`, `AssetAssignmentStatus`, `AssetRepairType`).
  - `com.worksphere.asset.infrastructure.persistence`: Spring Data JPA repositories with pessimistic locking and scoped queries.
  - `com.worksphere.asset.application`: `AssetCategoryApplicationService` and `AssetApplicationService`.
  - `com.worksphere.asset.api.request`: DTOs (`CreateAssetCategoryRequest`, `UpdateAssetCategoryRequest`, `CreateAssetRequest`, `UpdateAssetRequest`, `AssignAssetRequest`, `ReturnAssetRequest`, `CreateAssetRepairHistoryRequest`).
  - `com.worksphere.asset.api.response`: DTOs (`AssetCategoryResponse`, `AssetSummaryResponse`, `AssetDetailResponse`, `AssetAssignmentResponse`, `AssetRepairHistoryResponse`).
  - `com.worksphere.asset.web`: Controllers (`AssetCategoryController`, `AssetController`).

---

## 3. Database Schema & Entity Mapping Consistency

Exact matrix mapping verified between `V006`, `V010`, `V016` and domain entities:

| Database Table & Column | Database Type & Constraints | Java Entity Field | JPA Mapping & Precision | `@Version` Status |
|---|---|---|---|---|
| `asset_categories.code` | VARCHAR(50) NOT NULL, UNIQUE, CHECK | `AssetCategory.code` | `@Column(length = 50, nullable = false)` | Has `@Version private Long version` |
| `asset_categories.name` | VARCHAR(150) NOT NULL | `AssetCategory.name` | `@Column(length = 150, nullable = false)` | Matches schema `version BIGINT` |
| `asset_categories.description` | VARCHAR(500) NULL | `AssetCategory.description` | `@Column(length = 500)` | Matches schema |
| `assets.purchase_price` | NUMERIC(18,2) NULL, CHECK >= 0 | `Asset.purchasePrice` | `@Column(precision = 18, scale = 2)` | Has `@Version private Long version` |
| `assets.asset_code` | VARCHAR(50) NOT NULL, UNIQUE, CHECK | `Asset.assetCode` | `@Column(length = 50, nullable = false)` | Matches schema `version BIGINT` |
| `assets.serial_number` | VARCHAR(150) NULL, UNIQUE | `Asset.serialNumber` | `@Column(length = 150)` | Matches schema |
| `asset_assignments.return_condition` | VARCHAR(500) NULL | `AssetAssignment.returnCondition` | `@Column(length = 500)` | Has `@Version private Long version` |
| `asset_assignments.notes` | VARCHAR(1000) NULL | `AssetAssignment.notes` | `@Column(length = 1000)` | Matches schema `version BIGINT` |
| `asset_repair_histories.cost` | NUMERIC(18,2) NULL, CHECK >= 0 | `AssetRepairHistory.cost` | `@Column(precision = 18, scale = 2)` | **No `@Version`** (Schema table has NO version column; immutable audit record) |

---

## 4. Database Invariants & Flyway Migration V016

- **Preflight Verification**:
  - Read-only preflight queries verified zero active assignment duplicates, zero category code duplicates, zero untrimmed/unnormalized asset codes in production/dev schemas (`V016_PREFLIGHT GO`).
- **Migration Script**: `V016__add_asset_assignment_and_category_invariants.sql`
  - Active assignment partial unique index:
    ```sql
    CREATE UNIQUE INDEX uk_asset_assignments_one_active
    ON asset_assignments(asset_id)
    WHERE status = 'ACTIVE';
    ```
  - Category code normalization check constraint:
    ```sql
    ALTER TABLE asset_categories
    ADD CONSTRAINT chk_asset_categories_code_normalized
    CHECK (code = UPPER(BTRIM(code)) AND code ~ '^[A-Z0-9_]{2,50}$');
    ```
  - Category code uniqueness:
    ```sql
    CREATE UNIQUE INDEX uk_asset_categories_code ON asset_categories(code);
    ```
  - Asset code normalization check constraint:
    ```sql
    ALTER TABLE assets
    ADD CONSTRAINT chk_assets_asset_code_normalized
    CHECK (asset_code = UPPER(BTRIM(asset_code)) AND asset_code ~ '^[A-Z0-9][A-Z0-9_-]{1,49}$');
    ```
  - Performance query indexes:
    ```sql
    CREATE INDEX idx_asset_assignments_assigned_to ON asset_assignments(assigned_to);
    CREATE INDEX idx_asset_assignments_asset_id ON asset_assignments(asset_id);
    ```
- **Migration Tests (8 tests in `V016MigrationTest`)**:
  - `testV016IndexesExist`: Confirms `uk_asset_assignments_one_active`, `uk_asset_categories_code`, and query indexes exist in `pg_indexes`.
  - `testActiveAssignmentUniqueness`: Confirms duplicate `ACTIVE` assignment is blocked (`23505`), while inactive/`RETURNED` history is allowed.
  - `testCategoryCodeUniqueness`: Confirms duplicate category code is blocked (`23505`).
  - `testCategoryCodeNormalizationCheck`: Confirms lowercase and untrimmed category codes fail check constraint.
  - `testAssetCodeNormalizationCheck`: Confirms lowercase and untrimmed asset codes fail check constraint.
  - `testPreflightNoGoScenario`: Confirms duplicate active assignment prior to V016 causes migration failure with transaction rollback and zero data loss.
  - `testCleanV001ToV016Migration`: Confirms clean migration V001–V016 on fresh PostgreSQL container reaches target schema 016.
  - `testPreflightCategoryDuplicateFailsV016`: Confirms duplicate category code prior to V016 causes migration failure with transaction rollback and zero data loss.

---

## 5. Domain & Business Policies Implementation

### A. Asset Category
- Authenticated active listing (`GET /api/v1/asset-categories`): Requires authenticated caller (`AUTHENTICATED`), returns 401 if unauthenticated, filtered to active and non-deleted.
- Admin paginated listing (`GET /api/v1/admin/asset-categories`): Quyền `ASSET_CATEGORY_MANAGE`, supports search, pagination, and active filters.
- Create (`POST /api/v1/admin/asset-categories`): trim and uppercase normalization, format validation `^[A-Z0-9_]{2,50}$`, immutable code.
- Activate (`PUT /api/v1/admin/asset-categories/{id}/activate`) / Deactivate (`PUT /api/v1/admin/asset-categories/{id}/deactivate`):
  - In-use protection: deactivation blocked if any non-deleted asset references the category, including RETIRED assets (`ASSET_CATEGORY_IN_USE` 400).
- Optimistic locking using JPA `@Version` (`OPTIMISTIC_LOCK_CONFLICT` 409).

### B. Asset Core
- Create (`POST /api/v1/assets`):
  - Initial status strictly `AVAILABLE`. Client-provided status ignored.
  - Code normalization (trim + uppercase) conforming to `^[A-Z0-9][A-Z0-9_-]{1,49}$`.
  - Category must exist, be active, and not soft-deleted.
  - Optional `serialNumber` uniqueness check.
- Update (`PUT /api/v1/assets/{assetId}`):
  - Immutable: `id`, `assetCode`, `createdBy`, `createdAt`, and assigned user.
  - Optimistic locking via `version`.
  - Status transition matrix strictly enforced: transitions out of `ASSIGNED` disallowed while an active assignment exists; `RETIRED` is terminal.
- Read Scoping & Authorization:
  - Outer gate: `ASSET_READ`.
  - `ADMIN`: can list and inspect all non-deleted assets.
  - Non-admin (EMPLOYEE, TEAM_LEADER): scoped strictly at database query level to assets where `assigned_to = principal.userId() AND status = 'ACTIVE'`.
  - `GET /api/v1/assets/my-assets`: locked to caller principal.
  - Detail (`GET /api/v1/assets/{assetId}`): unrelated users denied with `ASSET_ACCESS_DENIED` (403).

### C. Assignment & Concurrency Hardening
- Assign (`POST /api/v1/assets/{assetId}/assignments`):
  - Permission: `ASSET_MANAGE`.
  - Protocol: Row-level lock (`PESSIMISTIC_WRITE`) on `Asset`, verify asset is `AVAILABLE`, target user is `ACTIVE` and exists, verify no active assignment.
  - Status transitioned to `ASSIGNED`.
  - No direct reassignment: existing active assignment returns `ASSET_ALREADY_ASSIGNED` (400).
  - Hardened Concurrency Test: 2 workers competing over 5 rounds with `CyclicBarrier`:
    - Winner: strictly receives `201 Created`.
    - Loser: strictly receives canonical error `400` (code `ASSET_NOT_AVAILABLE` or `ASSET_ALREADY_ASSIGNED`) or `409` (code `ASSET_ASSIGNMENT_CONFLICT`).
    - Zero `500` internal errors.
    - Post-conditions: Asset status is `ASSIGNED`, exactly one `ACTIVE` assignment row in database, winner is one of the two competing contenders, `assignedBy` equals admin principal.
  - Database Constraint Extraction: PostgreSQL driver constraint extraction via `PSQLException.getServerErrorMessage().getConstraint()` ensures robust mapping to `ASSET_ASSIGNMENT_CONFLICT` (409) without depending solely on localized message strings.

### D. Return Transaction & Rollback Evidence
- Return (`PUT /api/v1/assets/{assetId}/assignments/{assignmentId}/return`):
  - Permission: `ASSET_MANAGE`.
  - Assignment updated to `RETURNED`, records `returnedAt` and `returnCondition`.
  - Resulting asset status selectable (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`), resulting status `ASSIGNED` rejected (`ASSET_STATUS_TRANSITION_INVALID` 400).
  - Full assignment history preserved across multiple assignment/return cycles.
- PostgreSQL Rollback Failure-Injection Evidence (`testReturnAssetRollbackOnFailure`):
  - Injected row-specific BEFORE UPDATE trigger on `assets` that raises an exception when the asset update flushes.
  - Verified full ACID rollback:
    - Asset remains `ASSIGNED`, asset `version` unchanged.
    - Assignment remains `ACTIVE`, assignment `version` unchanged, `returnedAt` remains null, `returnCondition` unchanged.
    - Zero partial state committed.

### E. Assignment Status Contract Governance
- Schema enum `AssetAssignmentStatus` includes `ACTIVE`, `RETURNED`, `LOST`, `DAMAGED`.
- Current Phase 10 API implementation:
  - `ReturnAssetRequest` only specifies `returnCondition`, `resultingAssetStatus`, and `version`.
  - `markReturned` sets assignment status to `RETURNED`.
  - Values `LOST` and `DAMAGED` are schema-reserved enum values for future asset tracking workflows.
  - Phase 10 does not expose direct mutation to `LOST` or `DAMAGED` assignment states; recorded as `ASSET_ASSIGNMENT_STATUS_CONTRACT_GAP` for future governance alignment.

### F. Repair History
- Semantics: Immutable audit records (no PUT or DELETE endpoints; requests return 405 Method Not Allowed).
- Create (`POST /api/v1/assets/{assetId}/repair-histories`):
  - Permission: `ASSET_MANAGE`.
  - Optional linkage to `ServiceRequest`: validates service request exists, not deleted, and matches current asset.
  - Zero side effects: does NOT mutate Asset status, does NOT mutate Service Request.
- List (`GET /api/v1/assets/{assetId}/repair-histories`):
  - Requires `ASSET_READ` with read scoping (Admin or active assignee).
  - Returned sorted by `startedAt DESC`.

### G. Service Request Integration & Projection Consistency
- Phase 9 `ServiceRequestApplicationService`:
  - When `assetId != null`: verifies asset exists and not soft-deleted.
  - Non-admin callers can only attach assets actively assigned to themselves (`ASSET_ACCESS_DENIED` 403).
  - Admins can link any valid non-deleted asset.
  - Zero auto-mutation of asset status or repair history.
- Related Service Request Authorization Consistency (`testRelatedServiceRequestsAuthorizationConsistency`):
  - In `getAssetDetail`, non-admin callers see related service requests if:
    - Caller is `requesterId`, OR
    - Caller has an active assignment in `service_assignments` (`is_active = true`).
  - Inactive/previous assignees and unrelated requests are excluded. Soft-deleted requests are excluded.
  - Admins see all non-deleted service requests referencing the asset.

---

## 6. Test Suite Summary

Total Backend Test Count: **259/259 PASS** (0 failures, 0 errors, 0 skipped).

| Test Class | Tests Run | Result | Key Capabilities Verified |
|---|---|---|---|
| `V016MigrationTest` | 8 | PASS | Clean migrate, duplicate active assignment 23505, duplicate category code, check constraints, query indexes, preflight active duplicate rollback, preflight category duplicate rollback |
| `AssetCategoryMockMvcTest` | 9 | PASS | Authenticated active list, admin pagination, create with normalization, duplicate 409, in-use check on AVAILABLE/RETIRED, optimistic locking, security gates |
| `AssetCoreMockMvcTest` | 13 | PASS | Create AVAILABLE, duplicate code/serial 409, status matrix transitions, RETIRED terminal, query scoping (Admin vs Employee), detail auth, related SR auth consistency |
| `AssetAssignmentAndConcurrencyMockMvcTest` | 10 | PASS | Single assignment, no direct reassignment, return to varied statuses, history preservation, controlled concurrency (5 rounds x 2 workers with strict code assertions), PostgreSQL return rollback failure injection |
| `AssetRepairHistoryMockMvcTest` | 7 | PASS | Immutable audit record creation, SR reference validation, date/cost validation, read scoping, 405 Method Not Allowed on PUT/DELETE |
| `AssetServiceRequestIntegrationMockMvcTest` | 6 | PASS | Requester links own active asset, cross-user asset rejected (403), returned asset rejected (403), soft-deleted rejected (404), zero auto-mutation |
| Existing Regression Suite (Phases 0–9) | 210 | PASS | Identity, Organization, Project, Task, File, Service Request, V012/V013 migration invariants all 100% green |

---

## 7. Verification & Standards Compliance

- **Java & Maven**: Java 27 runtime (Java 21 target), Apache Maven 3.9.16.
- **Checkstyle**: 0 violations against `checkstyle.xml`.
- **Database Engine**: PostgreSQL 15 via Testcontainers.
- **Canonical Files**: Zero unauthorized changes to canonical documents `docs/01_*.md` to `docs/10_*.md`.
- **Flyway Migrations**: V001–V016 strictly untouched; zero DDL modifications.
- **Git State**: Clean working tree, ready for stage, commit, and push.
