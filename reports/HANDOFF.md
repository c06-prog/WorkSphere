# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- HEAD: e670233232491dfbbe7a357627cbb9c44844d9eb
- origin/main: e670233232491dfbbe7a357627cbb9c44844d9eb
- Last completed work: Mobile UI/UX Design Baseline (reviewed, finalized, and pushed)
- Last validated implementation commit:
  e670233232491dfbbe7a357627cbb9c44844d9eb
- Design specification: completed (14 documents in design/, tracking 42 UI artifacts and 32 API mappings)
- Android/Docker test environment: verified (emulator-5554, Android 15, API 35, ADB 1.0.41, Docker Desktop 4.94.0)
- Visual prototype: not created
- Figma file: not created
- React Native source: not created

## Implemented in Phase 6

- Project Domain, Repository, Application Service, and REST Endpoints (`GET /api/v1/projects`, `POST /api/v1/projects`, `GET /api/v1/projects/{projectId}`, `PUT /api/v1/projects/{projectId}`, `PUT /api/v1/projects/{projectId}/status`).
- Project Member Domain, Repository, Application Service, and REST Endpoints (`GET /api/v1/projects/{projectId}/members`, `POST /api/v1/projects/{projectId}/members`, `PUT /api/v1/projects/{projectId}/members/{memberId}`, `DELETE /api/v1/projects/{projectId}/members/{memberId}`).
- Final Project Manager invariant preserved on both delete and role update.
- Milestone Domain, Repository, Application Service, and REST Endpoints (`POST /api/v1/projects/{projectId}/milestones`, `GET /api/v1/projects/{projectId}/milestones`).
- ProjectStatusHistory recorded automatically within the same transaction during status transitions.
- Optimistic Locking with HTTP 409 `OPTIMISTIC_LOCK_CONFLICT`.

## Deferred / Known Gaps

- `TEMPORARY_PASSWORD_FLOW_GAP`: User creation in `PENDING` status with hashed temporary password. Activation workflow and first-time password setup endpoint are deferred until canonical docs provide detailed specifications.
- `TEAM_API_CONTRACT_GAP`: Team REST controllers are deferred because `06_API_CONTRACT.md` does not specify Team endpoints.
- `DASHBOARD_AGGREGATED_API_GAP`: Personal Dashboard API `GET /dashboard/me` defined in API contract but backend controller is not yet implemented.

## Next Permitted Step

- **VISUAL UI PROTOTYPE**.
- Tạo và review visual prototype cho các màn hình lõi trước khi code React Native.
- Tuyệt đối không bắt đầu React Native implementation trước khi visual prototype được nghiệm thu.
- Phase 7 (Task Management) chưa bắt đầu.


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