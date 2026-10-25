# Phase 17F-Final Report: Ephemeral E2E Fixture and Android Repair History Validation

## 1. Executive Summary

Phase 17F-Final successfully completed the full, live end-to-end runtime validation of Asset Repair History recording on an actual Android Emulator (`Medium_Phone`, API 35, x86_64).

To resolve the environmental gating without violating canonical schemas or hardcoding non-production credentials, canonical development-only fixture provisioners were introduced in the backend (`application-dev.yml`), activated strictly via environment variables.

With this, an ephemeral admin user and category were provisioned, an asset was targeted, and the user successfully navigated through the real Android app:
**Login -> More Screen -> Asset List ("Tất cả tài sản") -> Asset Detail -> "Ghi nhận sửa chữa" CTA -> AddRepairHistoryModal -> Submit -> Authoritative Backend Persistence & Preview Refresh.**

All quality gates, backend tests, mobile lint, TypeScript checks, and mobile unit tests passed. All runtime services (Metro Bundler, Android Emulator, and backend Dev Server) have been cleanly terminated.

---

## 2. Ephemeral E2E Fixture Architecture

To support end-to-end validation under canonical domain boundaries:
1. **Configurable E2E Role in `E2eUserProvisioner`**:
   - `worksphere.dev.e2e-user.role` bound to env var `WORKSPHERE_E2E_ROLE` (default `EMPLOYEE`, supports `ADMIN` via explicit allowlist).
   - Dynamically attaches the configured system role to the provisioned user account.
2. **Dedicated Dev Asset Category Fixture (`DevAssetFixtureProvisioner`)**:
   - Gated under `worksphere.dev.e2e-asset-fixture.enabled` (`WORKSPHERE_DEV_E2E_ASSET_FIXTURE_ENABLED`).
   - Provisions canonical category `E2E_ASSET_CAT` ("Thiết bị văn phòng E2E"), complying with check constraint `code ~ '^[A-Z0-9_]{2,50}$'`.
3. **Lazy Collection Resolution in `JwtAuthenticationFilter`**:
   - Added `userRepository.findActiveWithRolesById(UUID id)` with `LEFT JOIN FETCH u.roles r LEFT JOIN FETCH r.permissions` to prevent Hibernate `LazyInitializationException` outside transactional boundaries.

---

## 3. Real Android Runtime Verification Evidence

### Workflow Steps Executed on `emulator-5554`:
1. **Cold Boot & Connection**:
   - AVD: `Medium_Phone` (Android 15 / API 35 / x86_64) booted cleanly.
   - Metro Bundler running on port 8081; ADB reverse proxy for ports 8081 and 8080 established.
2. **Authentication**:
   - App opened on Login screen.
   - Authenticated with ephemeral credentials; JWT access and refresh tokens received.
3. **Navigation & Verification**:
   - Navigated to `More` tab -> "Quản lý tài sản" -> "Tất cả tài sản" tab.
   - Selected asset `E2E-RH-EQWYKA` (`6a3a1250-769e-45aa-b19a-69a27660cf4e`).
   - Verified initial state: "Chưa có lịch sử sửa chữa hoặc bảo dưỡng nào."
   - Verified presence of manager CTA button: "Ghi nhận sửa chữa".
4. **Modal Interaction & Submission**:
   - Tapped "Ghi nhận sửa chữa" -> `AddRepairHistoryModal` rendered with all 4 repair type chips (`Bảo dưỡng`, `Sửa chữa`, `Kiểm định`, `Nâng cấp`), date inputs, cost, and vendor.
   - Selected type: `Bảo dưỡng` (`MAINTENANCE`).
   - Description entered: `Bao_duong_dinh_ky`.
   - Date: `2026-10-25` (Started & Completed).
   - Cost: `350.000 đ`.
   - Vendor: `E2E_FPTeBao_duong_hoan_tat_tot`.
   - Tapped "Ghi nhận" (`btn-modal-submit`).
5. **Authoritative Backend Persistence & Preview Refresh**:
   - Modal automatically closed.
   - `RepairHistoryPreview` refreshed authoritative state immediately:
     - Badge: `Bảo dưỡng`
     - Date: `25/10/2026`
     - Description: `Bao_duong_dinh_ky`
     - Vendor: `Đơn vị: E2E_FPTeBao_duong_hoan_tat_tot`
     - Cost: `Chi phí: 350.000 đ`
   - Verified via direct backend API query `GET /api/v1/assets/{assetId}/repair-histories`:
     - Returned 1 item with ID `8fef0ba5-1f55-44c4-9bd1-5c235536a2e4`, `repairType: "MAINTENANCE"`, `cost: 350000.00`.
     - Exactly 1 record created from this submission. Same-tick double-submission protection is strictly enforced by the synchronous `submittingRef.current` lock verified in unit tests.
     - Timezone round-trip verified: `2026-10-25T08:00:00Z` rendered as `25/10/2026` with no rollover under GMT+7.
6. **Artifact Capture & Verification**:
   - Authoritative textual and API verification confirmed in backend and Android UI hierarchy logs. (Screenshot artifact removed per repository scope policy).

---

## 4. Test & Quality Gate Summary

| Gate | Scope | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Backend Unit Tests** | `E2eUserProvisionerTest`, `DevAssetFixtureProvisionerTest` | **PASS** | 14/14 tests passing |
| **Backend Integration Tests**| `RolePermissionSeedIntegrationTest` | **PASS** | 13/13 tests passing |
| **Mobile ESLint** | `npm run lint` | **PASS** | 0 errors |
| **Mobile TypeScript** | `tsc --noEmit` | **PASS** | 0 type errors |
| **Mobile Asset Jest** | `__tests__/assets` | **PASS** | 16/16 suites, 122/122 tests passing |
| **Android Native Verification** | `emulator-5554` runtime execution | **PASS** | Verified live on Android 15 |

---

## 5. Environment Cleanup

- Terminated Metro Bundler background process.
- Terminated backend Spring Boot dev server.
- Terminated Android Emulator (`adb emu kill`).
- Cleaned up ephemeral session file `$env:TEMP\ws_e2e_session.json`.
- Confirmed ports 8080 and 8081 are released.
