# Stage 19C — PostgreSQL & File-Storage Backup Foundation, Checksums, Manifests & Retention

## Executive Summary
Roadmap Stage 19C introduces automated, non-destructive, verifiable backup capabilities for the WorkSphere local environment, covering both PostgreSQL database data/schema and file storage uploads, meeting all requirements in `docs/08_DEVELOPMENT_ROADMAP.md` and `docs/10_AI_AGENT_INSTRUCTIONS.md`.

## 1. Scope & Execution Principles
- Scope: Stage 19C (Backup Foundation, Checksums, Manifests & Retention).
- Exclusions: Mobile phase 19, logging/monitoring re-execution, Stage 19D restore rehearsal, Stage 19E rollback, staging/production deployments, credential backup.
- Core Tenet: `BACKUP_CREATED != RESTORE_VERIFIED`. Full restoration validation is strictly deferred to Stage 19D.

## 2. Resource Inventory & Mapping
- **Logical Compose Services vs Actual Docker Container Names**:
  - PostgreSQL Service: `postgres` -> Container Name: `worksphere-compose-postgres`
  - Backend Service: `backend` -> Container Name: `worksphere-compose-backend`
- **Volume Naming**:
  - Database Volume: `worksphere-postgres-data` (Driver: `local`)
  - File Storage Volume: `worksphere-uploads` (Driver: `local`, mounted at `/app/uploads`)
- **Preserved Legacy Resources**:
  - Container `worksphere-dev-pg` and its anonymous volumes remained untouched throughout the rehearsal.

## 3. Tooling Architecture & Implementation
Two strict PowerShell scripts were authored under [scripts/](file:///d:/WorkSphere/scripts):
1. **[scripts/backup-local.ps1](file:///d:/WorkSphere/scripts/backup-local.ps1)**:
   - Sets strict mode (`Set-StrictMode -Version Latest`, `$ErrorActionPreference = "Stop"`).
   - Validates Docker daemon connectivity and container health via `pg_isready`.
   - Dumps PostgreSQL database using `pg_dump` with custom format (`--format=custom`, `--no-owner`, `--no-privileges`). Custom format enables granular inspection via `pg_restore --list` without plain text SQL exposure.
   - Archives the `worksphere-uploads` volume read-only into `uploads.tar.gz` using an isolated helper container (`postgres:15-alpine`), preventing mutations or symlink exploitation.
   - Generates SHA-256 hashes for all output archives into `SHA256SUMS.txt`.
   - Produces machine-readable metadata in `manifest.json`.
   - Supports conservative, opt-in retention pruning (`-RetentionDays N`, `-DryRunRetention`), strictly guarding the newest backup and validating folder naming patterns (`yyyyMMdd-HHmmss`).
2. **[scripts/verify-backup.ps1](file:///d:/WorkSphere/scripts/verify-backup.ps1)**:
   - Validates folder naming, presence of required files, and non-zero byte sizes.
   - Scans for forbidden patterns (`*.key`, `*.keystore`, `.env*`, `*password*`, `*secret*`).
   - Validates JSON manifest parsing and checks `backupStatus == "COMPLETE"`.
   - Recalculates and verifies SHA-256 hashes against `SHA256SUMS.txt`.
   - Validates readability of `uploads.tar.gz` using `tar -tzf`.
   - Validates readability and TOC structure of `database.dump` via helper container `pg_restore --list`, confirming table schemas and `flyway_schema_history`.

## 4. Manifest Schema & Content Example
```json
{
  "formatVersion": "1.0",
  "createdAt": "2026-10-28T02:18:13.3631271Z",
  "gitCommit": "cbd20ae2719532297c78ccd8bdd5096887245476",
  "composeProject": "worksphere",
  "databaseName": "worksphere",
  "postgresVersion": "PostgreSQL 15.19 on x86_64-pc-linux-musl",
  "latestFlywayVersion": "017",
  "databaseArchive": "database.dump",
  "databaseBytes": 95325,
  "databaseSha256": "3ff7d9872023d8c1eca491028d0d03a5b0472dce69ab87171d809b75c3f8dfdb",
  "uploadsArchive": "uploads.tar.gz",
  "uploadsBytes": 114,
  "uploadsSha256": "e8cc3a7610c37485fe169b4bb6904707adfa1c22620a4ea0c58eda38d8cdd1b6",
  "backupStatus": "COMPLETE",
  "backupEncryption": "NOT_IMPLEMENTED"
}
```

## 5. Local Rehearsal Evidence & Verification
- Started Compose stack (`worksphere-compose-postgres`, `worksphere-compose-backend`).
- Executed `.\scripts\backup-local.ps1 -EnvFile .env`:
  - Output directory created: `backups\20261028-021811`
  - `database.dump` generated: 95,325 bytes.
  - `uploads.tar.gz` generated: 114 bytes.
  - Verified `pg_restore --list` inside container: contains 225 TOC entries including `flyway_schema_history`.
- Executed `.\scripts\verify-backup.ps1 -BackupDir backups\20261028-021811`:
  - Checksum verification: PASSED.
  - Manifest validation: PASSED.
  - Archive integrity inspection: PASSED.
- Tested Retention Policy in dry-run and active modes with mock timestamps:
  - Expired mock directories pruned cleanly; newest backup guarded.
- Teardown & Preservation:
  - Stack stopped cleanly (`docker compose down` without `-v`).
  - Temporary `.env` deleted. Rehearsal backup directory deleted from host.
  - Ports 8080 and 5433 verified released.
  - Volumes `worksphere-postgres-data` and `worksphere-uploads` intact.
  - Legacy `worksphere-dev-pg` preserved.

## 6. RPO/RTO & Production Policy Status
- `RPO = DECISION_REQUIRED` (No production SLA approved in canonical docs yet).
- `RTO = DECISION_REQUIRED`.
- `PRODUCTION_BACKUP_FREQUENCY = DECISION_REQUIRED`.
- `OFF_HOST_STORAGE = NOT_IMPLEMENTED` (Local storage target only).
- `BACKUP_ENCRYPTION = NOT_IMPLEMENTED` (Local access control required).
- `RESTORE_FREQUENCY = DECISION_REQUIRED`.

## 7. Next Stage
- Stage 19D: Disaster Recovery & Restore Rehearsal (testing restore into isolated sandbox database and staging storage).
