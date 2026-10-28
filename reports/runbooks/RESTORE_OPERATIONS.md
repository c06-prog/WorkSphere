# WorkSphere Restore Operations Runbook

## 1. Overview
This runbook governs the execution of data restoration procedures for the WorkSphere platform, establishing strict isolation controls to guarantee that existing databases and file storage are never accidentally overwritten or contaminated.

## 2. Mandatory Isolation Governance
- `RESTORE_VERIFIED_LOCALLY != STAGING_DISASTER_RECOVERY_READY`: Local verification confirms dump viability and schema consistency but does not guarantee cloud disaster recovery readiness.
- **Strict Target Isolation**: Restoration must never target running canonical containers (`worksphere-compose-postgres`) or named volumes (`worksphere-postgres-data`, `worksphere-uploads`).
- **Confirmation Token**: Running `restore-local.ps1` requires `-ConfirmationToken "RESTORE_WORKSPHERE_ISOLATED_TEST"`.
- **Target Prefix Standard**: Target prefixes must begin with `worksphere-restore-test`.

## 3. Restoring into an Isolated Environment

### Command Syntax
```powershell
.\scripts\restore-local.ps1 `
    -BackupDir "backups\YYYYMMDD-HHMMSS" `
    -TargetPrefix "worksphere-restore-test-<runId>" `
    -ConfirmationToken "RESTORE_WORKSPHERE_ISOLATED_TEST" `
    -HostBackendPort 18080
```

### Pre-Flight Verification Performed by Script
1. Validates source directory structure, `manifest.json`, and `SHA256SUMS.txt`.
2. Inspects `database.dump` TOC entries with `pg_restore --list`.
3. Verifies `uploads.tar.gz` archive integrity.
4. Ensures target volumes do not already exist (refuses to overwrite existing data).
5. Launches isolated PostgreSQL container with temporary ephemeral credentials.
6. Performs `pg_restore` with `--no-owner` and `--no-privileges`.
7. Restores file storage into the isolated uploads volume via read-only source helper container.

## 4. Post-Restore Verification Checklist
1. Query restored database to verify `flyway_schema_history` count and latest version.
2. Verify business table row counts match expected baseline.
3. Check uploaded files and SHA-256 hashes inside isolated uploads volume.
4. Start temporary backend container pointing to isolated network and test `/actuator/health` and probes.

## 5. Teardown Procedure
Once verification is complete, remove all isolated test resources:
```powershell
docker stop <targetPrefix>-backend <targetPrefix>-pg
docker rm <targetPrefix>-backend <targetPrefix>-pg
docker network rm <targetPrefix>-net
docker volume rm <targetPrefix>-pgdata <targetPrefix>-uploads
```
