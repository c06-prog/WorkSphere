# PHASE 17 MEMORY CHECKPOINT
## Mobile Asset Management Closure

## Closure checkpoint
- **Repository Root**: `D:\WorkSphere`
- **Branch**: `main`
- **Closure Checkpoint SHA**: `07f5c6a3d5a4249f66c48a8b6e425d886a03485f`
- **Preceding Milestone**: `7c14777` (`docs(mobile): close phase 16 memory checkpoint`)
- **Git Status**: Clean, `HEAD == origin/main`.

---

## Phase status
- **Implementation**: COMPLETE (`Subphases 17A..17F` + `17F-CORRECTIVE` + `17F-FINAL` + `FINAL_RECONCILIATION`).
- **Mobile Regression**: PASS (114 suites, 1050 tests passing, 0 TypeScript errors, 0 ESLint errors).
- **Backend Regression**: PASS (37 test classes, 335 tests passing, 0 errors, 0 failures, 0 skips, Checkstyle 0).
- **Security Coverage**: PASS (Focused `JwtAuthenticationFilterTest`, `UserRepositoryIntegrationTest`, `E2eUserProvisionerTest`, `DevAssetFixtureProvisionerTest`).
- **Android Runtime**: VERIFIED (`Medium_Phone` / API 35 / x86_64, live Repair History POST & preview refresh verified).
- **Memory Checkpoint Status**: **CLOSED**.

---

## Decision
- **D-066 (Mobile Asset Management Architecture & Contract Freeze)**:
  - Preserves exactly five visible bottom tabs (`Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`).
  - Asset Management is entered via `More` screen.
  - Asset screens are hosted in the authenticated application stack (`AppNavigator`), never as tabs.
  - Dual-mode listing: Default "Tài sản của tôi" (`My Assets`) for employees; "Tất cả tài sản" (`All Assets`) requiring `ASSET_READ` or `ADMIN`.
  - Management actions (Create, Edit, Assign, Return, Add Repair History) strictly gated by `ASSET_MANAGE` or canonical `ADMIN`.
  - Assignment candidate selection utilizes the Company Directory user picker (`GET /api/v1/users`).
  - Strict optimistic concurrency control via entity `version` (Asset `version` for Edit, AssetAssignment `version` for Return).
  - All mutations employ synchronous `useRef` submission correctness locks.
  - Backend is the final authoritative source of truth.

---

## Scope
The complete Phase 17 mobile surface comprises:
1. **Foundation & Contracts**: Domain types, DTO contracts, query serializers, error mappers, API client methods.
2. **SCR-AST-01 Asset List Screen**: Dual-mode listing ("Tất cả tài sản" & "Tài sản của tôi"), keyword search, category filtering, status chips, pagination.
3. **SCR-AST-02 Asset Detail Screen**: Complete metadata view, status badge, current assignment card, repair history preview, fault reporting CTA.
4. **SCR-AST-03 Create Asset Screen**: Form with category modal picker, validation, initial `AVAILABLE` state generation.
5. **SCR-AST-04 Edit Asset Screen**: Form pre-populated with authoritative detail, concurrency protection using `Asset.version`, 409 Conflict handling.
6. **SCR-AST-05 Asset Assignment**: Directory user picker modal, active assignment creation, asset status transition to `ASSIGNED`.
7. **SCR-AST-06 Return Asset**: Return modal with condition notes, target inventory status selection (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`), assignment status transition to `RETURNED`.
8. **Auxiliary Repair History Action**: `AddRepairHistoryModal` manager workflow with authoritative backend persistence (`POST /api/v1/assets/{assetId}/repair-histories`) and `RepairHistoryPreview` refresh.

---

## Explicit exclusions
The following features are strictly excluded from Phase 17 mobile scope:
- Mobile Asset Category Admin CRUD (web/admin scope only).
- Native hardware QR / Barcode camera scanning (deferred to dedicated hardware phase).
- Asset image / document file attachment uploads (deferred to File Management Module).
- Native file picker or document viewer.
- Bulk asset import / export operations.
- Hard deletion of assets or repair history entries.
- Mobile mutation of assignment history records.
- Handling of `LOST` or `DAMAGED` asset workflows outside frozen contract boundaries.
- Phase 18 implementation.

---

## Screen inventory
| Screen ID | Component Name | Route Path | Responsibility |
| :--- | :--- | :--- | :--- |
| `SCR-AST-01` | `AssetListScreen` | `AssetList` | Dual-mode asset browsing, filtering, search, pagination |
| `SCR-AST-02` | `AssetDetailScreen` | `AssetDetail` | Comprehensive asset view, status, assignment & repair history |
| `SCR-AST-03` | `CreateAssetScreen` | `CreateAsset` | Asset creation form gated by `ASSET_MANAGE` |
| `SCR-AST-04` | `EditAssetScreen` | `EditAsset` | Concurrency-controlled asset editing form |
| `SCR-AST-05` | `AssignAssetModal` | Modal | Assign available asset to an active employee from directory |
| `SCR-AST-06` | `ReturnAssetModal` | Modal | Return assigned asset back to warehouse status |
| Auxiliary | `AddRepairHistoryModal` | Modal | Log repair/maintenance audit record for asset |

---

## Navigation
- **Architecture**:
  - `MainTabNavigator`: Contains strictly the 5 canonical tabs: `Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, and `More`.
  - `AppNavigator` (`createNativeStackNavigator<AppStackParamList>`): Hosts `MainTabs`, `AssetList`, `AssetDetail`, and `CreateAsset`.
  - Zero hidden routes in `Tab.Navigator`.
  - `EditAsset`, `AssignAssetModal`, `ReturnAssetModal`, and `AddRepairHistoryModal` are modal presentation flows invoked directly from `AssetDetailScreen`.

---

## Endpoint contract
Strictly implements the 10 canonical REST endpoints defined in `docs/06_API_CONTRACT.md` Section 14:
1. `GET /api/v1/asset-categories`: Fetch active category catalog.
2. `GET /api/v1/assets/my-assets`: Fetch current employee assigned assets.
3. `GET /api/v1/assets`: Company directory asset search with pagination and filters.
4. `GET /api/v1/assets/{assetId}`: Detailed asset representation with active assignment.
5. `POST /api/v1/assets`: Create asset (`ASSET_MANAGE` required).
6. `PUT /api/v1/assets/{assetId}`: Update asset (`ASSET_MANAGE` required, optimistic locking).
7. `POST /api/v1/assets/{assetId}/assignments`: Create assignment (`ASSET_MANAGE` required).
8. `PUT /api/v1/assets/{assetId}/assignments/{assignmentId}/return`: Return asset (`ASSET_MANAGE` required).
9. `GET /api/v1/assets/{assetId}/repair-histories`: List asset repair and maintenance log.
10. `POST /api/v1/assets/{assetId}/repair-histories`: Record repair history (`ASSET_MANAGE` required).

---

## DTO contract
- **Create Asset Request**: `assetCode`, `categoryId`, `name`, `description`, `serialNumber`, `manufacturer`, `model`, `purchaseDate`, `purchasePrice`, `warrantyEndDate`, `location`.
- **Update Asset Request**: `categoryId`, `name`, `description`, `serialNumber`, `manufacturer`, `model`, `purchaseDate`, `purchasePrice`, `warrantyEndDate`, `status`, `location`, `version`. (`assetCode` is immutable).
- **Assign Asset Request**: `assignedTo` (User UUID), `expectedReturnAt` (optional), `notes` (optional).
- **Return Asset Request**: `returnCondition` (optional), `resultingAssetStatus` (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`), `version` (AssetAssignment version).
- **Create Repair History Request**: `repairType` (`MAINTENANCE`, `REPAIR`, `INSPECTION`, `UPGRADE`), `description`, `startedAt`, `completedAt` (optional), `cost` (optional), `vendorName` (optional), `result` (optional).

---

## Identity semantics
- `assetId`: UUID primary key, used for all route parameters and URL paths.
- `assetCode`: Human-readable business code (e.g. `AST-0001`), display-only; **never** used as path parameter.
- `categoryId`: UUID foreign key to `AssetCategory`.
- `assignmentId`: UUID primary key of `AssetAssignment`, required for return endpoint.
- `assignedTo`: UUID of Directory User receiving the asset.
- `Asset.version`: Optimistic concurrency lock counter for Asset edits.
- `AssetAssignment.version`: Optimistic concurrency lock counter for Asset returns.
- Strict distinction enforced: `assetCode != assetId`, `assignedTo != assignmentId`, `Asset.version != AssetAssignment.version`.

---

## Asset lifecycle
- **Status Enum**: `AVAILABLE`, `ASSIGNED`, `MAINTENANCE`, `BROKEN`, `RETIRED`.
- Initial creation establishes `AVAILABLE`.
- Assignment transitions: `AVAILABLE -> ASSIGNED`.
- Return transitions: `ASSIGNED -> AVAILABLE | MAINTENANCE | BROKEN | RETIRED`.
- `ASSIGNED` is rejected as a Return result status.
- Direct edit updates cannot manually force `ASSIGNED` status (must go through assignment workflow).
- `RETIRED` is terminal.

---

## Assignment lifecycle
- **Status Enum**: `ACTIVE`, `RETURNED`, `LOST`, `DAMAGED`.
- Active assignment creation transitions to `ACTIVE`.
- Return workflow transitions assignment to `RETURNED`.
- Database invariant enforces at most one `ACTIVE` assignment per asset simultaneously.

---

## Authorization
- Canonical permission matrix (`docs/02_USER_ROLES_AND_WORKFLOWS.md` Section 2.6):
  - `ASSET_READ`: Granted to `EMPLOYEE`, `TEAM_LEADER`, `PROJECT_MANAGER`, `ADMIN`.
  - `ASSET_MANAGE`: Granted strictly and exclusively to `ADMIN`.
  - `FACILITY_MANAGER`: Non-existent in canonical schema / Flyway seed migrations.
- UI fail-closed gating: Management action buttons (`Create`, `Edit`, `Assign`, `Return`, `Ghi nhận sửa chữa`) are hidden or disabled when user lacks `ASSET_MANAGE`.

---

## Create / Edit workflows
- **Create**:
  - Validates required fields (`name`, `assetCode`, `categoryId`).
  - Gated by `ASSET_MANAGE`.
  - Navigates to created `AssetDetail` on success.
- **Edit**:
  - Gated by `ASSET_MANAGE`.
  - Passes current `Asset.version`.
  - Catches HTTP 409 Conflict: alerts user, prevents blind retry, reloads authoritative state, resets version baseline.

---

## Assign / Return workflows
- **Assign**:
  - Available only when asset status is `AVAILABLE`.
  - Gated by `ASSET_MANAGE`.
  - Uses directory user picker to resolve `assignedTo` UUID.
- **Return**:
  - Available only when asset status is `ASSIGNED`.
  - Gated by `ASSET_MANAGE`.
  - Requires target resulting status (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`).
  - Concurrency protected by `AssetAssignment.version`.
  - Catches HTTP 409 Conflict on stale assignment version.

---

## Repair history workflow
- Previewed on `AssetDetailScreen` via `RepairHistoryPreview`.
- Gated entry: "Ghi nhận sửa chữa" CTA opens `AddRepairHistoryModal` (`ASSET_MANAGE` required).
- Supports 4 canonical types (`MAINTENANCE`, `REPAIR`, `INSPECTION`, `UPGRADE`).
- Captures description, dates, cost, vendor, and result.
- On success: closes modal, triggers `refreshKey` reload in `RepairHistoryPreview` without requiring full detail reload.

---

## Date / Time behavior
- For date-only repair inputs (`YYYY-MM-DD`):
  - `startedAt` is serialized as `YYYY-MM-DDT08:00:00Z` (15:00 GMT+7).
  - `completedAt` is serialized as `YYYY-MM-DDT10:00:00Z` (17:00 GMT+7).
- Preserves `completedAt >= startedAt`.
- Guarantees local calendar date preservation in Asia/Ho_Chi_Minh without day rollover.
- Avoids `T17:00:00Z` (which causes date drift to the next day in Vietnam).

---

## Report-fault integration
- "Báo hỏng / Sự cố" CTA on `AssetDetailScreen` navigates to `CreateServiceRequest` route passing `{ assetId }`.
- Navigation route parameter establishes pre-selection only; backend validates requester relationship authoritatively upon creation.

---

## Concurrency & Mutation-lock standard
- **List Concurrency**: Query generation tracking (`queryGenerationRef`), 300ms search debounce, pagination locking (`loadingMoreRef`), stale append rejection, ID deduplication.
- **Detail Concurrency**: Same-ID deduplication, in-flight promise memoization, focus freshness checks.
- **Mutation Locking**: All mutations (`Create`, `Edit`, `Assign`, `Return`, `Add Repair History`) enforce synchronous `submittingRef.current` locks against same-tick multi-submission. React state (`isSubmitting`) is reserved exclusively for presentation.

---

## Dev E2E fixtures
- Implemented dev-only infrastructure under `backend/src/main/java/**/dev/`:
  - `E2eUserProvisioner`: supports configurable role (`EMPLOYEE` / `ADMIN` allowlist) strictly guarded by `@Profile("dev")` and `worksphere.dev.e2e-user.enabled`.
  - `DevAssetFixtureProvisioner`: seeds canonical category `E2E_ASSET_CAT` strictly guarded by `@Profile("dev")` and `worksphere.dev.e2e-asset-fixture.enabled`.
  - Idempotent execution, zero plaintext credential logging, completely inert outside `dev`.

---

## Production security fix
- Fixed `LazyInitializationException` in `JwtAuthenticationFilter`:
  - Eagerly fetches user roles and permissions via `userRepository.findActiveWithRolesById(userId)` with `LEFT JOIN FETCH`.
  - Retains active/deleted user checks, 401/403 semantics, and token confidentiality.
  - Derives authorities strictly from database state, ignoring arbitrary JWT claims.

---

## Mobile baseline
- **ESLint**: 0 errors, 48 historical warnings preserved (0 asset warnings).
- **TypeScript**: 0 type errors (`tsc --noEmit`).
- **Asset Test Suite**: 16 suites, 122 tests PASS (`__tests__/assets`).
- **Full Mobile Suite**: 114 suites, 1050 tests PASS (0 failures, 0 skipped, 0 snapshots).
- Jest exits cleanly without `--forceExit`.

---

## Backend baseline
- **Full Test Suite**: 37 test classes, 335 tests PASS (`.\mvnw.cmd test`).
- **Failures**: 0.
- **Errors**: 0.
- **Skipped**: 0.
- **Checkstyle**: 0 violations.
- **Status**: **BUILD SUCCESS** (06:25 min).
- **Focused Suites**:
  - `JwtAuthenticationFilterTest`: 9/9 PASS.
  - `UserRepositoryIntegrationTest`: 3/3 PASS.
  - `E2eUserProvisionerTest`: 11/11 PASS.
  - `DevAssetFixtureProvisionerTest`: 3/3 PASS.
  - `RolePermissionSeedIntegrationTest`: 13/13 PASS.

---

## Android E2E runtime evidence
- **Target**: `Medium_Phone` (Android 15 / API 35 / x86_64, serial `emulator-5554`).
- **Executed Live Workflow**:
  - Login with provisioned E2E credentials.
  - Navigate to More Screen -> Quản lý tài sản -> Tất cả tài sản.
  - Open asset `E2E-RH-EQWYKA`.
  - Tap "Ghi nhận sửa chữa" CTA.
  - Fill and submit `AddRepairHistoryModal` (`Bảo dưỡng`, `350.000 đ`, `2026-10-25`).
  - Backend responded 200 OK; 1 record persisted in PostgreSQL.
  - `RepairHistoryPreview` refreshed on screen with date `25/10/2026`.
  - Zero date rollover under GMT+7.
  - No crash, ANR, or fatal JavaScript error.

---

## Secret & artifact safety
- Zero credentials, tokens, Authorization headers, or JWTs committed to repository.
- Ephemeral test session file `$env:TEMP\ws_e2e_session.json` deleted.
- Untracked screenshot binary removed from Git during final reconciliation.
- All development services (Metro Bundler, Android Emulator, Spring Boot dev server) stopped and verified inactive.

---

## Accepted historical debt
- 48 warnings for `react-native/no-inline-styles` in legacy Phase 14 modules.
- Pre-existing toolchain notices (AGP deprecation, KSP compiler warning, npm dev audit advisories).
- Zero Phase-17-specific open debt.

---

## Resume rules for future agents
1. **Never reinterpret Decision D-066**: All asset navigation, listing, and lifecycle rules are permanently frozen.
2. **Never substitute identifiers**: `assetId` is the unique path/route ID; `assetCode` is display-only; `assignmentId` is required for Return.
3. **Never mix versions**: Use `Asset.version` for asset updates; use `AssetAssignment.version` for return operations.
4. **Never allow ASSIGNED as return status**: Return result must be one of `AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`.
5. **Never register Asset routes in Tab.Navigator**: Asset screens belong exclusively to `AppNavigator` stack.
6. **Never bypass ASSET_MANAGE**: Management mutations require `ASSET_MANAGE` (held strictly by `ADMIN`).
7. **Never activate Dev Fixtures in production**: Keep `@Profile("dev")` and disabled-by-default property gates intact.
8. **Never trust JWT claims over database authorities**: `JwtAuthenticationFilter` must always load authoritative roles from `UserRepository`.
9. **Never change Repair History date offset to T17:00:00Z**: Keep `T08:00:00Z` / `T10:00:00Z` to prevent GMT+7 date rollover.
10. **Never commit screenshot binaries or raw log dumps**: Retain textual and API verification logs only.

---

## Phase 18 boundary
- **Phase 18 (Mobile Notification System)**: **NOT STARTED**.
- Entry point from roadmap: `SCR-NOTIF-01 Notification Center`.
- Scope includes notification listing, read/unread status updates, unread badge counter, and contextual navigation.
- Next immediate task: **PRE-PHASE 18 AUDIT**.

---

## Closure verdict
`PHASE_17_MEMORY_CHECKPOINT_CLOSED`
