# Phase 17D Report: Asset Create & Edit Screens (SCR-AST-03 & SCR-AST-04)

## Executive Summary
Phase 17D delivers `SCR-AST-03` (Create Asset Screen) and `SCR-AST-04` (Edit Asset Modal), implementing full client-side validation, permission-gated controls (`ASSET_MANAGE` or `ADMIN`), category selection modal, optimistic locking reconciliation with version tracking, and seamless integration into the Asset detail/list navigation flows.

## 1. Scope & Deliverables
1. **SCR-AST-03: `CreateAssetScreen`**:
   - Replaced temporary placeholder route in `AppNavigator.tsx`.
   - Access control gating: requires `ASSET_MANAGE` or `ADMIN`. Unauthorized access renders `PermissionDeniedView`.
   - Form fields: `assetCode` (with regex validation `^[A-Z0-9][A-Z0-9_-]{1,49}$`), `name` (required), `categoryId` (via modal picker), `modelNumber`, `serialNumber`, `purchaseDate` (YYYY-MM-DD validation), `purchasePrice` (numeric >= 0), `warrantyExpiryDate` (YYYY-MM-DD), `specifications`, `description`.
   - Synchronous submit lock (`submittingRef`) prevents double submissions.
   - Successful creation navigates to `AssetDetail` with `assetId: created.id`.
2. **SCR-AST-04: `EditAssetModal`**:
   - Modal bottom sheet launched from `AssetDetailScreen` via top bar action button and quick-action section (gated with `canManage`).
   - `assetCode` is presented read-only per D-066 contract.
   - Status transitions: when asset is `ASSIGNED`, status changes are disabled with explanatory hint. When unassigned, status picker allows `AVAILABLE`, `MAINTENANCE`, `BROKEN`, `RETIRED`.
   - Optimistic Locking: includes `version: asset.version` in `UpdateAssetRequest`.
   - 409 Conflict handling: triggers `ConfirmationDialog` prompting user to reload latest asset data.
3. **`AssetCategorySelectModal`**:
   - Reusable search-and-select bottom sheet for asset categories.
   - Instant search filtering by category name and code without exposing UUIDs to users.
4. **Error Mapper Extension**:
   - Added mapping for `ASSET_SERIAL_ALREADY_EXISTS`.
   - Standardized Vietnamese error messages for duplicate codes, optimistic locking, and invalid status transitions.

## 2. Test Verification & Quality Gates
- **Typecheck**: `npm --prefix mobile run typecheck` (0 errors).
- **ESLint**: `npm --prefix mobile run lint` (0 errors, preserved 48 historical warnings, 0 warnings in `features/assets`).
- **Jest Test Suite**:
  - Total suites: 110 passed, 110 total.
  - Total tests: 1021 passed, 1021 total.
  - Snapshots: 0.
  - Asset-specific test suites (12 suites, 93 tests) all passing:
    - `CreateAssetScreen.test.tsx`: 9 tests.
    - `EditAssetModal.test.tsx`: 4 tests.
    - `AssetCategorySelectModal.test.tsx`: 3 tests.
    - `AssetDetailScreen.test.tsx`: 12 tests.
    - `AssetListScreen.test.tsx`: 10 tests.
    - `assetApi.test.ts`, `assetTypes.test.ts`, `assetErrorMapper.test.ts`, `useMyAssets.test.tsx`, `useAllAssets.test.tsx`, `useAssetDetail.test.tsx`, `useAssetRepairHistories.test.tsx`.
