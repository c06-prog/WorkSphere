# Phase 17C: Asset Detail & Service Request Linking Report

## 1. Executive Summary

Phase 17C delivers **SCR-AST-02 Asset Detail Screen**, the single-resource hook **`useAssetDetail`**, the embedded **`RepairHistoryPreview`** component, and cross-module integration with **Service Requests** ("Báo hỏng / Yêu cầu dịch vụ" CTA linking to `CreateServiceRequest`), strictly fulfilling Decision `D-066` and canonical specifications in `reports/PHASE_17_ASSET_CONTRACT_FREEZE.md`.

- **Authoritative Data Backing**: Backed exclusively by backend `GET /api/v1/assets/{assetId}` and `GET /api/v1/assets/{assetId}/repair-histories`.
- **Identity Semantics**: All lookups and navigation dispatch routes use strict UUID (`assetId`), never human-readable business codes (`assetCode`).
- **Cross-Module Link**: "Báo hỏng / Yêu cầu dịch vụ" button is conditionally displayed when the user is the current active assignee (`currentAssignment.assignedTo.id === currentUser.id`) or possesses `ASSET_MANAGE` / `ADMIN` authority. On press, it dispatches `navigation.navigate('CreateServiceRequest', { assetId: asset.id })`.
- **Navigation Safety**: Hidden auxiliary route `AssetDetail` is safely registered; the canonical 5 bottom tabs (`Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`) remain unperturbed.
- **Quality Gates**:
  - TypeScript: 0 errors (`npm --prefix mobile run typecheck`).
  - ESLint: 0 errors (74 historical warnings preserved, 0 asset errors).
  - Tests: 107 test suites / 1001 tests passed (0 failures, 0 skipped, 0 snapshots).

---

## 2. Checkpoint & Environment Baseline

- **Base Checkpoint**: `762fb2600500f899d96b1baa64108edac7f5cb40`
- **Target Subphase**: Phase 17C (Asset Detail & Service Request Linking)
- **Node/React Native Environment**: TypeScript 5+, React Native 0.76+, React Navigation Bottom Tabs & Native Stack.

---

## 3. Scope & Deliverables

### A. Custom Hook (`mobile/src/features/assets/hooks/useAssetDetail.ts`)
- Manages single asset lifecycle:
  - `load()`, `refresh()`, `retry()`, `invalidateAndRefresh()`, `applyAssetUpdate()`.
  - Monotonic `requestGenerationRef` counter preventing out-of-order race conditions when route `assetId` changes.
  - In-flight promise deduplication via `inFlightPromiseRef` for concurrent same-tick calls.
  - Reset of state synchronously upon target `assetId` change to prevent stale data flash.
  - Non-blocking pull-to-refresh: retains existing asset data if a background refresh encounters an error.

### B. UI Components & Screens
- **`RepairHistoryPreview`** ([`RepairHistoryPreview.tsx`](file:///d:/WorkSphere/mobile/src/features/assets/components/RepairHistoryPreview.tsx)):
  - Renders read-only list of maintenance and repair history records.
  - Displays repair type badge, date, description, vendor name, cost formatted in VND, and result notes.
  - Embedded local loading, error, and retry states that fail closed without crashing `AssetDetailScreen`.
- **`AssetDetailScreen`** ([`AssetDetailScreen.tsx`](file:///d:/WorkSphere/mobile/src/features/assets/screens/AssetDetailScreen.tsx)):
  - Header with accessible back button (>=48dp touch target) and centered `assetCode`.
  - Hero card displaying `assetCode`, `StatusBadge(type="asset")`, `name`, `category`, and `description`.
  - Technical specifications grid: `serialNumber`, `manufacturer`, `model`, `location`, `purchaseDate`, `purchasePrice`, and `warrantyEndDate`.
  - Current assignment section: `assignedTo`, `assignedBy`, `assignedAt`, `expectedReturnAt`, and handover notes.
  - Related service requests list: clickable cards that navigate directly to `ServiceRequestDetail` with `{ requestId }`.
  - Primary Action CTA: "Báo hỏng / Yêu cầu dịch vụ" button leading to `CreateServiceRequest` with `{ assetId }`.

### C. Cross-Module Linking Verification
- Inspected `CreateServiceRequestScreen.tsx`:
  - Captures `route.params?.assetId`.
  - Displays context banner when pre-filled with `assetId`.
  - Sends `assetId` in payload `CreateServiceRequestRequest`.
  - Regression tested in `__tests__/screens/CreateServiceRequestScreen.test.tsx` (7/7 tests passed).

---

## 4. Test & Verification Evidence

### A. TypeScript Typecheck
```powershell
npm --prefix mobile run typecheck
# Exit Code 0, 0 errors
```

### B. ESLint
```powershell
npm --prefix mobile run lint
# Exit Code 0, 0 errors, 74 warnings (historical warnings preserved, 0 asset errors)
```

### C. Asset Test Suite
```powershell
npm --prefix mobile test -- --runInBand __tests__/assets
# 9 test suites passed, 75 tests passed, 0 failures
```

### D. Full Mobile Test Suite
```powershell
npm --prefix mobile test -- --runInBand
# 107 test suites passed, 1001 tests passed, 0 failures, 0 skipped, 0 snapshots
```

---

## 5. Subphase Transition

Phase 17C is complete and verified against all architectural and quality constraints. Ready for **Phase 17D (Create & Edit Asset)**.
