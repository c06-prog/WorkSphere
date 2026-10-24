# PRE-PHASE 17 AUDIT: MOBILE ASSET MANAGEMENT
CONTRACT RECONCILIATION & READINESS ASSESSMENT

## 1. Executive Summary & Checkpoint
- **Repository Root**: `D:\WorkSphere`
- **Starting Checkpoint**: `7c147776d6d35b862228f7d9147ef6d2635964e2` (`docs(mobile): close phase 16 memory checkpoint`)
- **Target Module**: Phase 17 Mobile Asset Management
- **Prerequisites**: Phase 12 (Mobile Init), Phase 13 (Auth), Phase 14 (Dashboard & Projects), Phase 15 (Tasks), and Phase 16 (Service Requests) all `CLOSED (MEMORY_CHECKPOINT_CLOSED)`.
- **Verdict**: **`PRE_PHASE_17_AUDIT_PASS_READY_FOR_DECISION_FREEZE`**

---

## 2. Canonical Scope & Screen Inventory

### 2.1 Canonical Sources
- `docs/08_DEVELOPMENT_ROADMAP.md` (Section 19: Mobile Service Request & Asset)
- `docs/03_MOBILE_SCREEN_MAP.md` (Section 10: Asset Module)
- `docs/06_API_CONTRACT.md` (Section 14: Asset Module API)
- `docs/05_DATABASE_DESIGN.md` (Section 10: Asset Schema)

### 2.2 Screen Inventory & Roles
Per `docs/03_MOBILE_SCREEN_MAP.md` Section 10.0:

| Canonical Screen | Priority | Intended Audience | Mobile Scope & Capabilities |
|---|---|---|---|
| **Asset List (`SCR-AST-01`)** | P0 | All Authenticated Employees | Shows assigned assets (`/assets/my-assets`). If user holds `ASSET_MANAGE`, tab/toggle enables company-wide asset directory (`/assets`). |
| **Asset Detail (`SCR-AST-02`)** | P0 | All Authenticated Employees (Owner / Manager) | Detailed asset profile, specifications, active assignment, repair history preview, and related service requests. Primary CTA: "Báo hỏng / Yêu cầu dịch vụ" navigating to `CreateServiceRequest` with `{ assetId }`. |
| **Create Asset (`SCR-AST-03`)** | P1 | Managers (`ASSET_MANAGE`) | Asset registration with category, code, name, serial, specs, dates, location. Initial status is always `AVAILABLE`. |
| **Edit Asset (`SCR-AST-04`)** | P1 | Managers (`ASSET_MANAGE`) | Edit asset specifications, location, warehouse status (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`). Protected by optimistic locking `version`. |
| **Asset Assignment (`SCR-AST-05`)** | P1 | Managers (`ASSET_MANAGE`) | Assign available asset (`AVAILABLE`) to employee via Directory user picker with `expectedReturnAt` and `notes`. |
| **Return Asset (`SCR-AST-06`)** | P1 | Managers (`ASSET_MANAGE`) | Reclaim currently active assignment, record `returnCondition`, transition assignment to `RETURNED`, and set `resultingAssetStatus`. Protected by assignment `version`. |

---

## 3. Backend Implementation & Endpoint Parity

### 3.1 Backend Source & Controllers
- Controller: `com.worksphere.asset.web.AssetController` (`/api/v1/assets`)
- Controller: `com.worksphere.asset.web.AssetCategoryController` (`/api/v1/asset-categories`)
- Service: `com.worksphere.asset.application.AssetApplicationService`
- Service: `com.worksphere.asset.application.AssetCategoryApplicationService`

### 3.2 Endpoint Matrix
| Verb | Backend Route | Spring Method | PreAuthorize | Request DTO | Response Type |
|---|---|---|---|---|---|
| `GET` | `/api/v1/asset-categories` | `getActiveCategories` | None (Authenticated) | None | `List<AssetCategoryResponse>` |
| `GET` | `/api/v1/assets/my-assets` | `getMyAssets` | None (Authenticated) | Query: `search`, `categoryId`, `status`, `pageable` | `PagedData<AssetSummaryResponse>` |
| `GET` | `/api/v1/assets` | `getAssets` | `hasAuthority('ASSET_READ')` | Query: `search`, `categoryId`, `status`, `pageable` | `PagedData<AssetSummaryResponse>` |
| `GET` | `/api/v1/assets/{assetId}` | `getAssetDetail` | `hasAuthority('ASSET_READ')` (Admin or Assignee) | Path: `assetId` | `AssetDetailResponse` |
| `POST` | `/api/v1/assets` | `createAsset` | `hasAuthority('ASSET_MANAGE')` | `CreateAssetRequest` | `AssetDetailResponse` (201) |
| `PUT` | `/api/v1/assets/{assetId}` | `updateAsset` | `hasAuthority('ASSET_MANAGE')` | `UpdateAssetRequest` | `AssetDetailResponse` (200) |
| `POST` | `/api/v1/assets/{assetId}/assignments` | `assignAsset` | `hasAuthority('ASSET_MANAGE')` | `AssignAssetRequest` | `AssetAssignmentResponse` (200) |
| `PUT` | `/api/v1/assets/{assetId}/assignments/{assignmentId}/return` | `returnAsset` | `hasAuthority('ASSET_MANAGE')` | `ReturnAssetRequest` | `AssetAssignmentResponse` (200) |
| `GET` | `/api/v1/assets/{assetId}/repair-histories` | `getRepairHistories` | `hasAuthority('ASSET_READ')` (Admin or Assignee) | Path: `assetId` | `List<AssetRepairHistoryResponse>` |
| `POST` | `/api/v1/assets/{assetId}/repair-histories` | `createRepairHistory` | `hasAuthority('ASSET_MANAGE')` | `CreateAssetRepairHistoryRequest` | `AssetRepairHistoryResponse` (201) |

---

## 4. Identity & Authorization Model

### 4.1 Identifiers
- `assetId`: UUID string of Asset entity.
- `assetCode`: Human-readable unique asset identifier (e.g., `LAP-2026-001`), displayed in UI.
- `categoryId`: UUID string of AssetCategory entity.
- `assignmentId`: UUID string of AssetAssignment entity. Used explicitly in return endpoint `PUT /assets/{assetId}/assignments/{assignmentId}/return`.
- `assignedTo`: Directory User UUID of recipient employee.

### 4.2 Query-Level Access Enforcement
In `AssetApplicationService.java`:
- Non-admin employees calling `getAssetDetail` or `getRepairHistories` are strictly checked:
  `assignmentRepository.existsByAssetIdAndAssignedToAndStatus(id, principal.userId(), AssetAssignmentStatus.ACTIVE)`.
  If user is neither system `ADMIN` nor the current active assignee, backend throws `ASSET_ACCESS_DENIED`.
- Mobile client must fail closed if an unauthorized employee attempts direct deep-linking to an unassigned asset.

### 4.3 Permissions vs Role Logic
- `ASSET_READ`: Permission required to query company-wide assets (`/assets`) and view details of unassigned assets.
- `ASSET_MANAGE`: Permission required to create, update, assign, return, or log repairs on assets.
- `ADMIN`: Canonical role providing system-wide bypass for warehouse audits.
- Regular employees without `ASSET_MANAGE` or `ASSET_READ` only access `/assets/my-assets` and the details of their actively assigned assets.

---

## 5. Domain Lifecycle & State Machine

### 5.1 AssetStatus Lifecycle
Enums: `AVAILABLE`, `ASSIGNED`, `MAINTENANCE`, `BROKEN`, `RETIRED`.
- Initial Status: `AVAILABLE` upon creation.
- Assignment: Transitions from `AVAILABLE` to `ASSIGNED` via `POST /assignments`.
- Return: Transitions from `ASSIGNED` to `resultingAssetStatus` (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`) via `PUT /assignments/{assignmentId}/return`.
- Direct Updates (`PUT /assets/{id}`): Can transition between warehouse states (`AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`).
  - Cannot set status directly to `ASSIGNED` via `PUT /assets/{id}` (throws `ASSET_STATUS_TRANSITION_INVALID`).
  - Cannot update status if asset is currently `ASSIGNED` (must use return endpoint).
  - Cannot transition away from `RETIRED` (terminal state).

### 5.2 AssetAssignmentStatus Lifecycle
Enums: `ACTIVE`, `RETURNED`, `LOST`, `DAMAGED`.
- Phase 17 Mobile scope supports `ACTIVE -> RETURNED`.

---

## 6. Concurrency, Optimistic Locking & Mutation Locks

### 6.1 Versioning Contracts
- `Asset` has optimistic locking column `version Long`.
- `UpdateAssetRequest` requires `@NotNull Long version`. 409 conflict maps to `OPTIMISTIC_LOCK_CONFLICT`.
- `AssetAssignment` has optimistic locking column `version Long`.
- `ReturnAssetRequest` requires `@NotNull Long version` (version of the assignment record).
- `AssignAssetRequest` is unversioned at DTO level (backend uses pessimistic `findByIdForUpdate` on Asset to guarantee single active assignee invariant).

### 6.2 Mutation Locks Required (useRef)
All mobile asset mutations must implement synchronous `useRef` locks before async dispatch:
1. Create Asset: `submittingRef`
2. Update Asset: `submittingRef`
3. Assign Asset: `submittingRef` / `assignLockRef`
4. Return Asset: `submittingRef` / `returnLockRef`
5. Create Repair History: `submittingRef` (if included in manager scope)

---

## 7. Cross-Module Navigation: Asset to Service Request

- **Workflow**: On `SCR-AST-02` (Asset Detail), an employee viewing their assigned laptop/equipment can press "Báo hỏng / Yêu cầu sửa chữa".
- **Navigation Dispatch**:
  ```typescript
  navigation.navigate('CreateServiceRequest', { assetId: asset.id });
  ```
- **Contract Fulfillment**: `CreateServiceRequestScreen` (`SCR-SRV-04`) and `MainTabNavigator` route types (`{ assetId?: string } | undefined`) already exist, fully tested and waiting for this link.
- **Backend Relation Rule**: Backend enforces `AssetServiceRequestIntegrationMockMvcTest` rule: a non-admin employee can only link an asset that is currently actively assigned to them (`ASSET_ACCESS_DENIED` otherwise).

---

## 8. Technology & Hardware Boundaries

- **Barcode / QR Code Scanning**:
  - Backend has NO barcode image generation or camera streaming endpoints.
  - Mobile roadmap notes asset lookup by code/serial.
  - External camera / barcode scanner libraries require native modules (`react-native-camera` / `vision-camera`) not currently installed in `mobile/package.json`.
  - Recommendation: Search and filter by `assetCode` / `serialNumber` via text input. Hardware camera scanning is deferred unless an explicit native capability decision is made.
- **File / Image Upload**:
  - `StoredFile` upload remains deferred to File Management module per D-063/D-065 precedents.
  - Asset photo upload is not supported in backend DTOs (`CreateAssetRequest` and `UpdateAssetRequest` have no `imageFileId`).

---

## 9. Key Gaps & Decisions Required for Phase 17 Freeze

Before beginning implementation (Phase 17A), an Architecture Decision (e.g., **D-066**) must be frozen to resolve:
1. **Navigation Structure**: Where does Asset Management live in `MainTabNavigator`?
   - Exactly 5 bottom tabs exist (`Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`).
   - Assets cannot consume a 6th bottom tab slot.
   - Recommended Pattern: Accessible from `More` screen menu ("Tài sản của tôi" / "Quản lý tài sản"), navigating to stack routes `AssetList` (`SCR-AST-01`) and `AssetDetail` (`SCR-AST-02`).
2. **Tabbed View on `SCR-AST-01`**:
   - For employees: views `/api/v1/assets/my-assets`.
   - For managers with `ASSET_MANAGE` / `ASSET_READ`: dual-segment tab ("Của tôi" vs "Tất cả tài sản").
3. **Manager Workflows vs Modals**:
   - Recommend implementing `AssetAssignment` and `ReturnAsset` as bottom sheet modals launched from `AssetDetail` (similar to Phase 16 `RejectResolutionModal` / `EditServiceRequestModal`), avoiding excessive nested screen routes.
4. **Repair History Scope**:
   - `SCR-AST-02` displays repair history list (`GET /api/v1/assets/{assetId}/repair-histories`). Adding new repair history records can be handled via manager modal or staged for Phase 17 auxiliary.

---

## 10. Proposed Phase 17 Subphase Breakdown

- **Phase 17A**: Asset Foundation (Types, API Client Adapter, Status Badges, Error Mapper, Route Contracts)
- **Phase 17B**: Asset List & My Assets (`SCR-AST-01`, `useAssets` / `useMyAssets` list concurrency hooks, `AssetCard`)
- **Phase 17C**: Asset Detail & Service Request Linkage (`SCR-AST-02`, `useAssetDetail`, repair history preview, "Báo hỏng" CTA redirect to `CreateServiceRequest`)
- **Phase 17D**: Create & Edit Asset (`SCR-AST-03`, `SCR-AST-04`, `ASSET_MANAGE` permission gating, optimistic locking conflict recovery)
- **Phase 17E**: Asset Assignment & Return Workflows (`SCR-AST-05`, `SCR-AST-06`, Directory picker integration, assignment versioning)
- **Phase 17F**: Full Integration, Regression, Android Native Verification & Hardening

---

## 11. Conclusion & Readiness

The backend Asset module is complete, robust, and well-tested. All necessary DTOs, controllers, and permission checks are fully operational.
Phase 17 Mobile Asset Management is ready for Architecture Decision & Contract Freeze (**D-066**).

**Verdict**: `PRE_PHASE_17_AUDIT_PASS_READY_FOR_DECISION_FREEZE`
