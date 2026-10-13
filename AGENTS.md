# WorkSphere Agent Rules

## Repository

- Root: D:\WorkSphere
- Main branch: main
- Remote: origin
- Java target: 21
- Backend: Spring Boot Modular Monolith
- Database: PostgreSQL
- Migration: Flyway
- Mobile: React Native and TypeScript

## Canonical Sources

Only these ten documents are authoritative:

1. docs/01_PROJECT_SCOPE.md
2. docs/02_USER_ROLES_AND_WORKFLOWS.md
3. docs/03_MOBILE_SCREEN_MAP.md
4. docs/04_SYSTEM_ARCHITECTURE.md
5. docs/05_DATABASE_DESIGN.md
6. docs/06_API_CONTRACT.md
7. docs/07_FOUR_COURSE_MATRIX.md
8. docs/08_DEVELOPMENT_ROADMAP.md
9. docs/09_CODING_STANDARDS.md
10. docs/10_AI_AGENT_INSTRUCTIONS.md

Do not modify canonical documents unless the task explicitly requires a documentation change.

## Mandatory Startup

Every model and every new session must:

1. Read AGENTS.md.
2. Read reports/PROJECT_STATE.md.
3. Read reports/DECISIONS.md.
4. Read reports/HANDOFF.md.
5. Run git status --short.
6. Run git log --oneline --decorate -5.
7. Read only the canonical document sections relevant to the current task.
8. Verify all remembered facts against Git and files.
9. Never rely only on prior model chat memory.

## Safety

- Do not force push.
- Do not run git reset --hard.
- Do not run git clean -fd.
- Do not rebase main.
- Do not change origin.
- Do not commit real .env files.
- Do not commit passwords, tokens, API keys, secrets, or private keys.
- Do not rewrite executed Flyway migrations.
- Do not add roles, permissions, user statuses, tables, columns, or endpoints outside canonical documents.
- Do not move to another roadmap phase without a scoped task.
- Do not claim PASS without real command output, exit code 0, and BUILD SUCCESS.
- Do not commit or push if canonical documents changed outside task scope.
- Do not assume a command succeeded without checking its output.

## Work Method

- Build a task graph.
- Independent read-only tasks may run in parallel.
- Only one task may write a file at a time.
- Before commit: run build, tests, secret scan, and Git diff checks.
- After push: verify HEAD equals origin/main and working tree is clean.
- When provider or model changes, reread persistent project memory.
- If model output conflicts with Git or canonical documents, Git and canonical documents win.