# WorkSphere Backup Operations Runbook

## 1. Overview
This runbook describes standard procedures for performing non-destructive, reproducible local backups of the WorkSphere PostgreSQL database and user uploads volume.

## 2. Policy Boundaries
- `BACKUP_CREATED != RESTORE_VERIFIED`: Creating a valid dump archive does not constitute a verified restoration. Restoration must be rehearsed according to Stage 19D procedures.
- `BACKUP_ENCRYPTION = NOT_IMPLEMENTED`: Dumps are stored in compressed binary formats without at-rest encryption. Local OS access controls and directory permissions must be maintained.
- `RETENTION_POLICY`: Opt-in via `-RetentionDays <N>`. Default behavior retains all backups until explicitly pruned or deleted.

## 3. Creating a Backup

### Prerequisites
- Docker Desktop / Engine running.
- WorkSphere Docker Compose stack active (`docker compose up -d`).
- `.env` file present or environment variables (`POSTGRES_PASSWORD`, `POSTGRES_USER`, `POSTGRES_DB`) exported.

### Command Execution
```powershell
# Standard backup (database + uploads volume)
.\scripts\backup-local.ps1 -EnvFile .env

# Skip uploads volume if only database is needed
.\scripts\backup-local.ps1 -EnvFile .env -SkipUploads

# Execute backup and prune backups older than 7 days
.\scripts\backup-local.ps1 -EnvFile .env -RetentionDays 7

# Dry-run retention check without deleting any files
.\scripts\backup-local.ps1 -EnvFile .env -RetentionDays 7 -DryRunRetention
```

## 4. Verifying a Backup Archive
Validate the structural integrity, SHA-256 checksums, and TOC readability of a backup:
```powershell
.\scripts\verify-backup.ps1 -BackupDir backups\YYYYMMDD-HHMMSS
```

Validation steps performed:
1. Validates directory timestamp format (`yyyyMMdd-HHmmss`).
2. Checks absence of failure flags (`BACKUP_INCOMPLETE.txt`).
3. Scans for accidental credential leakage (`*.key`, `*.keystore`, `.env*`).
4. Checks non-zero size for `database.dump`.
5. Validates `manifest.json` schema and metadata.
6. Recalculates and verifies SHA-256 hashes against `SHA256SUMS.txt`.
7. Checks readability of `uploads.tar.gz`.
8. Verifies `database.dump` TOC entries via `pg_restore --list`.

## 5. Security & Retention Rules
- Never commit `backups/` directories, dumps, or archives to Git (enforced in `.gitignore`).
- Never delete volumes (`-v`) during stack shutdown.
- Never prune backups without verifying folder timestamp naming.
