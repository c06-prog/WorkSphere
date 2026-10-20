# Phase 15D: Create & Edit Task Implementation Report (SCR-TSK-03 & SCR-TSK-04)

**Status:** IMPLEMENTED & VERIFIED  
**Base Commit:** `1719f23fb5af0259b83bf922a11bb19ed79b0109`  
**Date:** 2026-10-20  

---

## 1. Overview & Objectives

Phase 15D implements mobile task creation (`SCR-TSK-03`) and task editing (`SCR-TSK-04`) for WorkSphere Mobile, strictly following the frozen Task contracts (Decision `D-063`), backend canonical API specifications (`06_API_CONTRACT.md`), and UI workflow standards (`02_USER_ROLES_AND_WORKFLOWS.md`, `03_MOBILE_SCREEN_MAP.md`).

### Key Deliverables Completed:
1. **`CreateTaskScreen` (`SCR-TSK-03`)**:
   - Project selection via dedicated `ProjectSelectModal` displaying human-readable `[CODE] Name` format (zero raw UUIDs exposed).
   - Candidate assignees fetched strictly from `projectApi.listMembers(projectId, { active: true })` via `ProjectMemberAssigneePickerModal`.
   - Generation guard on project member loading and synchronous clearing of selected assignees on project change to prevent cross-project assignee leaks.
   - Client-side validation for mandatory fields (project ID, title, character limits, non-negative estimated minutes).
   - Synchronous submit lock (`submittingRef = useRef(false)`) preventing duplicate submissions on rapid double-press.
   - Successful creation navigates to `TaskDetail` (`{ taskId: created.id }`).
2. **`EditTaskScreen` (`SCR-TSK-04`)**:
   - Initial authoritative load via `taskApi.getTaskDetail(taskId)` on mount.
   - Prefills form fields (title, description, priority, startDate, dueDate, estimatedMinutes).
   - Tracks optimistic lock `version` internally in component state without exposing the raw version number in user-facing UI.
   - Submits exact `UpdateTaskRequest` payload with `version`. Strictly excludes status, progress, and assignees (staged for Phase 15E).
   - Synchronous submit lock (`submittingRef = useRef(false)`) preventing duplicate submissions.
   - Optimistic lock conflict handling: on HTTP 409 (`OPTIMISTIC_LOCK_CONFLICT`), displays `ConfirmationDialog` offering "Tải lại dữ liệu" which reloads latest authoritative task details and increments version.
   - Successful edit invokes `navigation.goBack()`.
3. **Capability Gating & Route Registration**:
   - Registered `CreateTask` and `EditTask` as auxiliary hidden routes in `MainTabNavigator.tsx` with `tabBarButton: () => null`. Exactly 5 bottom navigation tabs are preserved in canonical order: `Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More`.
   - Wired `+ Tạo mới` button on `TasksScreen` (`SCR-TSK-01`), gated strictly by `currentUser?.permissions.includes('TASK_CREATE')`.
   - Wired `Chỉnh sửa` button in `TaskDetailScreen` (`SCR-TSK-02`), gated strictly by `task.allowedActions.includes('UPDATE')`.
   - Added `navigation.addListener('focus', ...)` in `TaskDetailScreen` to automatically refresh task details when returning from `EditTaskScreen`.

---

## 2. Source Files Added & Modified

### New Production Components & Screens:
- `mobile/src/features/tasks/components/ProjectSelectModal.tsx`: Modal for choosing project with search filtering and human-readable formatting.
- `mobile/src/features/tasks/components/ProjectMemberAssigneePickerModal.tsx`: Modal for selecting active project members as assignees.
- `mobile/src/features/tasks/screens/CreateTaskScreen.tsx`: Screen implementation for `SCR-TSK-03`.
- `mobile/src/features/tasks/screens/EditTaskScreen.tsx`: Screen implementation for `SCR-TSK-04`.

### Modified Production Files:
- `mobile/src/features/tasks/components/index.ts`: Re-exported `ProjectSelectModal` and `ProjectMemberAssigneePickerModal`.
- `mobile/src/features/tasks/screens/index.ts`: Re-exported `CreateTaskScreen` and `EditTaskScreen`.
- `mobile/src/app/navigation/MainTabNavigator.tsx`: Registered `CreateTask` and `EditTask` tab routes with hidden buttons.
- `mobile/src/features/tasks/screens/TasksScreen.tsx`: Enabled `+ Tạo mới` button conditionally based on `TASK_CREATE` permission.
- `mobile/src/features/tasks/screens/TaskDetailScreen.tsx`: Enabled `Chỉnh sửa` header button conditionally based on `UPDATE` in `allowedActions`, added navigation focus refresh.

### New Test Suites:
- `mobile/__tests__/screens/CreateTaskScreen.test.tsx`: 4 comprehensive unit/integration tests.
- `mobile/__tests__/screens/EditTaskScreen.test.tsx`: 4 comprehensive unit/integration tests (authoritative load, internal version, submit lock, 409 conflict dialog).
- `mobile/__tests__/tasks/ProjectSelectModal.test.tsx`: 4 unit tests for search, selection, and empty state.
- `mobile/__tests__/tasks/ProjectMemberAssigneePickerModal.test.tsx`: 3 unit tests for filtering active members, multi-select toggle, and pagination lock.
- `mobile/__tests__/tasks/CrossProjectAssigneeRace.test.tsx`: 2 tests verifying race condition protection and assignee invalidation when switching projects.

### Modified Test Suites:
- `mobile/__tests__/screens/TasksScreen.test.tsx`: Added test verifying `TASK_CREATE` capability gating and navigation to `CreateTask`. (11/11 tests pass).
- `mobile/__tests__/screens/TaskDetailScreen.test.tsx`: Added test verifying `UPDATE` capability gating and navigation to `EditTask`. (10/10 tests pass).

---

## 3. Strict Compliance & Invariants Verification

| Rule / Invariant | Status | Verification Evidence |
|:---|:---:|:---|
| **Reuse Before Design** | PASS | Reused `AppTextInput`, `AppButton`, `ConfirmationDialog`, `LoadingIndicator`, `PriorityBadge`, `useAppTheme`, `normalizeError`. |
| **No Direct `directoryApi` Calls for Assignees** | PASS | Assignee picker exclusively queries `projectApi.listMembers(projectId, { active: true })`. `grep -rn "directoryApi" mobile/src/features/tasks` yields 0 occurrences. |
| **Cross-Project Assignee Clearing** | PASS | In `CreateTaskScreen.tsx`, `handleSelectProject` calls `setSelectedAssignees([])` synchronously when project changes. Verified by `CrossProjectAssigneeRace.test.tsx`. |
| **Monotonic Generation Guard** | PASS | In `ProjectMemberAssigneePickerModal.tsx`, `generationRef` increments on `projectId` change or query change, ignoring out-of-order resolved promises. |
| **Synchronous Submit Lock** | PASS | Both `CreateTaskScreen` and `EditTaskScreen` check `if (submittingRef.current) return; submittingRef.current = true;` before entering async operations. Rapid double clicks only produce 1 API request. |
| **Internal Version Tracking in Edit** | PASS | `version` is retained in state for `UpdateTaskRequest.version`, never displayed to user. Verified by `EditTaskScreen.test.tsx`. |
| **HTTP 409 Conflict Handling** | PASS | 409 triggers `conflictVisible = true`. Confirming reloads `taskApi.getTaskDetail` and updates form and version. |
| **No Status/Progress/Assignees in Edit** | PASS | Staged for Phase 15E. `UpdateTaskRequest` strictly conforms to `{ title, description, priority, startDate, dueDate, estimatedMinutes, version }`. |
| **5 Bottom Navigation Tabs Preserved** | PASS | Exactly `Dashboard`, `Projects`, `Tasks`, `ServiceRequests`, `More` remain visible. `CreateTask` and `EditTask` have `tabBarButton: () => null`. |

---

## 4. Test & Build Execution Evidence

### A. TypeScript Type Check
```bash
npm --prefix mobile run typecheck
```
**Output:** Exit code 0 (0 errors).

### B. ESLint Static Analysis
```bash
npm --prefix mobile run lint
```
**Output:** Exit code 0 (0 errors, 48 warnings from preexisting styling in earlier phases).

### C. Jest Full Mobile Test Suite
```bash
npm --prefix mobile test -- --runInBand
```
**Output:**
```text
Test Suites: 74 passed, 74 total
Tests:       647 passed, 647 total
Snapshots:   0 total
Time:        29.623 s
Ran all test suites.
```

### D. Native Android Gradle Build
```powershell
Set-Location D:\WorkSphere\mobile\android
.\gradlew.bat assembleDebug --no-daemon
```
**Output:**
```text
BUILD SUCCESSFUL in 58s
203 actionable tasks: 17 executed, 186 up-to-date
```

---

## 5. Scope Boundary Compliance

- **Status Transition Modals**: Staged for Phase 15E. Not included in 15D.
- **Progress Percentage Update**: Staged for Phase 15E. Not included in 15D.
- **Task Assignees Mutation (Standalone)**: Staged for Phase 15E. Not included in 15D.
- **Subtasks & Comments**: Staged for Phase 15F. Not included in 15D.
- **Backend Changes**: Zero modifications to backend Java source or Flyway migrations.
- **Dependencies**: Zero new third-party dependencies added to `package.json`.

---

## 6. Verdict

**Verdict:** `PHASE_15D_PASS_READY_FOR_AUDIT`
