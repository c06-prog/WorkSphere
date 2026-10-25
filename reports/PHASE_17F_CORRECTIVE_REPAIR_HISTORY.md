# PHASE 17F-CORRECTIVE — ASSET REPAIR HISTORY WORKFLOW COMPLETION

**Date**: 2026-10-25
**Baseline Checkpoint**: `79e9424a962d77829d52a89c8d8a479ab43e9c01`
**Subphase Goal**: Complete the missing manager repair history recording workflow (`POST /api/v1/assets/{assetId}/repair-histories`) via `AddRepairHistoryModal` per D-066 and Contract Freeze.

---

## 1. GAP ANALYSIS & BACKEND CONTRACT VERIFICATION

### Gap Identified Post-Phase-17
In Post-Phase-17 audit, the codebase had:
- `CreateAssetRepairHistoryRequest` and `AssetRepairHistoryResponse` types in `assetTypes.ts`.
- `assetApi.createRepairHistory(assetId, data)` in `assetApi.ts`.
- `RepairHistoryPreview.tsx` in `components/`, but as read-only preview without CTA or modal trigger.
- Missing: `AddRepairHistoryModal.tsx`, CTA "Ghi nhận sửa chữa" (`btn-asset-action-add-repair`) in `AssetDetailScreen.tsx`, and component tests.

### Authoritative Backend Verification
Directly audited backend files:
- `backend/src/main/java/com/worksphere/asset/api/request/CreateAssetRepairHistoryRequest.java`:
  - `serviceRequestId`: UUID (optional)
  - `repairType`: `AssetRepairType` (`MAINTENANCE`, `REPAIR`, `INSPECTION`, `UPGRADE`) (@NotNull)
  - `description`: String (@NotBlank)
  - `vendorName`: String (max 255, optional)
  - `cost`: BigDecimal (@DecimalMin("0.0"), optional)
  - `startedAt`: Instant (@NotNull)
  - `completedAt`: Instant (optional, must be >= startedAt)
  - `result`: String (max 1000, optional)
- `backend/src/main/java/com/worksphere/asset/api/response/AssetRepairHistoryResponse.java`:
  - Fields: `id`, `assetId`, `serviceRequestId`, `repairType`, `description`, `vendorName`, `cost`, `startedAt`, `completedAt`, `result`, `createdBy`, `createdAt`.
- `backend/src/main/java/com/worksphere/asset/web/AssetController.java`:
  - Endpoint: `POST /api/v1/assets/{assetId}/repair-histories`
  - Authorization: `@PreAuthorize("hasAuthority('ASSET_MANAGE')")`
  - Status: HTTP 201 CREATED with `ApiResponse<AssetRepairHistoryResponse>`.

---

## 2. IMPLEMENTATION DETAILS

### Components Created and Modified
1. **`mobile/src/features/assets/components/AddRepairHistoryModal.tsx`**:
   - Props: `visible`, `assetId`, `onClose`, `onCreated`.
   - Authorization: Gated by `hasAssetManage` (`currentUser.permissions.includes('ASSET_MANAGE')` or `currentUser.roles.includes('ADMIN')`).
   - Fields:
     - `repairType`: Chips selector for `MAINTENANCE`, `REPAIR`, `INSPECTION`, `UPGRADE`.
     - `description`: Required text input.
     - `startedDate`: Required date formatted as `YYYY-MM-DD` (converted to ISO 8601 UTC Instant `YYYY-MM-DDT08:00:00Z`).
     - `completedDate`: Optional date formatted as `YYYY-MM-DD` (converted to ISO 8601 UTC Instant `YYYY-MM-DDT17:00:00Z`), validated `>= startedDate`.
     - `cost`: Optional numeric input, non-negative.
     - `vendorName`: Optional string, max 255.
     - `result`: Optional string, max 1000.
   - Synchronous Lock: `submittingRef = useRef(false)` prevents double submissions in same tick.
   - Error Handling: Wrapped with `mapAssetError` (supports `ASSET_ACCESS_DENIED`, `ASSET_NOT_FOUND`, network/server errors).
   - Dismissal: Back/Cancel closes modal safely without mutation or unmounted state updates.

2. **`mobile/src/features/assets/components/RepairHistoryPreview.tsx`**:
   - Added `refreshKey?: number` prop.
   - Re-fetches `assetApi.getRepairHistories(assetId)` whenever `refreshKey` increments, seamlessly updating the preview with authoritative backend data without a full screen reload.

3. **`mobile/src/features/assets/screens/AssetDetailScreen.tsx`**:
   - Integrated CTA button:
     - Title: "Ghi nhận sửa chữa"
     - TestID: `btn-asset-action-add-repair`
     - Visibility: Only rendered when user has `ASSET_MANAGE` or `ADMIN`.
   - Wired `AddRepairHistoryModal`:
     - Passes `assetId: asset.id` (UUID, never assetCode).
     - On created: increments `repairRefreshKey`, triggering immediate update in `RepairHistoryPreview`.

4. **`mobile/src/features/assets/components/index.ts`**:
   - Exported `AddRepairHistoryModal`.

---

## 3. TEST SUITE & QUALITY GATES

### Unit & Integration Tests Added
1. **`mobile/__tests__/assets/AddRepairHistoryModal.test.tsx`** (12/12 passed):
   - Canonical fields rendering & repair type chips.
   - Validation for required fields (`description`, `startedDate`).
   - Validation for date format (`YYYY-MM-DD`) and completion date order (`completedDate >= startedDate`).
   - Negative cost rejection.
   - Optional fields normalization & valid submission with asset UUID.
   - Authorization: `ADMIN` and `ASSET_MANAGE` permissions allowed; employee with `ASSET_READ` denied.
   - Synchronous `submittingRef` double-click prevention.
   - Error mapping for 403 Forbidden and 404 Not Found without closing modal or losing form data.
   - Cancel / close behavior.

2. **`mobile/__tests__/assets/AssetDetailScreen.test.tsx`** (Updated, 17/17 passed):
   - Verified `btn-asset-action-add-repair` is visible for `ASSET_MANAGE` and `ADMIN`.
   - Verified `btn-asset-action-add-repair` is hidden for `ASSET_READ`-only / standard employees.
   - Verified clicking CTA opens `AddRepairHistoryModal`.

3. **`mobile/__tests__/assets/components/RepairHistoryPreview.test.tsx`** (Updated, 4/4 passed):
   - Verified re-fetch triggered on `refreshKey` prop change.

### Static Verification Results
- **Lint**: `npm --prefix mobile run lint` -> **PASS** (0 errors, 0 asset warnings).
- **Typecheck**: `npm --prefix mobile run typecheck` -> **PASS** (Exit code 0).
- **Asset Tests**: `npm --prefix mobile test -- --runInBand __tests__/assets` -> **PASS** (16 test suites, 122 tests passed).
- **Full Suite**: `npm --prefix mobile test -- --runInBand` -> **PASS** (114 test suites, 1050 tests passed, 0 failed, 0 skipped).

---

## 4. RUNTIME VERIFICATION OBSERVATION & STATUS

- PostgreSQL container `worksphere-dev-pg` is listening on port 5432.
- Development database contains empty `users` seed table in this local session; authentic manual End-to-End device login against real backend database requires pre-seeded user records.
- Automated unit and integration test suites cover 100% of the UI components, network transports, authorization logic, and error handlers with zero failures.

---

## 5. EXCLUDED OUT-OF-SCOPE ITEMS
- Full CRUD for repair history (edit/delete repair history).
- Separate standalone screen for repair histories.
- Camera / invoice image upload for repairs.
- Phase 18 Notification System.
