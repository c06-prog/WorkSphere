# PHASE 17F-VALIDATION — REPAIR HISTORY ANDROID RUNTIME VALIDATION & TIMEZONE HARDENING REPORT

**Date**: 2026-10-25  
**Baseline Checkpoint**: `831b6bd105254298bdea2b15a2caabd1b7249dbc`  
**Scope**: Android Runtime Verification, Canonical Dev Fixture Audit, and Timezone Round-Trip Hardening for `AddRepairHistoryModal` (`POST /api/v1/assets/{assetId}/repair-histories`).

---

## 1. PRE-FLIGHT AUDIT & VERIFICATION

1. **Repository & Branch**:
   - Path: `D:\WorkSphere`
   - Branch: `main`
   - Checkpoint: `831b6bd105254298bdea2b15a2caabd1b7249dbc`
   - Pre-flight Clean Check: Verified working tree clean at baseline.

2. **Services & Ports State**:
   - PostgreSQL (`worksphere-dev-pg`): Active on port 5432 (`0.0.0.0:5432`).
   - Port 8080 (Spring Boot backend): Idle / not running before audit.
   - Port 8081 (Metro Bundler): Idle / not running before audit.
   - Android Emulator (`emulator-5554`): Idle / not running before audit.

---

## 2. CANONICAL DEV FIXTURE & SEED AUDIT

A thorough audit of backend repository sources was conducted:
1. **Flyway Migrations**:
   - `V001` .. `V017` inspected in `backend/src/main/resources/db/migration/`.
   - `V011__seed_roles_and_permissions.sql` seeds 4 roles (`ADMIN`, `PROJECT_MANAGER`, `TEAM_LEADER`, `EMPLOYEE`) and 29 permissions (including `ASSET_READ` and `ASSET_MANAGE`).
   - `V014__seed_role_permissions.sql` grants `ADMIN` all 29 permissions (`CROSS JOIN permissions`).
   - Zero canonical user seeds exist in database migrations (`users` table has 0 rows).
2. **Canonical Provisioning Mechanism**:
   - `backend/src/main/java/com/worksphere/identity/dev/E2eUserProvisioner.java` is the authoritative dev runner (`@Profile("dev")`, `@ConditionalOnProperty("worksphere.dev.e2e-user.enabled")`).
   - Decision `D-056` and Runbook `reports/runbooks/PHASE_13_LOCAL_AUTH_E2E.md`:
     - Explicitly forbids committing, inventing, or hard-coding plaintext credentials in Git, reports, or test scripts.
     - Strictly requires external credential injection via environment variables (`WORKSPHERE_DEV_E2E_USER_ENABLED=true`, `WORKSPHERE_E2E_LOGIN`, `WORKSPHERE_E2E_PASSWORD`).
     - In the current shell environment, `$env:WORKSPHERE_DEV_E2E_USER_ENABLED` and associated credentials are absent.
3. **Safety Policy Adherence**:
   - In accordance with Decision `D-056`, Phase 15/16 handoff protocols (`PHASE_15_AUTH_E2E_CREDENTIALS_NOT_AVAILABLE_SAFE_SKIP`), and Section 2 of user instructions:
     - The agent strictly refuses to invent ad-hoc database accounts or bypass the external credential contract.
     - Because valid external credentials are not supplied in this local session, live device login cannot proceed without breaching the security policy.

---

## 3. TIMEZONE ROUND-TRIP AUDIT & DEFECT HARDENING

### Defect Analysis
During date/time contract audit of `AddRepairHistoryModal.tsx`:
- Input dates: `startedDate` (YYYY-MM-DD) and `completedDate` (YYYY-MM-DD).
- Initial implementation serialized:
  - `startedAt = ${startedDate}T08:00:00Z`
  - `completedAt = ${completedDate}T17:00:00Z`
- In UTC, `17:00:00Z` corresponds to the same calendar day.
- However, when converted to Vietnam local time (`Asia/Ho_Chi_Minh`, GMT+7):
  - `17:00:00Z + 07:00 = 00:00:00` of the **next calendar day** (`+1 day rollover`).
  - Example: User entered completed date `2026-10-25`. At GMT+7, `new Date("2026-10-25T17:00:00Z").toLocaleDateString('vi-VN')` renders as `26/10/2026`!
  - This caused a 1-day calendar drift on the user interface between input and presentation.

### Hardening Applied
- Updated `AddRepairHistoryModal.tsx`:
  - `isoStartedAt = ${startedDate.trim()}T08:00:00Z` (corresponds to 15:00:00 GMT+7, same calendar day across UTC, GMT+7, Tokyo, and US Eastern).
  - `isoCompletedAt = ${completedDate.trim()}T10:00:00Z` (corresponds to 17:00:00 GMT+7 end-of-business, strictly same calendar day across all supported timezones from GMT-5 to GMT+9, and strictly guarantees `completedAt >= startedAt` when same-day repairs occur).
- Updated `AddRepairHistoryModal.test.tsx` to match the hardened `T10:00:00Z` contract.
- Verified Node.js timezone round-trip:
  ```javascript
  new Date('2026-10-25T08:00:00Z').toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) // "25/10/2026"
  new Date('2026-10-25T10:00:00Z').toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) // "25/10/2026"
  ```
  Zero day-shift or rollover anomalies.

---

## 4. STATIC QUALITY GATES & TEST VERIFICATION

1. **Linting**:
   - `npm --prefix mobile run lint` -> **PASS** (0 errors, 48 baseline historical warnings preserved).
2. **Typecheck**:
   - `npm --prefix mobile run typecheck` -> **PASS** (0 errors).
3. **Asset Test Suite**:
   - `npm --prefix mobile test -- --runInBand __tests__/assets` -> **PASS** (16/16 suites, 122/122 tests passed).
4. **Full Test Suite**:
   - `npm --prefix mobile test -- --runInBand` -> **PASS** (114/114 suites, 1050/1050 tests passed, 0 failures, 0 skipped).

---

## 5. SERVICE STATUS & CLEANUP

- **Port 8080**: Verified idle.
- **Port 8081**: Verified idle.
- **Port 5432**: PostgreSQL container `worksphere-dev-pg` remains running safely as instructed.
- **ADB / Emulator**: Verified no stale emulator instances or locks.
- **Working Tree**: Checked before commit.

---

## 6. COMPLETION STATUS

All automated quality gates, timezone audits, and security boundaries are fully satisfied. In strict compliance with Completion Rule #3, because external canonical development credentials were not present in the local environment to authenticate against the unseeded PostgreSQL database on the emulator:

**Marker**: `PHASE_17_ANDROID_VALIDATION_DEV_FIXTURE_REQUIRED`
