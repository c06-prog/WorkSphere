# Phase 17B: Asset List & My Assets Report

## 1. Executive Summary

Phase 17B delivers **SCR-AST-01 Asset List Screen**, dual query custom hooks (`useMyAssets` and `useAssets`), the presentation `AssetCard` component, and integration into the `More` menu without disturbing the canonical 5 bottom tabs, per Decision `D-066` and `reports/PHASE_17_ASSET_CONTRACT_FREEZE.md`.

- **Default Operational Mode**: "Của tôi" (`useMyAssets` calling `GET /assets/my-assets`) is loaded by default for all authenticated employees.
- **Directory Mode**: "Tất cả tài sản" (`useAssets` calling `GET /assets`) is strictly gated behind `ASSET_READ` permission or `ADMIN` role. If unauthorized, the segmented control is hidden entirely and `/assets` is never called.
- **Identifier Integrity**: Selecting an asset navigates to `AssetDetail` strictly passing `assetId` (UUID); `assetCode` is never used as a route parameter.
- **Navigation Invariant**: Exactly 5 bottom tabs (`Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`) are strictly preserved. `AssetList` is registered as a hidden stack route accessed via `More`.
- **Quality Gates**: ESLint 0 errors (48 historical warnings preserved), TypeScript 0 errors (`tsc --noEmit`), 104 test suites / 981 tests passed (0 failures, 0 skipped, 0 snapshots).

---

## 2. Checkpoint & Environment Baseline

- **Base Checkpoint**: `5ffbadca409044020918d59b06e18278752be5cd`
- **Target Subphase**: Phase 17B (Asset List & My Assets)
- **Node/React Native Environment**: TypeScript 5+, React Native 0.76+, React Navigation Bottom Tabs & Native Stack.

---

## 3. Scope & Deliverables

### A. Query Hooks (`mobile/src/features/assets/hooks/`)
- `useMyAssets`:
  - Directly queries `GET /assets/my-assets` with page, size=20, status filter, and sort (`createdAt,desc`).
  - Monotonic query generation counter (`queryGenerationRef`) discarding stale network responses.
  - Synchronous `paginationLockRef` preventing concurrent duplicate pagination triggers.
  - Page-append deduplication by `id` preserving backend sort order.
  - Pull-to-refresh resetting pagination cleanly while preserving the active list during fetching.
- `useAssets`:
  - Queries `GET /assets` with 300ms debounced search, category filter, status filter, and pagination.
  - Loads active asset categories safely on mount (`assetApi.listCategories()`).
  - Same concurrency and pagination guarantees as `useMyAssets`.

### B. UI Components & Screens (`mobile/src/features/assets/`)
- `AssetCard` ([`AssetCard.tsx`](file:///d:/WorkSphere/mobile/src/features/assets/components/AssetCard.tsx)):
  - Renders `assetCode`, `category.name`, `name`, `model`, `serialNumber`, `location`, `currentAssignee.fullName`, and `StatusBadge(type="asset")`.
  - Accessible touch target (>= 48dp), accessible label formatting.
  - `onPress` callback passes `asset.id` (strictly UUID).
- `AssetListScreen` ([`AssetListScreen.tsx`](file:///d:/WorkSphere/mobile/src/features/assets/screens/AssetListScreen.tsx)):
  - Dual-mode segmented control: "Của tôi" (default) and "Tất cả tài sản" (gated by `ASSET_READ` or `ADMIN`).
  - Status filter chips: `Tất cả trạng thái`, `AVAILABLE`, `ASSIGNED`, `MAINTENANCE`, `BROKEN`, `RETIRED`.
  - Directory search bar and category filter chips visible when in "Tất cả tài sản" mode.
  - Full-screen `LoadingIndicator` on initial load, `ErrorState` with retry on failure, differentiated empty states ("Chưa có tài sản nào" vs "Không tìm thấy tài sản").
  - `FlatList` with `onEndReached` (threshold 0.3), footer pagination loading, and inline retry on pagination error.

### C. Navigation Structure & More Entry Integration
- `MoreScreen` ([`MoreScreen.tsx`](file:///d:/WorkSphere/mobile/src/features/more/screens/MoreScreen.tsx)):
  - Dynamically renders button title:
    - `"Quản lý tài sản"` if user has `ASSET_READ`, `ASSET_MANAGE`, or `ADMIN`.
    - `"Tài sản của tôi"` for regular employees.
  - On press, navigates to `AssetList`.
- `MainTabNavigator` ([`MainTabNavigator.tsx`](file:///d:/WorkSphere/mobile/src/app/navigation/MainTabNavigator.tsx)):
  - Registered `AssetList` with `tabBarButton: () => null` and `tabBarItemStyle: { display: 'none' }`.
  - Exactly 5 bottom tabs preserved:
    1. `Dashboard`
    2. `Projects`
    3. `Tasks`
    4. `ServiceRequests`
    5. `More`

---

## 4. Permission Gating & Security Analysis

1. **Permission Check**:
   ```typescript
   const hasAssetRead =
     (currentUser?.permissions?.includes('ASSET_READ') ?? false) ||
     (currentUser?.roles?.some(r => r.toUpperCase() === 'ADMIN') ?? false);
   ```
2. **Behavior**:
   - `hasAssetRead === false`: Segmented control is omitted from the UI (`return null`). Mode stays fixed to `'my-assets'`. `allAssetsState` is initialized with `autoLoad: false` and never called.
   - `hasAssetRead === true`: Segmented control is rendered allowing the user to view company directory (`GET /assets`).
3. **Data Isolation**:
   - `myAssetsState` and `allAssetsState` maintain completely separate React states (`assets`, `page`, `hasNext`, `error`, `filters`). Switching tabs swaps the active reference for `FlatList` without blending or mutating data.

---

## 5. Verification & Validation Evidence

### A. TypeScript Typecheck
```powershell
npm --prefix mobile run typecheck
```
**Result**: `tsc --noEmit` exited with code 0 (0 errors).

### B. ESLint
```powershell
npm --prefix mobile run lint
```
**Result**: 0 errors. Exactly 48 historical warnings preserved (all in `features/organization` and `features/projects`). 0 warnings or errors in `features/assets` or `features/more`.

### C. Jest Unit Tests
```powershell
npm --prefix mobile test -- --runInBand __tests__/assets
```
**Result**:
- 6 test suites passed (100%), 55 tests passed (100%).

### D. Navigation Suite Verification
```powershell
npm --prefix mobile test -- --runInBand __tests__/navigation.test.tsx
```
**Result**:
- Passed. Verified all 5 canonical tabs render in exact order (`Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`). Auxiliary routes remain hidden.

### E. Full Mobile Test Suite
```powershell
npm --prefix mobile test -- --runInBand
```
**Result**:
- **Test Suites**: 104 passed, 104 total (+3 new test suites in `__tests__/assets/`)
- **Tests**: 981 passed, 981 total (+11 new tests)
- **Snapshots**: 0 total
- **Time**: 42.388 s

---

## 6. Staging for Subsequent Phases

- **Phase 17C**: `SCR-AST-02 AssetDetailScreen` (rendering full asset details, assignment history, repair history, and contextual action buttons).
- **Phase 17D**: `SCR-AST-03 Create/Edit Asset Screen` (`CreateAssetScreen`, category picker, versioned update payload).
- **Phase 17E**: Asset Assignment & Return Workflows (Assign Asset modal, Return Asset modal with `AssetAssignment.version`).
- **Phase 17F**: Asset Maintenance & Repair History (Create repair history, link to service request).
- **Phase 17G**: Integration & Hardening (E2E smoke, final regression tests).
