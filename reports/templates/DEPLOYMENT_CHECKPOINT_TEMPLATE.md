# WorkSphere Deployment Checkpoint Template

> **Purpose**: Record immutable metadata, provenance, and verification state before executing any deployment or upgrade, enabling immediate, deterministic application rollback or database recovery.

## 1. Release Provenance & Artifact Identifiers
- **Deployment ID**: `DEPLOY-YYYYMMDD-HHMMSS`
- **Deployment Timestamp (UTC)**: `YYYY-MM-DDTHH:MM:SSZ`
- **Target Environment**: `LOCAL` | `STAGING` | `PRODUCTION`
- **Git Commit SHA**: `<full-40-char-git-commit-sha>`
- **Docker Image Tag**: `worksphere-backend:sha-<short-sha>`
- **Docker Image Digest**: `sha256:<64-char-image-digest>`
- **OCI Image Labels**:
  - `org.opencontainers.image.revision`: `<commit-sha>`
  - `org.opencontainers.image.created`: `<iso-timestamp>`

## 2. Database & Schema State
- **Flyway Target Version**: `V0XX`
- **Pre-Deployment Flyway Version**: `V0YY`
- **Schema Compatibility Classification**:
  - `APP_ROLLBACK_SAFE` (Pure additive schema changes; previous application version remains fully backward-compatible)
  - `APP_ROLLBACK_REQUIRES_DB_RESTORE` (Schema or state mutations prevent previous app version from running cleanly)
  - `ROLLBACK_BLOCKED_SCHEMA_INCOMPATIBLE` (Destructive migration or data loss occurred)
- **Pre-Deployment Backup Reference**:
  - Database Dump ID: `backups/YYYYMMDD-HHMMSS/database.dump`
  - Uploads Archive ID: `backups/YYYYMMDD-HHMMSS/uploads.tar.gz`
  - Manifest Checksum: `SHA256SUMS.txt`
  - Backup Validation Status: `COMPLETE` (`verify-backup.ps1` PASSED)

## 3. Rollback Candidate Definition
- **Rollback Type Supported**: `APPLICATION_ROLLBACK` | `DATABASE_RESTORE`
- **Designated Rollback Image**: `worksphere-backend:sha-<previous-sha>`
- **Rollback Image Availability**: `VERIFIED_IN_REGISTRY` | `PRESENT_LOCAL_DAEMON`
- **Target Rollback Database Snapshot**: `backups/YYYYMMDD-HHMMSS/`
- **Rollback Confirmation Token**: `ROLLBACK_WORKSPHERE_ISOLATED_TEST` (or environment approval token)

## 4. Verification & Health Gate
- **Post-Deploy Health URL**: `/actuator/health`
- **Metrics Scraping URL**: `/actuator/prometheus`
- **Protected Endpoint Smoke Test**: `/api/v1/users/me`
- **Authorized Deployer / Agent**: `<identifier>`
