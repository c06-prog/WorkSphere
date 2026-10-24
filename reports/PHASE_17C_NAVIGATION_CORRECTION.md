# PHASE 17C-NAV — ASSET STACK NAVIGATION CONTRACT CORRECTION REPORT

## Baseline Checkpoint
- **Repository**: `D:\WorkSphere`
- **Branch**: `main`
- **Baseline Checkpoint**: `af044e1937778489ca80ff4c38d6151e6242dded`
- **Corrective Subphase**: `PHASE 17C-NAV`
- **Status**: `COMPLETED / PASS`

---

## 1. Problem Statement & Root Cause
In Phase 17C, `AssetList` and `AssetDetail` were registered as hidden routes in `MainTabNavigator.tsx` (`tabBarButton: () => null`, `tabBarItemStyle: { display: 'none' }`).
This directly violated Decision **D-066**, which stipulates:
1. `AssetList`, `AssetDetail`, and `CreateAsset` must be registered as **Stack Screens** in an Authenticated App Stack (`AppNavigator` / `AppStack`), not consuming `Tab.Navigator` routes.
2. Bottom Tab Navigator (`MainTabs`) must strictly and only maintain the canonical bottom tabs: `Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`.
3. Auxiliary Asset routes must not use `tabBarButton: () => null` workarounds.

Additionally:
- Lint warnings increased from 48 (in Phase 17B) to 74 in Phase 17C due to 26 newly introduced inline styles (6 in `RepairHistoryPreview.tsx`, 20 in `AssetDetailScreen.tsx`).
- Phase 17B `AssetListQuery` serializer parameters required audit against backend `AssetController` endpoints.

---

## 2. Structural & Architectural Corrections

### A. Navigation Hierarchy Alignment
1. **`AppNavigator` (`mobile/src/app/navigation/AppNavigator.tsx`)**:
   - Created `createNativeStackNavigator<AppStackParamList>()` containing:
     - `MainTabs`: Renders `MainTabNavigator` (`headerShown: false`).
     - `AssetList`: Renders `AssetListScreen` (`headerShown: false`, custom header in screen).
     - `AssetDetail`: Renders `AssetDetailScreen` (`headerShown: false`, custom header in screen).
     - `CreateAsset`: Renders placeholder screen for `SCR-AST-03` (`headerTitle: 'Tạo tài sản mới'`).
2. **`RootNavigator` (`mobile/src/app/navigation/RootNavigator.tsx`)**:
   - When session state is `AUTHENTICATED`, renders `AppNavigator` as `Main`.
3. **`MainTabNavigator` (`mobile/src/app/navigation/MainTabNavigator.tsx`)**:
   - Removed `AssetList` and `AssetDetail` `Tab.Screen` definitions and imports.
   - Zero asset routes registered as bottom tabs.
4. **Navigation Types (`mobile/src/app/navigation/types.ts`)**:
   - Defined `AppStackParamList`:
     ```typescript
     export type AppStackParamList = {
       MainTabs: undefined;
       AssetList: undefined;
       AssetDetail: { assetId: string };
       CreateAsset: undefined;
     };
     ```
   - Composite navigation prop for tabs (`MainTabNavProp`) now composes `BottomTabNavigationProp<MainTabParamList, RouteName>` with `NativeStackNavigationProp<AppStackParamList>`.
   - Asset screens typed with `AppStackNavProp<'AssetList'>`, `AppStackScreenRouteProp<'AssetDetail'>`, and `AssetDetailNavigationProp` (supporting cross-module navigation to `CreateServiceRequest` and `ServiceRequestDetail`).

### B. Lint Warning Elimination
- Refactored all 26 inline styles across `RepairHistoryPreview.tsx` (6) and `AssetDetailScreen.tsx` (20) into static rules in `StyleSheet.create`.
- Verified warning count returned strictly to the historical baseline: exactly **48 warnings** (from Phase 14E projects and organization components), **0 asset warnings**, **0 errors**.

### C. Phase 17B Query Serializer Audit
- Audited backend `com.worksphere.asset.web.AssetController`:
  - `GET /api/v1/assets`: Supports `pageable` (page, size, sort), `search`, `categoryId`, `status`, `assignedTo`.
  - `GET /api/v1/assets/my-assets`: Supports `pageable` (page, size, sort), `search`, `categoryId`, `status`.
- Audited `mobile/src/features/assets/api/assetApi.ts`:
  - `serializeAssetListQuery`: Encodes `page`, `size`, `sort`, `search`, `categoryId`, `status`.
  - **Verdict**: 100% compliant with backend endpoint parameters.

---

## 3. Verification & Test Evidence

### A. Static Analysis & Type Checking
- `npm --prefix mobile run typecheck`: **0 errors** (Exit code 0).
- `npm --prefix mobile run lint`: **0 errors, 48 warnings** (Exit code 0, 0 asset warnings).

### B. Navigation Contract Regression Tests
- Executed `__tests__/navigation.test.tsx`:
  - `F. D-066 Architecture: Asset routes are Stack screens, NOT registered in Tab.Navigator` (PASS).
  - `G. D-066 Navigation flow: More -> AssetList navigates successfully via AppStack` (PASS).
  - Total: **10 passed, 10 total** (Exit code 0).

### C. Asset Module Tests
- Executed `__tests__/assets`:
  - 9 suites, 75 tests passed, 0 failures, 0 skipped (Exit code 0).

### D. Full Mobile Regression Suite
- Executed `npm --prefix mobile test -- --runInBand`:
  - **107 suites passed, 107 total**.
  - **1003 tests passed, 1003 total**.
  - 0 failures, 0 snapshots, 0 skipped (Exit code 0).

---

## 4. Phase 17D Readiness
- Navigation tree now strictly aligns with D-066.
- Stack parameters for `CreateAsset` are registered and ready for Phase 17D form implementation.
- Marker: `PHASE_17C_NAVIGATION_CORRECTED_READY_FOR_17D`.
