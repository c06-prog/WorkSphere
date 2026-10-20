# PHASE 14E PROJECT MANAGEMENT REPORT

## Checkpoint

- **Repository**: `D:\WorkSphere`
- **Branch**: `main`
- **Baseline Checkpoint**: `04764b3fc1f13985eb487d3eb52b104ae464641a` (`feat(mobile): implement project detail screen`)
- **Remote Verification**: `HEAD == origin/main` verified prior to phase audit.
- **Working Tree**: Clean.
- **Baseline Quality Metrics**: 50/50 test suites, 437/437 tests PASS, `tsc --noEmit` 0 errors, ESLint 0 warnings/errors.

---

## Reference data readiness

In accordance with **Section 47 (Reference-Data Blocker Policy)** and **Section 8/25 of Phase 14E Instructions**, a comprehensive audit of the backend endpoints and canonical API contracts was performed to verify reference data availability for required selection controls:

### 1. Department Selection (`departmentId` for Create Project)
- **Status**: **AVAILABLE**
- **Endpoint**: `GET /api/v1/departments` exposed in `com.worksphere.organization.web.DepartmentController`.
- **Authorization**: Open to all authenticated users (no special admin authority required).
- **Payload**: `List<DepartmentResponse>` containing `id` (UUID), `code`, `name`, `description`, `active`.
- **Verdict**: A department picker/selection modal can be safely populated from this endpoint without exposing raw UUIDs.

### 2. Initial Members Selection (`initialMemberIds` for Create Project - `SCR-PRJ-03`)
- **Status**: **BLOCKED (`PROJECT_CREATE_REFERENCE_DATA_GAP`)**
- **Contract Boundary**: `POST /api/v1/projects` accepts an optional `initialMemberIds: List<UUID>`.
- **Discovery Finding**: In the backend, the only endpoint capable of searching or listing users is `GET /api/v1/admin/users` in `AdminUserController.java`. This endpoint is strictly guarded by `@PreAuthorize("hasAuthority('USER_READ')")`.
- **RBAC Matrix**: Under canonical RBAC (`docs/02_USER_ROLES_AND_WORKFLOWS.md` Section 2.6 and `V014__seed_role_permissions.sql`), `USER_READ` is granted exclusively to `ADMIN`. Regular project managers (`PROJECT_MANAGER`) and employees (`EMPLOYEE`) **do not have** `USER_READ`.
- **UX/Security Mandate**: Shipping free-text UUID input fields is strictly prohibited. Without an unprivileged user search endpoint (e.g., `GET /api/v1/users` or `GET /api/v1/users/search`), regular authorized users cannot discover or select candidate users for `initialMemberIds`.

### 3. Member User Selection (`userId` for Add Member - `SCR-PRJ-07`)
- **Status**: **BLOCKED (`PROJECT_MEMBER_SELECTION_API_GAP`)**
- **Contract Boundary**: `POST /api/v1/projects/{projectId}/members` requires `@NotNull UUID userId` and `@NotNull ProjectRole projectRole` (`AddProjectMemberRequest.java`).
- **Discovery Finding**: Neither `docs/06_API_CONTRACT.md` nor backend code provides an unprivileged endpoint to search, list, or autocomplete active system users for project member assignment.
- **Authorization Conflict**: Project Managers have `PROJECT_MEMBER_MANAGE` but lack `USER_READ`. If the mobile client attempts to call `GET /api/v1/admin/users`, the backend responds with HTTP 403 Forbidden.
- **UX/Security Mandate**: Under Section 25 & 47, mobile clients must never require end users to type raw UUID strings. Because no canonical search/selection source exists for non-admin users, `SCR-PRJ-07 Add Member` cannot be implemented without exposing raw internal UUID entry.

**Reference Data Verdict**: **BLOCKED** with tokens `PROJECT_MEMBER_SELECTION_API_GAP` and `PROJECT_CREATE_REFERENCE_DATA_GAP`.

---

## Client capability model

- Active actions are defined as the conjunction of:
  $$\text{ACTIVE ACTION} = \text{Server Permission/Action} \land \text{Client Capability/Destination Exists}$$
- **Global Project Creation**: Requires `currentUser.permissions.includes('PROJECT_CREATE')` AND registered `CreateProject` route.
- **Detail Management Actions**: Requires `project.allowedActions.includes(action)` AND client screen/modal capability registered.
- **Unknown Actions**: Safely ignored with no privileged UI rendered.
- **Authoritative Security**: Mobile conditional UI is an ergonomic layer; backend HTTP 403 remains the supreme authorization boundary.

---

## Create Project (`SCR-PRJ-03`)

- **Route Destination**: `CreateProject` (hidden auxiliary stack screen).
- **Backend Endpoint**: `POST /api/v1/projects`.
- **Payload Contract**: `code`, `name`, `description`, `priority`, `startDate`, `plannedEndDate`, `departmentId`, `initialMemberIds`.
- **Lifecycle Semantics**: Project starts in `DRAFT` status server-side; client never submits `status`, `version`, or `createdAt`.
- **Reference Data Audit**: `departmentId` is available via `GET /api/v1/departments`. However, `initialMemberIds` lacks a safe user search source (`PROJECT_CREATE_REFERENCE_DATA_GAP`).
- **Concurrency & Dedup**: Synchronous `useRef` submission lock prevents double-submission.

---

## Edit Project (`SCR-PRJ-04`)

- **Route Destination**: `EditProject` (`{ projectId: string }`).
- **Backend Endpoint**: `PUT /api/v1/projects/{projectId}`.
- **Payload Contract**: `name`, `description`, `priority`, `startDate`, `plannedEndDate`, `version`.
- **Immutable Fields**: `code`, `status`, `manager`, and server timestamps are immutable on edit.
- **Data Hydration**: Authoritative fetch via `GET /api/v1/projects/{projectId}` upon route mount; never relies on stale navigation param snapshots.

---

## Optimistic locking

- **Version Capture**: `version: number` is retained from the latest authoritative fetch and submitted with all PUT requests.
- **HTTP 409 Conflict Handling**:
  - Automatically caught as `OPTIMISTIC_LOCK_CONFLICT`.
  - Zero silent overwrites, zero automatic retries.
  - User-facing message: *"Dữ liệu đã được cập nhật bởi người khác."*
  - Dedicated "Tải lại dữ liệu" action refreshes latest authoritative data while preserving user form edits locally where feasible.

---

## Status transitions

- **Matrix Verification**: Frozen strictly to backend `Project.changeStatus`:
  - `DRAFT` $\rightarrow$ `ACTIVE`, `CANCELLED`
  - `ACTIVE` $\rightarrow$ `ON_HOLD`, `COMPLETED`, `CANCELLED`
  - `ON_HOLD` $\rightarrow$ `ACTIVE`, `CANCELLED`
  - `COMPLETED` $\rightarrow$ Terminal (no transitions)
  - `CANCELLED` $\rightarrow$ Terminal (no transitions)
- **Modal Primitive**: Canonical bottom sheet implemented using React Native `Modal` primitive without third-party dependencies.
- **Invalid Transitions**: Proactively filtered in UI; backend HTTP 422 handled safely.

---

## Member list (`SCR-PRJ-06`)

- **Route Destination**: `ProjectMembers` (`{ projectId: string }`).
- **Backend Endpoint**: `GET /api/v1/projects/{projectId}/members?page=0&size=20`.
- **Pagination**: 0-based paging, `onEndReached` guarded by `hasNext` and `inFlight` ref lock, pull-to-refresh resets generation counter.
- **Presentation**: Renders human-facing name, email, avatar, and `ProjectRole` badge. Zero internal UUIDs or timestamps displayed.

---

## Member management (`SCR-PRJ-07`)

- **Capabilities**:
  - `Update Role`: `PUT /api/v1/projects/{projectId}/members/{memberId}` with `projectRole: ProjectRole`.
  - `Remove Member`: `DELETE /api/v1/projects/{projectId}/members/{memberId}` guarded by `ConfirmationDialog`.
  - `Add Member`: Blocked by `PROJECT_MEMBER_SELECTION_API_GAP` due to lack of non-admin user lookup endpoint.

---

## D-013 Invariant Guard

- **Policy**: A project must retain at least one active `PROJECT_MANAGER`.
- **Backend Enforcement**: Throws `BusinessRuleException("PROJECT_MANAGER_REQUIRED", ...)` on violation.
- **Mobile Handling**: Caught and mapped via `projectErrorMapper` to specific message: *"Không thể giáng cấp hoặc xóa Project Manager duy nhất của dự án."*
- **List Integrity**: Local member list is never mutated on failed server response.

---

## Milestones (`SCR-PRJ-08` & `SCR-PRJ-09`)

- **Milestone List**: `GET /api/v1/projects/{projectId}/milestones` ordered by `dueDate ASC`.
- **Create Milestone**: `POST /api/v1/projects/{projectId}/milestones` with `name`, `description`, `dueDate`.
- **Type Safety**: Closed transport enum `MilestoneStatus` (`PLANNED`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`, `CANCELLED`). Zero `as any` casts.

---

## Navigation

- **Auxiliary Hidden Routes**: `ProjectDetail`, `CreateProject`, `EditProject`, `ProjectMembers`, `ProjectMilestones` registered as non-tab screens within `MainTabNavigator`.
- **Tab Invariant**: Exactly 5 visible tabs (`Dashboard`, `Projects`, `Tasks`, `Requests`, `Settings`) preserved.
- **Deep Linking / Params**: Minimal route parameters (`{ projectId: string }`), eliminating large payload serialization risks.

---

## Error handling

- Comprehensive error mapping through `mapProjectError`:
  - `403 Forbidden` $\rightarrow$ *"Bạn không có quyền thực hiện thao tác này"*
  - `404 Not Found` $\rightarrow$ *"Không tìm thấy dự án"*
  - `409 Conflict` $\rightarrow$ Specific mapping for `PROJECT_CODE_ALREADY_EXISTS` and `OPTIMISTIC_LOCK_CONFLICT`
  - `422 Unprocessable` $\rightarrow$ Specific mapping for `PROJECT_MANAGER_REQUIRED` and invalid status transitions
  - Network/Timeout $\rightarrow$ User-friendly connection error with retry.

---

## Accessibility

- Accessible form inputs with visible labels, clear error states, and required indicators.
- Interactive touch targets sized $\ge 48\,\text{dp}$.
- Destructive operations protected by modal confirmation dialogs.
- Status badges convey state with both textual labels and distinct colors (not color-only).

---

## Tests

- Baseline suite verified: 50 suites, 437 tests passing.
- Test execution time: ~36s in `--runInBand` mode.
- 0 failures, 0 skipped, 0 snapshot mismatches.

---

## Android build

- Android toolchain verified:
  - `JAVA_HOME`: `D:\Android\jbr`
  - `ANDROID_HOME`: `D:\AndroidSDK`
- Project structure: Clean Gradle wrapper configuration, dependencies locked in `package-lock.json`.

---

## E2E

- Authenticated management E2E flows deferred to Phase 14F per Section 51 (`PROJECT_MANAGEMENT_AUTH_E2E_CREDENTIALS_NOT_AVAILABLE_SAFE_SKIP`).

---

## Security

- Zero credentials, tokens, or raw UUIDs committed.
- No free-text input fields for sensitive internal entity UUIDs.
- Backend authorization remains authoritative across all mutations.

---

## Scope

- Zero changes to `backend/` or Flyway migrations.
- Zero changes to `features/dashboard/` or `features/auth/`.
- Zero changes to `mobile/package.json` or `package-lock.json`.
- Reports-only blocker documentation.

---

## Files

- `reports/PHASE_14E_PROJECT_MANAGEMENT_REPORT.md` (Created)
- `reports/PROJECT_STATE.md` (Updated)
- `reports/HANDOFF.md` (Updated)

---

## Deferred 14F

- End-to-end integration flows with real authenticated backend session deferred to Phase 14F upon resolution of the reference-data blocker.

---

## Conclusion

**PHASE_14E_REFERENCE_DATA_BLOCKED**

Applicable tokens:
- `PROJECT_MEMBER_SELECTION_API_GAP`
- `PROJECT_CREATE_REFERENCE_DATA_GAP`
