# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- HEAD: 4aa6f413457c180e7db3adaa227985cccb905e0f
- origin/main: 4aa6f413457c180e7db3adaa227985cccb905e0f
- Last completed work: Phase 6 Project Module (completed, audited, and patched)
- Last validated implementation commit:
  4aa6f413457c180e7db3adaa227985cccb905e0f
- Last validated tests: 59 of 59 passed (0 failures, 0 errors, 0 skipped)
- Last validated build: BUILD SUCCESS
- Checkstyle: 0 violations
- PostgreSQL integration: PASS (Image: postgres:15-alpine)
- Invariant resolution: LAST_PROJECT_MANAGER_INVARIANT_GAP resolved

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

## Next Permitted Step

- **Mobile UI/UX Design Baseline**.
- Phase 7 (Task Management) chưa bắt đầu.
- Nhiệm vụ UI/UX chỉ tạo tài liệu thiết kế (User Flow, Screen Inventory, Wireframe, Design System, Component Inventory, UI State Matrix, Navigation Map, API-Screen Mapping, Accessibility Checklist), **không tạo source mobile**.
- Sau khi UI/UX design baseline được review mới chuyển sang các bước implementation tiếp theo.

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