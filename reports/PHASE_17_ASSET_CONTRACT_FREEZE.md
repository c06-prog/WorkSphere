# PHASE 17 ASSET CONTRACT FREEZE
D-066: MOBILE ASSET MANAGEMENT CONTRACT & SCOPE FREEZE

## Checkpoint
- **Repository**: `D:\WorkSphere`
- **Branch**: `main`
- **Baseline Checkpoint**: `abbe57e3df0091d6562daf0fab364c134171d3b4`
- **Prerequisites**: Phase 16 `CLOSED (MEMORY_CHECKPOINT_CLOSED)`, Pre-Phase 17 Audit `PRE_PHASE_17_AUDIT_PASS_READY_FOR_DECISION_FREEZE`.
- **Phase 17 Status**: `CONTRACT_FROZEN / IMPLEMENTATION_NOT_STARTED`.

---

## Scope
- Canonical Phase 17 Module: **Mobile Asset Management**.
- Canonical Screen Inventory per `docs/03_MOBILE_SCREEN_MAP.md` Section 10 & `design/02_SCREEN_INVENTORY.md`:
  - `SCR-AST-01`: Asset List Screen (P0)
  - `SCR-AST-02`: Asset Detail Screen (P0)
  - `SCR-AST-03`: Create Asset Screen (P1)
  - `SCR-AST-04`: Edit Asset Screen (P1)
  - `SCR-AST-05`: Asset Assignment Screen (P1)
  - `SCR-AST-06`: Return Asset Screen (P1)

---

## Explicit exclusions
1. **Asset Category Admin CRUD**: Mutations (`POST /admin/asset-categories`, `PUT /admin/asset-categories/{id}`, activate/deactivate) are strictly excluded from mobile scope. Mobile only consumes active categories via `GET /api/v1/asset-categories`.
2. **Native Barcode / QR Camera Scanning**: No camera or scanner hardware native modules (`vision-camera`, `react-native-camera`). Code search uses text input (`assetCode`, `serialNumber`).
3. **Asset Image / Photo Upload**: Backend DTOs (`CreateAssetRequest`, `UpdateAssetRequest`) do not contain photo or image fields. File upload remains deferred per D-063/D-065.
4. **Native Document / File Picker**: No attachment uploads or file pickers.
5. **Bulk Import / Export**: Web Admin only.
6. **Hard Deletion of Assets**: Soft-deletion is handled exclusively by Web Admin; mobile supports warehouse retirement (`RETIRED`).
7. **Modification of Other Modules**: Zero edits to Notification Center, Project Management, Task Management, or Service Request production source.

---

## Screens
| Screen ID | Canonical Screen Name | Form / Layout | Entry Route / Navigation | Audience | Required Authority |
|---|---|---|---|---|---|
| `SCR-AST-01` | Asset List Screen | Full Screen | Entry from `More` ("Tài sản của tôi") | All Employees / Managers | Authenticated (`getMyAssets`); `ASSET_READ` for directory toggle |
| `SCR-AST-02` | Asset Detail Screen | Full Screen | Hidden Route `AssetDetail` from AssetCard | All Employees / Managers | Assignee or `ASSET_READ` / `ADMIN` |
| `SCR-AST-03` | Create Asset Screen | Full Screen | Hidden Route `CreateAsset` from FAB/action | Managers | `ASSET_MANAGE` |
| `SCR-AST-04` | Edit Asset Screen | Modal / Sheet | `EditAssetModal` inside `AssetDetail` | Managers | `ASSET_MANAGE` |
| `SCR-AST-05` | Asset Assignment Screen | Modal / Sheet | `AssignAssetModal` inside `AssetDetail` | Managers | `ASSET_MANAGE` |
| `SCR-AST-06` | Return Asset Screen | Modal / Sheet | `ReturnAssetModal` inside `AssetDetail` | Managers | `ASSET_MANAGE` |

---

## Backend source inventory
- **Web Controllers**:
  - `com.worksphere.asset.web.AssetController` (`/api/v1/assets`)
  - `com.worksphere.asset.web.AssetCategoryController` (`/api/v1/asset-categories`)
- **Application Services**:
  - `com.worksphere.asset.application.AssetApplicationService`
  - `com.worksphere.asset.application.AssetCategoryApplicationService`
- **Domain Entities & Enums**:
  - `com.worksphere.asset.domain.Asset`
  - `com.worksphere.asset.domain.AssetCategory`
  - `com.worksphere.asset.domain.AssetAssignment`
  - `com.worksphere.asset.domain.AssetRepairHistory`
  - `com.worksphere.asset.domain.AssetStatus`
  - `com.worksphere.asset.domain.AssetAssignmentStatus`
  - `com.worksphere.asset.domain.AssetRepairType`
- **DTOs**:
  - Requests: `CreateAssetRequest`, `UpdateAssetRequest`, `AssignAssetRequest`, `ReturnAssetRequest`, `CreateAssetRepairHistoryRequest`
  - Responses: `AssetSummaryResponse`, `AssetDetailResponse`, `AssetCategoryResponse`, `AssetAssignmentResponse`, `AssetRepairHistoryResponse`
- **Repositories**: `AssetRepository`, `AssetCategoryRepository`, `AssetAssignmentRepository`, `AssetRepairHistoryRepository`

---

## Endpoint matrix
| Verb | Route | Security | Request DTO | Response | Status | Versioned? |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/asset-categories` | Authenticated | None | `List<AssetCategoryResponse>` | 200 OK | No |
| `GET` | `/api/v1/assets/my-assets` | Authenticated | Query: `search`, `categoryId`, `status`, `page`, `size`, `sort` | `PagedData<AssetSummaryResponse>` | 200 OK | No |
| `GET` | `/api/v1/assets` | `hasAuthority('ASSET_READ')` | Query: `search`, `categoryId`, `status`, `page`, `size`, `sort` | `PagedData<AssetSummaryResponse>` | 200 OK | No |
| `GET` | `/api/v1/assets/{assetId}` | `hasAuthority('ASSET_READ')` (Active Assignee / Admin) | Path: `assetId` | `AssetDetailResponse` | 200 OK | Returns `version` |
| `POST` | `/api/v1/assets` | `hasAuthority('ASSET_MANAGE')` | `CreateAssetRequest` | `AssetDetailResponse` | 201 Created | No |
| `PUT` | `/api/v1/assets/{assetId}` | `hasAuthority('ASSET_MANAGE')` | `UpdateAssetRequest` | `AssetDetailResponse` | 200 OK | Sends `version` |
| `POST` | `/api/v1/assets/{assetId}/assignments` | `hasAuthority('ASSET_MANAGE')` | `AssignAssetRequest` | `AssetAssignmentResponse` | 200 OK | No (Pessimistic lock) |
| `PUT` | `/api/v1/assets/{assetId}/assignments/{assignmentId}/return` | `hasAuthority('ASSET_MANAGE')` | `ReturnAssetRequest` | `AssetAssignmentResponse` | 200 OK | Sends assignment `version` |
| `GET` | `/api/v1/assets/{assetId}/repair-histories` | `hasAuthority('ASSET_READ')` (Active Assignee / Admin) | Path: `assetId` | `List<AssetRepairHistoryResponse>` | 200 OK | No |
| `POST` | `/api/v1/assets/{assetId}/repair-histories` | `hasAuthority('ASSET_MANAGE')` | `CreateAssetRepairHistoryRequest` | `AssetRepairHistoryResponse` | 201 Created | No |

---

## Mobile endpoint set
- `GET /api/v1/asset-categories`: **PHASE_17_REQUIRED** (active category selection in search/create/edit).
- `GET /api/v1/assets/my-assets`: **PHASE_17_REQUIRED** (primary employee view in `SCR-AST-01`).
- `GET /api/v1/assets`: **PHASE_17_REQUIRED** (company directory mode in `SCR-AST-01` for users with `ASSET_READ`).
- `GET /api/v1/assets/{assetId}`: **PHASE_17_REQUIRED** (`SCR-AST-02` detail view).
- `POST /api/v1/assets`: **PHASE_17_REQUIRED** (`SCR-AST-03` create flow).
- `PUT /api/v1/assets/{assetId}`: **PHASE_17_REQUIRED** (`SCR-AST-04` edit flow).
- `POST /api/v1/assets/{assetId}/assignments`: **PHASE_17_REQUIRED** (`SCR-AST-05` assignment flow).
- `PUT /api/v1/assets/{assetId}/assignments/{assignmentId}/return`: **PHASE_17_REQUIRED** (`SCR-AST-06` return flow).
- `GET /api/v1/assets/{assetId}/repair-histories`: **PHASE_17_REQUIRED** (embedded repair preview on `SCR-AST-02`).
- `POST /api/v1/assets/{assetId}/repair-histories`: **BACKEND_SUPPORTED_NOT_CANONICAL** (staged as auxiliary manager action inside repair history component).

---

## Category contract
- Route: `GET /api/v1/asset-categories`
- Response: `List<AssetCategoryResponse>` (unpaged array)
- Fields: `id: string` (UUID), `code: string`, `name: string`, `description?: string`, `active: boolean`.
- Usage: Dropdown/picker modal for category filtering and assignment during Create/Edit.

---

## My Assets
- Endpoint: `GET /api/v1/assets/my-assets`
- Query Params: `page=0`, `size=20`, `sort=createdAt,desc`, `search?: string`, `categoryId?: string`, `status?: AssetStatus`.
- Response: `PagedData<AssetSummaryResponse>` (`content: AssetSummaryResponse[]`, `pageNumber`, `pageSize`, `totalElements`, `totalPages`, `last`).
- Semantics: Backend filters assets where current user has an active assignment (`AssetAssignmentStatus.ACTIVE`).
- Authorization: All authenticated employees.

---

## Company directory mode
- Endpoint: `GET /api/v1/assets`
- Query Params: `page=0`, `size=20`, `sort=createdAt,desc`, `search?: string`, `categoryId?: string`, `status?: AssetStatus`.
- Required Authority: `ASSET_READ` or system `ADMIN`.
- Decision (**D-066 List Mode Decision**):
  - `SCR-AST-01` features a segmented tab control:
    - Tab 1: **"Của tôi"** (default for all users, calls `/api/v1/assets/my-assets`).
    - Tab 2: **"Tất cả tài sản"** (visible only if user holds `ASSET_READ` or `ADMIN`, calls `/api/v1/assets`).
  - If a user lacks `ASSET_READ`, the segmented control is hidden and the screen behaves purely as "Tài sản của tôi".

---

## Summary DTO
`AssetSummaryResponse`:
- `id: string` (UUID)
- `assetCode: string` (Human-readable unique code)
- `name: string` (Asset name)
- `category: { id: string, code: string, name: string }`
- `serialNumber?: string`
- `manufacturer?: string`
- `model?: string`
- `status: AssetStatus`
- `location?: string`
- `warrantyEndDate?: string` (ISO `YYYY-MM-DD`)
- `currentAssignee?: { id: string, fullName: string }`
- `assignedAt?: string` (ISO 8601 Instant)
- `version: number`

---

## Detail DTO
`AssetDetailResponse`:
- `id: string` (UUID)
- `assetCode: string`
- `name: string`
- `category?: { id: string, code: string, name: string }`
- `description?: string`
- `serialNumber?: string`
- `manufacturer?: string`
- `model?: string`
- `purchaseDate?: string` (ISO `YYYY-MM-DD`)
- `purchasePrice?: number` (BigDecimal)
- `status: AssetStatus`
- `location?: string`
- `warrantyEndDate?: string` (ISO `YYYY-MM-DD`)
- `currentAssignment?: { id: string, assignedTo: { id: string, fullName: string }, assignedBy: { id: string, fullName: string }, assignedAt: string, expectedReturnAt?: string, notes?: string }`
- `repairHistories: AssetRepairHistoryResponse[]`
- `relatedServiceRequests: { id: string, requestNumber: string, title: string, status: string }[]`
- `createdAt: string`
- `updatedAt: string`
- `version: number`

---

## Identity semantics
- `assetId`: UUID string of Asset entity. Used in all API path parameters.
- `assetCode`: Unique business identifier (e.g. `LAP-2026-001`), display only; NEVER passed as URL ID.
- `categoryId`: UUID string of AssetCategory entity.
- `assignmentId`: UUID string of AssetAssignment entity. Specifically required by return endpoint (`/assets/{assetId}/assignments/{assignmentId}/return`).
- `assignedTo`: Directory User UUID of recipient employee.
- `repairHistoryId`: UUID string of AssetRepairHistory entity.
- Strict isolation: `assignmentId != assignedTo != assetId`.

---

## Version model
- `Asset` entity has an optimistic locking `version: number`.
- `UpdateAssetRequest` requires `@NotNull Long version`. 409 conflict returns `OPTIMISTIC_LOCK_CONFLICT`.
- `AssetAssignment` entity has an optimistic locking `version: number`.
- `ReturnAssetRequest` requires `@NotNull Long version` (version of the active `AssetAssignment` record).
- `AssignAssetRequest` is unversioned (backend utilizes `findByIdForUpdate` pessimistic lock on `Asset`).
- No automatic retries on 409 conflicts; UI provides an authoritative reload dialog.

---

## Asset status lifecycle
- Domain Enum: `AVAILABLE`, `ASSIGNED`, `MAINTENANCE`, `BROKEN`, `RETIRED`.
- Lifecycle Rules:
  - Initial creation status is always `AVAILABLE`.
  - Assignment transitions `AVAILABLE -> ASSIGNED`.
  - Return transitions `ASSIGNED -> resultingAssetStatus` (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`).
  - Warehouse status transitions (via `PUT /assets/{id}`):
    - `AVAILABLE <-> MAINTENANCE`
    - `AVAILABLE <-> BROKEN`
    - `MAINTENANCE <-> BROKEN`
    - `AVAILABLE / MAINTENANCE / BROKEN -> RETIRED`
  - Prohibitions:
    - Cannot update to `ASSIGNED` directly via `PUT /assets/{id}`.
    - Cannot edit status of an asset while `ASSIGNED` via general update.
    - `RETIRED` is terminal; cannot transition away from `RETIRED`.

---

## Assignment lifecycle
- Domain Enum: `ACTIVE`, `RETURNED`, `LOST`, `DAMAGED`.
- Mobile Supported Lifecycle: `ACTIVE -> RETURNED`.
- Invariant: Exactly one active assignment permitted per asset at any time.

---

## Permissions
- `ASSET_READ`: View company-wide asset directory (`/assets`) and unassigned asset details.
- `ASSET_MANAGE`: Create, edit, assign, return assets, and log repairs.
- `ADMIN`: Canonical system role granting full access.
- Employees without management authority have access only to `/assets/my-assets` and actively assigned asset details.

---

## Employee access
- Querying `GET /assets/{assetId}`: Non-admin users are checked against `existsByAssetIdAndAssignedToAndStatus(assetId, userId, ACTIVE)`.
- If unauthorized, backend throws `ASSET_ACCESS_DENIED`. Mobile screens fail closed gracefully with user-friendly error banners.

## Management capability
- Client management controls (Add FAB on list, Edit button, Assign button, Return button) are strictly gated by:
  `user.permissions.includes('ASSET_MANAGE') || user.roles.includes('ADMIN')`.

---

## Create contract
- Route: `POST /api/v1/assets`
- Request: `CreateAssetRequest`:
  - `assetCode: string` (2..50 chars, unique)
  - `categoryId: string` (UUID)
  - `name: string` (max 200 chars)
  - `description?: string`
  - `serialNumber?: string` (max 150 chars, unique)
  - `manufacturer?: string`
  - `model?: string`
  - `purchaseDate?: string` (`YYYY-MM-DD`)
  - `purchasePrice?: number` (>= 0)
  - `warrantyEndDate?: string` (`YYYY-MM-DD`)
  - `location?: string`
- Response: `AssetDetailResponse` (201 Created).
- Synchronous lock: `submittingRef`.

---

## Update contract
- Route: `PUT /api/v1/assets/{assetId}`
- Request: `UpdateAssetRequest`:
  - `categoryId?: string`
  - `name: string`
  - `description?: string`
  - `serialNumber?: string`
  - `manufacturer?: string`
  - `model?: string`
  - `purchaseDate?: string`
  - `purchasePrice?: number`
  - `warrantyEndDate?: string`
  - `status?: AssetStatus`
  - `location?: string`
  - `version: number` (required)
- Response: `AssetDetailResponse` (200 OK).
- Synchronous lock: `submittingRef`.

---

## Assignment contract
- Route: `POST /api/v1/assets/{assetId}/assignments`
- Request: `AssignAssetRequest`:
  - `assignedTo: string` (Directory User UUID)
  - `expectedReturnAt?: string` (ISO 8601 Instant)
  - `notes?: string` (max 1000 chars)
- Response: `AssetAssignmentResponse`.
- Synchronous lock: `assignLockRef`.
- Followed by authoritative refresh: `invalidateAndRefresh()`.

---

## Return contract
- Route: `PUT /api/v1/assets/{assetId}/assignments/{assignmentId}/return`
- Request: `ReturnAssetRequest`:
  - `returnCondition?: string` (max 500 chars)
  - `resultingAssetStatus: AssetStatus` (required; `AVAILABLE`, `MAINTENANCE`, `BROKEN`, or `RETIRED`)
  - `version: number` (required; version of active assignment)
- Response: `AssetAssignmentResponse`.
- Synchronous lock: `returnLockRef`.
- Followed by authoritative refresh: `invalidateAndRefresh()`.

---

## Repair histories
- Decision (**D-066 Repair History Decision**):
  - In `SCR-AST-02` (Asset Detail), repair histories are displayed as a read-only historical list (`GET /api/v1/assets/{assetId}/repair-histories`).
  - Creation of repair records via `POST /assets/{assetId}/repair-histories` is supported as an auxiliary manager modal (`AddRepairHistoryModal`) accessible from the repair section for users with `ASSET_MANAGE`.

---

## Related service requests
- `AssetDetailResponse.relatedServiceRequests` provides embedded projection:
  `{ id: string, requestNumber: string, title: string, status: string }[]`.
- Displayed as a read-only list on `SCR-AST-02`. Clicking an item navigates to `ServiceRequestDetail` with `{ requestId: item.id }`.

---

## Report-fault flow
- Cross-module integration from `SCR-AST-02` (Asset Detail):
  - Primary button: "Báo hỏng / Tạo yêu cầu dịch vụ"
  - Visibility: Visible when user is active assignee OR holds `ASSET_MANAGE`.
  - Action: Dispatches navigation to `CreateServiceRequest` with param:
    `navigation.navigate('CreateServiceRequest', { assetId: asset.id })`.
  - Backend validation: `AssetServiceRequestIntegrationMockMvcTest` verifies that non-admin users can only create service requests for assets actively assigned to them.

---

## Date/time
- Calendar Dates: `purchaseDate`, `warrantyEndDate` formatted as `YYYY-MM-DD` (calendar dates without timezone offset).
- Instants: `assignedAt`, `expectedReturnAt`, `createdAt`, `updatedAt`, `startedAt`, `completedAt` formatted as ISO 8601 UTC Instants.

## Image/file boundary
- Read-only display of metadata; zero client-side upload or file pickers.

## QR/barcode boundary
- Code lookup is implemented via standard text input / search query parameter (`search` matched against `assetCode` and `serialNumber`). Hardware camera scanning is deferred.

---

## Search/filter controls
- Search Bar: Debounced text input (300ms) querying `search`.
- Category Filter: Modal/chip filter querying `categoryId`.
- Status Filter: Chip filter querying `status` (`AVAILABLE`, `ASSIGNED`, `MAINTENANCE`, `BROKEN`, `RETIRED`).

---

## Pagination/sorting
- Defaults: `page=0`, `size=20`, `sort=createdAt,desc`.
- Latest-query-wins via monotonic generation counter (`queryGenRef`).
- Deduplication by asset `id`.

---

## StatusBadge
- `StatusBadge` component (`mobile/src/shared/components/StatusBadge.tsx`) will be extended with:
  `context="asset"` supporting `AssetStatus` values:
  - `AVAILABLE`: Success (Xanh lá - Sẵn sàng)
  - `ASSIGNED`: Info (Xanh dương - Đang cấp phát)
  - `MAINTENANCE`: Warning (Vàng cam - Bảo dưỡng)
  - `BROKEN`: Danger (Đỏ - Hỏng)
  - `RETIRED`: Neutral (Xám - Thanh lý)

---

## Reuse
- `apiClient`: Shared HTTP client with token handling.
- `useDirectoryUsers` & `UserPickerModal`: Reused for assignee selection.
- List concurrency hooks: Pattern reused from `useServiceRequests` and `useTasks`.
- Detail hook: Pattern reused from `useServiceRequestDetail`.

---

## Navigation
- Root Entry Decision (**D-066 Root Entry Decision**):
  - Visible tabs remain exactly 5: `Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`.
  - Asset Management is accessed via the **`More` screen** ("Tài sản của tôi" / "Quản lý tài sản").
  - `AssetList` (`SCR-AST-01`) is registered as a stack screen in `MainTabNavigator` (`headerShown: true`, no bottom tab consumption).
  - Auxiliary routes registered:
    - `AssetList`
    - `AssetDetail` (`{ assetId: string }`)
    - `CreateAsset` (undefined)
- Auxiliary modals inside `AssetDetail`:
  - `EditAssetModal`
  - `AssignAssetModal`
  - `ReturnAssetModal`
  - `AddRepairHistoryModal`

---

## Mutation inventory
Total 5 mutations in Phase 17 Mobile:
1. `Create Asset`: `POST /api/v1/assets`, unversioned, `submittingRef`
2. `Edit Asset`: `PUT /api/v1/assets/{assetId}`, `Asset.version`, `submittingRef`
3. `Assign Asset`: `POST /api/v1/assets/{assetId}/assignments`, unversioned, `assignLockRef`
4. `Return Asset`: `PUT /api/v1/assets/{assetId}/assignments/{assignmentId}/return`, `AssetAssignment.version`, `returnLockRef`
5. `Create Repair History`: `POST /api/v1/assets/{assetId}/repair-histories`, unversioned, `submittingRef`

---

## Concurrency
- All mutation dispatches strictly guarded by synchronous `useRef` locks before async call.
- Monotonic query generation counters prevent stale out-of-order response overwrites.

---

## Error inventory
- `ASSET_NOT_FOUND`: Resource missing or soft-deleted (dialog).
- `ASSET_CATEGORY_NOT_FOUND`: Category missing or inactive (dialog).
- `ASSET_NOT_AVAILABLE`: Attempt to assign asset not in `AVAILABLE` status.
- `ASSET_ALREADY_ASSIGNED`: Concurrency conflict during assignment.
- `ASSET_STATUS_TRANSITION_INVALID`: Disallowed status transition.
- `ASSET_RETIRED`: Attempt to mutate retired asset.
- `ASSET_CODE_ALREADY_EXISTS`: Duplicate asset code (409 conflict).
- `ASSET_SERIAL_NUMBER_ALREADY_EXISTS`: Duplicate serial number (409 conflict).
- `ASSET_ASSIGNMENT_NOT_FOUND`: Active assignment record missing.
- `ASSET_ASSIGNMENT_ALREADY_INACTIVE`: Attempt to return already completed assignment.
- `ASSET_ACCESS_DENIED`: Unauthorized access to unassigned asset.
- `OPTIMISTIC_LOCK_CONFLICT`: Concurrent edit collision on asset or assignment.

---

## Security
- Shared `apiClient` only; zero token storage in asset feature.
- No raw database UUIDs or version numbers rendered.
- Client gates are defensive; backend strictly enforces authorization fail-closed.

---

## Tests
- Contract tests: types, enums, API adapter, status badges, error mapper.
- Screen tests: list debounce, my-assets vs directory mode switching, detail loading, "Báo hỏng" CTA redirect, create/edit forms, assignment modal, return modal with version check.
- Single-screen concurrency & version chain integration tests.

---

## Subphases
- **Phase 17A**: Asset Foundation (Types, API Adapter, StatusBadge extension, Error Mapper, Route Contracts)
- **Phase 17B**: Asset List & My Assets (`SCR-AST-01`, `useAssets` / `useMyAssets`, `AssetCard`)
- **Phase 17C**: Asset Detail & Service Request Linking (`SCR-AST-02`, `useAssetDetail`, repair histories, "Báo hỏng" CTA)
- **Phase 17D**: Create & Edit Asset (`SCR-AST-03`, `SCR-AST-04`, `ASSET_MANAGE` gating, optimistic locking)
- **Phase 17E**: Asset Assignment & Return Workflows (`SCR-AST-05`, `SCR-AST-06`, Directory picker integration, assignment versioning)
- **Phase 17F**: Full Integration, Regression, Android Native Verification & Hardening

---

## Resume rules
1. Do not add a 6th bottom tab; Asset Management must enter via `More`.
2. Do not conflate `assetId` and `assetCode`.
3. Do not send `version` in `AssignAssetRequest`.
4. `ReturnAssetRequest.version` MUST refer to the `AssetAssignment.version`, NOT `Asset.version`.
5. Non-admin users can only view assets currently actively assigned to them.
6. All mutations must use synchronous `useRef` locks.

---

## Conclusion
Phase 17 Mobile Asset Management is completely specified, contracts are verified against backend controllers and DTOs, architectural decisions are resolved, and subphases are frozen.

**Verdict**: `PHASE_17_CONTRACT_FROZEN_READY_FOR_17A`
