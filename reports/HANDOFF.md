# WorkSphere Handoff

## Current Checkpoint

- Repository: D:\WorkSphere
- Branch: main
- HEAD before memory setup: 1ff7fcffde73c0010591a15aa931084c7e6f5a19
- origin/main before memory setup: 1ff7fcffde73c0010591a15aa931084c7e6f5a19
- Last completed work: Phase 4 Authentication patch
- Last validated implementation commit:
  1ff7fcffde73c0010591a15aa931084c7e6f5a19
- Last validated tests: 29 of 29 passed
- Last validated build: BUILD SUCCESS

## Current Local Work

This setup creates the following persistent memory files:

- AGENTS.md
- reports/PROJECT_STATE.md
- reports/DECISIONS.md
- reports/HANDOFF.md

These files must be reviewed before being committed.

Do not mix these files with unrelated feature implementation.

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

## Current Next Step

No new implementation phase is authorized by this file.

The user must provide the next scoped task.
## Current AI Operating Mode

FCM Smart Router automatic failover is disabled because the current
active set contains only authentication failures.

Use:

D:\AI\Start-WorkSphere-Model-Selector.ps1

Select one healthy model manually. When changing model, the next model
must reread AGENTS.md, PROJECT_STATE.md, DECISIONS.md and HANDOFF.md.