# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- HEAD: d45524b8eb564268fca257441fa75b4c691fd7aa
- origin/main: d45524b8eb564268fca257441fa75b4c691fd7aa
- Last completed work: Phase 5 Organization and User Management (independently audited and passed)
- Last validated implementation commit:
  d45524b8eb564268fca257441fa75b4c691fd7aa
- Last validated tests: 44 of 44 passed (0 failures, 0 errors, 0 skipped)
- Last validated build: BUILD SUCCESS
- Checkstyle: 0 violations
- PostgreSQL integration: PASS (Image: postgres:15-alpine)

## Implemented in Phase 5

- Department Domain, Repository, Application Service, and REST Endpoints (`GET /api/v1/departments`, `POST /api/v1/admin/departments`, `PUT /api/v1/admin/departments/{id}`, `PUT /api/v1/admin/departments/{id}/deactivate`).
- Admin User Management Application Service and REST Endpoints (`GET /api/v1/admin/users`, `POST /api/v1/admin/users`, `PUT /api/v1/admin/users/{userId}`, `PUT /api/v1/admin/users/{userId}/lock`, `PUT /api/v1/admin/users/{userId}/unlock`).
- UserRole mapping entity and repository for explicit `user_roles` management.
- Team and Team Member Domain and Application Services.

## Deferred / Known Gaps

- `TEMPORARY_PASSWORD_FLOW_GAP`: User creation in `PENDING` status with hashed temporary password. Activation workflow and first-time password setup endpoint are deferred until canonical docs provide detailed specifications.
- `TEAM_API_CONTRACT_GAP`: Team REST controllers are deferred because `06_API_CONTRACT.md` does not specify Team endpoints.

## Next Permitted Phase

- **Phase 6: Project Module** (per `docs/08_DEVELOPMENT_ROADMAP.md`).
- Scope boundary: Phase 6 must focus strictly on the Project domain. Do not expand into Tasks, Comments, Files, Assets, Service Requests, or Notifications.

## New Session Procedure

1. Read AGENTS.md.
2. Read reports/PROJECT_STATE.md.
3. Read reports/DECISIONS.md.
4. Read reports/HANDOFF.md.
5. Run git status --short.
6. Run git log --oneline --decorate -5.
7. Compare HEAD with origin/main.
8. Read the relevant canonical document sections.
9. Identify the exact scoped task.
10. Do not start another roadmap phase without explicit scope.

## Model Switch Procedure

When FCM switches model:

- Continue within the same OpenCode session where possible.
- Recheck current tool output.
- Recheck git status before writing.
- Do not repeat completed commands unnecessarily.
- If state is unclear, stop writing and produce a checkpoint report.

## Current AI Operating Mode

FCM Smart Router automatic failover is disabled because the current
active set contains only authentication failures.

Use:

D:\AI\Start-WorkSphere-Model-Selector.ps1

Select one healthy model manually. When changing model, the next model
must reread AGENTS.md, PROJECT_STATE.md, DECISIONS.md and HANDOFF.md.