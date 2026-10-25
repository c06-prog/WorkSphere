# Pre-Phase 16 Roadmap Audit: System Integration & End-to-End Testing

## Executive Summary

This document performs the pre-implementation discovery and baseline audit for **Roadmap Giai đoạn 16: Tích hợp và kiểm thử hệ thống (System Integration & End-to-End Testing)**.

All mobile feature implementation modules (Phase 13 Mobile Authentication, Phase 14 Mobile Dashboard & Projects, Phase 15 Mobile Task Management, Phase 16 Mobile Service Requests, Phase 17 Mobile Asset Management, and Phase 18 Mobile Notification System) have officially closed their respective memory checkpoints. The system is in an intact, fully-tested, type-safe, and runnable state.

This audit establishes the foundational inventory, canonical naming reconciliation, six canonical End-to-End user workflows, RBAC role matrix, environment contract, and defect classification criteria prior to freezing the execution plan.

---

## 1. Canonical Phase Naming & Roadmap Reconciliation

### 1.1 Context & Numbering Reconciliation
In recent project phases:
- **Mobile Feature Implementation Phases** were scoped modularly as Phase 13 (Auth), Phase 14 (Dashboard/Projects), Phase 15 (Tasks), Phase 16 (Service Requests), Phase 17 (Assets), and Phase 18 (Notifications).
- **Canonical Master Roadmap** ([08_DEVELOPMENT_ROADMAP.md](file:///D:/WorkSphere/docs/08_DEVELOPMENT_ROADMAP.md) Section 3 & Section 20) defines the overall lifecycle phases:
  - Giai đoạn 13: Mobile Authentication (COMPLETED)
  - Giai đoạn 14: Mobile Project và Task (COMPLETED)
  - Giai đoạn 15: Mobile Service Request và Asset (COMPLETED)
  - **Giai đoạn 16: TÍCH HỢP VÀ KIỂM THỬ HỆ THỐNG (SYSTEM INTEGRATION & END-TO-END TESTING)** (CURRENT)
  - Giai đoạn 17: Docker và môi trường local (NEXT)
  - Giai đoạn 18: CI/CD
  - Giai đoạn 19: Logging, Monitoring, Backup và Rollback
  - Giai đoạn 20: Báo cáo và Slide
  - Giai đoạn 21: Nghiệm thu và Đóng dự án

### 1.2 Canonical Identity
- **Vietnamese Title**: *Giai đoạn 16: Tích hợp và kiểm thử hệ thống*
- **English Title**: *Phase 16: System Integration & End-to-End Testing*
- **Position in Roadmap**: Pre-release verification phase immediately following all feature implementations and preceding containerization (Giai đoạn 17).
- **Rule**: We maintain the canonical numbering **Giai đoạn 16** (or **Roadmap Phase 16 / System Integration**) without inventing arbitrary phase numbers such as "Phase 19".

---

## 2. Comprehensive System Inventory

| Subsystem / Module | Canonical Screens / Routes | Key Endpoints | Authoritative RBAC Permissions | Existing Automated Baseline | Prior Android Runtime Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A. Identity & Auth** | `Login`, `ForgotPassword`, `ResetPassword` | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password` | Public / Token authenticated | `AuthMockMvcTest`, `useAuth.test.tsx`, `LoginScreen.test.tsx` | YES (Phase 13/18E login execution) |
| **B. Dashboard** | `Dashboard` (`SCR-MAIN-01`) | `GET /dashboard`, `GET /notifications/unread-count` | `PROFILE_READ`, `NOTIFICATION_READ` | `DashboardMockMvcTest`, `useDashboard.test.tsx`, `DashboardScreen.test.tsx` | YES (Phase 14B/18E runtime) |
| **C. Organization & Users** | `DepartmentSelectModal`, `UserPickerModal` | `GET /departments`, `GET /users/search` | `PROFILE_READ`, `USER_READ` | `UserPickerModal.test.tsx`, `departmentApi.test.ts` | YES (Phase 14E user picker) |
| **D. Projects** | `Projects` (`SCR-PRJ-01`), `ProjectDetail` (`SCR-PRJ-02`), `CreateProject`, `EditProject`, `ProjectMembers`, `ProjectMilestones` | `GET/POST /projects`, `GET/PUT /projects/{id}`, `POST /projects/{id}/members`, `POST /projects/{id}/milestones` | `PROJECT_READ`, `PROJECT_CREATE`, `PROJECT_UPDATE`, `PROJECT_MEMBER_MANAGE` | `ProjectMockMvcTest`, `useProjects.test.tsx`, `ProjectDetailScreen.test.tsx` | YES (Phase 14E project creation & members) |
| **E. Tasks & Subtasks** | `Tasks` (`SCR-TSK-01`), `TaskDetail` (`SCR-TSK-02`), `CreateTask`, `EditTask`, `SubtaskList`, `TaskComments` | `GET/POST /tasks`, `GET/PUT /tasks/{id}`, `PUT /tasks/{id}/status`, `POST /tasks/{id}/assignments`, `GET/POST /tasks/{id}/comments` | `TASK_READ`, `TASK_CREATE`, `TASK_UPDATE`, `TASK_UPDATE_STATUS`, `TASK_ASSIGN` | `TaskMockMvcTest`, `useTasks.test.tsx`, `TaskWorkflow.test.tsx` | YES (Phase 15F task workflow & comments) |
| **F. Service Requests** | `ServiceRequests` (`SCR-SRV-01`), `ServiceRequestDetail` (`SCR-SRV-02`), `CreateServiceRequest`, `ServiceRequestComments`, `ServiceRating` | `GET/POST /service-requests`, `GET/PUT /service-requests/{id}`, `PUT /service-requests/{id}/status`, `POST /service-requests/{id}/comments`, `POST /service-requests/{id}/rating` | `SERVICE_REQUEST_READ`, `SERVICE_REQUEST_CREATE`, `SERVICE_REQUEST_UPDATE`, `SERVICE_REQUEST_UPDATE_STATUS`, `SERVICE_REQUEST_ASSIGN` | `ServiceRequestMockMvcTest`, `useServiceRequests.test.tsx`, `ServiceRequestWorkflow.test.tsx` | YES (Phase 16G service workflow & rating) |
| **G. Assets** | `AssetList` (`SCR-AST-01`), `AssetDetail` (`SCR-AST-02`), `CreateAsset`, `AddRepairHistoryModal` | `GET/POST /assets`, `GET/PUT /assets/{id}`, `POST /assets/{id}/repair-history`, `POST /assets/{id}/assignments` | `ASSET_READ`, `ASSET_MANAGE`, `ASSET_CATEGORY_MANAGE` | `AssetMockMvcTest`, `useAssets.test.tsx`, `AssetDetailScreen.test.tsx` | YES (Phase 17F-Final repair history E2E) |
| **H. Notifications** | `NotificationList` (`SCR-NOT-01`) | `GET /notifications`, `GET /notifications/unread-count`, `PUT /notifications/{id}/read`, `PUT /notifications/read-all` | `NOTIFICATION_READ`, `NOTIFICATION_UPDATE` | `NotificationMockMvcTest`, `useNotifications.test.ts`, `NotificationBadges.test.tsx` | YES (Phase 18E-Runtime mark-one, mark-all, badges) |

---

## 3. Authoritative RBAC System Role Set

Per database migration scripts `V011__seed_roles_and_permissions.sql`, `V014__seed_role_permissions.sql`, and `V015__correct_project_read_permissions_and_validate_role_matrix.sql`:
The repository defines exactly **4 canonical system roles** (total 76 permission mappings across 29 distinct permissions):

1. **`ADMIN`** (29 permissions): Full access across all modules, including user/role/department/audit administration.
2. **`PROJECT_MANAGER`** (20 permissions): Manages projects, project members, tasks, subtasks, assignments, service requests, and notifications.
3. **`TEAM_LEADER`** (14 permissions): Reads projects, creates/updates/assigns tasks, creates/updates service requests, reads assets, and manages notifications.
4. **`EMPLOYEE`** (13 permissions): Least-privilege role. Reads assigned projects, tasks, and service requests; creates service requests; reads company assets; manages personal notifications and profile.

*(Note: Roles like `FACILITY_MANAGER` or `AUDITOR` are not seeded in canonical migrations and are not active).*

---

## 4. Canonical Six E2E Workflows (Roadmap Section 20.2)

1. **FLOW-01 — Authentication & Session Lifecycle**:
   - `Launch` $\rightarrow$ `Login` $\rightarrow$ `Dashboard` $\rightarrow$ `Token Refresh` $\rightarrow$ `Logout` $\rightarrow$ `Session Termination`.
2. **FLOW-02 — Project Management Lifecycle**:
   - `Create Project` $\rightarrow$ `Add Member` $\rightarrow$ `Create Milestone` $\rightarrow$ `View Project Dashboard & Overview`.
3. **FLOW-03 — Task Management Lifecycle**:
   - `Create Task` $\rightarrow$ `Assign User` $\rightarrow$ `Start (IN_PROGRESS)` $\rightarrow$ `Submit (IN_REVIEW)` $\rightarrow$ `Complete (COMPLETED)`.
4. **FLOW-04 — Service Request Management Lifecycle**:
   - `Create Request` $\rightarrow$ `Assign Handler` $\rightarrow$ `Process (IN_PROGRESS)` $\rightarrow$ `Resolve (RESOLVED)` $\rightarrow$ `Close (CLOSED)` $\rightarrow$ `Submit Rating`.
5. **FLOW-05 — Asset Management Lifecycle**:
   - `Create Asset` $\rightarrow$ `Assign Asset` $\rightarrow$ `View Asset (My Assets)` $\rightarrow$ `Report Fault Linkage` $\rightarrow$ `Record Repair History`.
6. **FLOW-06 — Notification Lifecycle**:
   - `Trigger Domain Event` $\rightarrow$ `Create Notification` $\rightarrow$ `Mobile Badge Display` $\rightarrow$ `Open Notification Center` $\rightarrow$ `Context Navigation` $\rightarrow$ `Mark as Read`.

---

## 5. Dev Fixture Inventory & Gaps

### 5.1 Existing Dev Fixtures
- **`E2eUserProvisioner`**: Provisions dedicated ephemeral test user with role configuration (`EMPLOYEE` / `ADMIN`), guarded by `@Profile("dev")` and `worksphere.dev.e2e-user.enabled`.
- **`DevAssetFixtureProvisioner`**: Provisions canonical `E2E_ASSET_CAT` category, guarded by `@Profile("dev")` and `worksphere.dev.e2e-asset-fixture.enabled`.
- **`DevNotificationFixtureProvisioner`**: Provisions 6 idempotent notifications targeting active E2E user with genuine parent rows, guarded by `@Profile("dev")` and `worksphere.dev.e2e-notification-fixture.enabled`.

### 5.2 Fixture Gaps for Full System Integration
- Multi-role provisioning: To test all 4 roles in E2E without manual DB manipulation, E2E fixtures should support running multiple accounts or easily switching test personas (e.g. `pm_user`, `lead_user`, `emp_user`, `admin_user`).
- Clean state reset mechanism between E2E waves without corrupting dev PostgreSQL container data.

---

## 6. Audit Conclusion & Next Action

The repository is fully ready for formal freezing of the **Phase 16 System Integration Test Plan & Execution Waves**.
