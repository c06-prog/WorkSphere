# Phase 17A: Asset Contract Foundation Report

## 1. Executive Summary

Phase 17A establishes the contract foundation, DTO types, runtime type guards, API client transport adapter, presentation-safe error mapping, status badge mapping, and navigation route contract definitions for **Mobile Asset Management (Phase 17)** in WorkSphere Mobile per Decision `D-066` and `reports/PHASE_17_ASSET_CONTRACT_FREEZE.md`.

All 10 frozen backend Asset endpoints are fully integrated into `assetApi`. The validation suite has expanded from 98 suites (926 tests) to **101 suites (970 tests)** with **0 failures**, **0 errors in TypeScript (`tsc --noEmit`)**, and **0 errors in ESLint**.

---

## 2. Checkpoint & Environment Baseline

- **Base Checkpoint**: `9320c18824f3439525bf2d3ac43577956247335b`
- **Working Tree**: Clean prior to implementation.
- **Node/React Native Environment**: TypeScript 5+, React Native Paper 5, Jest, Axios.
- **Target Subphase**: Phase 17A (Asset Contract Foundation).

---

## 3. Scope & Deliverables

### A. Asset Domain Enums & DTOs (`mobile/src/features/assets/types/assetTypes.ts`)
- **Domain Enums**:
  - `AssetStatus`: `'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'BROKEN' | 'RETIRED'`
  - `AssetAssignmentStatus`: `'ACTIVE' | 'RETURNED'`
  - `AssetRepairType`: `'MAINTENANCE' | 'REPAIR'`
  - `AssetSortProperty`: `'assetCode' | 'name' | 'status' | 'purchaseDate' | 'createdAt'`
- **Request DTOs**:
  - `CreateAssetRequest`: categoryId, assetCode, name, serialNumber, model, specifications, purchaseDate, purchaseCost, warrantyExpiryDate, location, notes.
  - `UpdateAssetRequest`: categoryId, name, serialNumber, model, specifications, purchaseDate, purchaseCost, warrantyExpiryDate, location, notes, `version` (optimistic locking).
  - `AssignAssetRequest`: assignedToUserId, notes (no version needed; handled via backend pessimistic lock on Asset).
  - `ReturnAssetRequest`: returnNotes, `version` (optimistic locking on AssetAssignment entity).
  - `CreateAssetRepairHistoryRequest`: repairType, description, repairCost, serviceRequestId, repairStartDate, repairEndDate, performedBy, notes.
  - `AssetListQuery`: page, size, search, categoryId, status, assignedToUserId, sort, direction.
- **Response DTOs & Runtime Type Guards**:
  - `AssetCategoryResponse`, `AssetSummaryResponse`, `AssetDetailResponse`, `AssetAssignmentResponse`, `AssetRepairHistoryResponse`.
  - Type guards: `isAssetStatus`, `isAssetAssignmentStatus`, `isAssetRepairType`, `isAssetCategoryResponse`, `isAssetCategoryList`, `isAssetSummaryResponse`, `isAssetSummaryPage`, `isAssetDetailResponse`, `isAssetAssignmentResponse`, `isAssetRepairHistoryResponse`, `isAssetRepairHistoryList`.

### B. Asset API Client (`mobile/src/features/assets/api/assetApi.ts`)
Fully mirrors the 10 frozen REST endpoints from `docs/06_API_CONTRACT.md` Section 14:
1. `listCategories()`: `GET /asset-categories`
2. `getMyAssets(query)`: `GET /assets/my-assets`
3. `getAssets(query)`: `GET /assets`
4. `getAssetDetail(assetId)`: `GET /assets/{assetId}`
5. `createAsset(request)`: `POST /assets`
6. `updateAsset(assetId, request)`: `PUT /assets/{assetId}`
7. `assignAsset(assetId, request)`: `POST /assets/{assetId}/assignments`
8. `returnAsset(assetId, assignmentId, request)`: `PUT /assets/{assetId}/assignments/{assignmentId}/return`
9. `getRepairHistories(assetId)`: `GET /assets/{assetId}/repair-histories`
10. `createRepairHistory(assetId, request)`: `POST /assets/{assetId}/repair-histories`
- Query serializer `serializeAssetListQuery` handles deterministic pagination, filtering, and sorting parameters.

### C. Presentation-Safe Error Mapper (`mobile/src/features/assets/errors/assetErrorMapper.ts`)
- Standardized UI error contract (`AssetPresentationError`) with:
  - `message`: localized Vietnamese user message.
  - `placement`: `'form' | 'dialog' | 'banner' | 'status' | 'assignments' | 'repair' | 'general'`.
  - `isConflict`: boolean indicating optimistic concurrency conflict or business uniqueness violation.
  - `isNotFound`: boolean for missing resources.
  - `isForbidden`: boolean for authorization refusal.
  - `fieldErrors`: dictionary of field-level validation messages.
- Specific mappings for domain codes: `ASSET_NOT_FOUND`, `ASSET_CATEGORY_NOT_FOUND`, `ASSET_CATEGORY_ALREADY_INACTIVE`, `OPTIMISTIC_LOCK_CONFLICT`, `ASSET_NOT_AVAILABLE`, `ASSET_ALREADY_ASSIGNED`, `ASSET_STATUS_TRANSITION_INVALID`, `ASSET_RETIRED`, `ASSET_CODE_ALREADY_EXISTS`, `ASSET_SERIAL_NUMBER_ALREADY_EXISTS`, `ASSET_ASSIGNMENT_NOT_FOUND`, `ASSET_ASSIGNMENT_ALREADY_INACTIVE`, `ASSET_ACCESS_DENIED`, `USER_INACTIVE`, `SERVICE_REQUEST_NOT_FOUND`.
- Normalized fallback categories: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `NETWORK_ERROR`, `TIMEOUT`, `SERVER_ERROR`.

### D. UI & Navigation Integration
- **StatusBadge**: Extended category `type="asset"` in `mobile/src/shared/components/StatusBadge.tsx`:
  - `AVAILABLE`: `Sẵn sàng` (theme success container)
  - `ASSIGNED`: `Đang cấp phát` (theme primary container)
  - `MAINTENANCE`: `Bảo dưỡng` (theme warning container)
  - `BROKEN`: `Hỏng` (theme error container)
  - `RETIRED`: `Thanh lý` (theme surfaceVariant container)
- **Navigation Route Contracts**: Extended `MainTabParamList` in `mobile/src/app/navigation/types.ts`:
  - `AssetList: undefined`
  - `AssetDetail: { assetId: string }`
  - `CreateAsset: undefined`
  - Verified route cross-linking: `CreateServiceRequest: { assetId?: string } | undefined` was already preserved.

---

## 4. Verification & Validation Evidence

### A. TypeScript Typecheck
```powershell
npm --prefix mobile run typecheck
```
**Result**: `tsc --noEmit` exited with code 0 (0 errors).

### B. ESLint
```powershell
npm --prefix mobile run lint
```
**Result**: 0 errors across entire workspace. 48 historical warnings retained (all in `features/organization` and `features/projects` for `react-native/no-inline-styles`). 0 warnings or errors in `features/assets` or new tests.

### C. Jest Unit Tests
```powershell
npm --prefix mobile test -- --runInBand
```
**Result**:
- **Test Suites**: 101 passed, 101 total (+3 new suites in `__tests__/assets/`)
- **Tests**: 970 passed, 970 total (+44 new unit tests)
- **Snapshots**: 0 total
- **Time**: 45.708 s

---

## 5. Subphase Staging for Phase 17B

With Phase 17A complete, the contract, types, API methods, and error handlers are established for Phase 17B:
- **17B Scope**:
  - `useAssetList` hook supporting pagination, category filtering, search, status filtering, and employee toggle (`getMyAssets` vs `getAssets`).
  - `AssetListScreen` with segmented control (`Tài sản của tôi` vs `Tất cả tài sản`), search bar, status filter chips, pull-to-refresh, infinite scroll.
  - `AssetCard` component rendering assetCode, name, category, serialNumber, and `StatusBadge(type="asset")`.
  - Floating Action Button (FAB) for `CreateAsset` when user has `ROLE_ADMIN` or `ROLE_OFFICE_ADMIN`.
