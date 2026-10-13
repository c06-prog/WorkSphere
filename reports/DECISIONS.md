# WorkSphere Decisions

## D-001 Architecture

WorkSphere uses a Modular Monolith.

Do not split WorkSphere into microservices unless canonical documents are explicitly updated by a dedicated design task.

## D-002 Database

PostgreSQL is the production-equivalent database.

H2 may be used for fast tests but cannot replace PostgreSQL integration validation.

## D-003 Java

The project target is Java 21.

A newer local JDK does not change the project target.

CI and future runtime images should align with Java 21 unless canonical documents explicitly change this decision.

## D-004 Flyway

Flyway migrations V001 through V011 are versioned history.

Do not rewrite migration history.

If a migration defect is discovered after it has been shared, add a corrective migration or corrective commit according to project rules.

## D-005 Persistent Project Memory

Project memory is stored in:

- AGENTS.md
- reports/PROJECT_STATE.md
- reports/DECISIONS.md
- reports/HANDOFF.md
- Git history
- Build and test outputs

Model chat history is not a source of truth.

## D-006 Model Failover

FCM Smart Router may change models when a provider returns:

- HTTP 429
- HTTP 5xx
- Timeout
- Empty or invalid content

A replacement model must:

- Read persistent project memory.
- Verify Git state.
- Continue only within the current task scope.
- Never assume earlier tool calls succeeded without evidence.

## D-007 Storage

Heavy AI data uses:

- D:\AI

Docker disk data uses:

- D:\DockerData\DockerDesktopWSL

WorkSphere source uses:

- D:\WorkSphere

Large AI packages, cache, model data, and router data must not be intentionally stored on drive C.

## D-008 Model Trust

A large context window does not guarantee correctness.

A model must pass shell, Git, file-read, and no-write tests before receiving repository write permission.

Only validated work may be committed and pushed.
## D-009 Current Model Selection

FCM automatic routing is disabled until at least two authenticated
providers are available and verified.

Current operating mode:

- Use FCM dashboard to select a model manually.
- Use OpenCode for small, bounded tasks.
- Persistent project memory remains independent of the selected model.
- Antigravity remains the primary agent for major roadmap phases.
- Do not enable automatic failover solely from public health pings.