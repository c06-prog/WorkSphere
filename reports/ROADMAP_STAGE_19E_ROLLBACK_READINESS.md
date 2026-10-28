# Stage 19E — Application Rollback, Image Retention, Schema Compatibility & Safe Recovery Policy Report

## Executive Summary
Roadmap Stage 19E establishes a formal rollback and recovery policy for WorkSphere, defining strict boundaries between application rollback and database restoration, cataloging schema compatibility rules for Flyway migrations, and demonstrating non-destructive application rollback in an isolated Docker rehearsal environment.

## 1. Scope & Execution Principles
- Scope: Stage 19E (Application Rollback, Image Retention, Schema Compatibility & Safe Recovery Policy).
- Exclusions: Mobile phase 19, Flyway migration tampering/downgrades, database destruction, staging/production deployments, registry publishing.
- Core Governance Principle:
  `APP_ROLLBACK_SAFE` vs `APP_ROLLBACK_REQUIRES_DB_RESTORE`.
  Application rollback is only safe if the underlying database schema remains backward-compatible with the earlier backend binary.

## 2. Rollback Taxonomy & Taxonomy Classification
- `APPLICATION_ROLLBACK`: Swapping running container image to a previous immutable tag against existing database.
- `DATABASE_RESTORE`: Full restore of database and uploads from verified backup (Stage 19D).
- `DATABASE_MIGRATION_REVERSAL`: Explicitly unsupported. Flyway migrations are forward-only.
- `CONFIGURATION_ROLLBACK`: Reversion of environment/secret variables.
- `MOBILE_ROLLBACK`: App distribution store concern.

## 3. Flyway Schema Audit (V001–V017)
- Comprehensive static and runtime audit of all 17 migrations:
  - Total `DROP TABLE` / `ALTER TABLE DROP`: **0 occurrences**.
  - Total `RENAME`: **0 occurrences**.
  - Migrations V001 through V017 are strictly additive (new tables, indexes, constraints, and nullable columns).
  - Verdict for current version history: **`APP_ROLLBACK_SAFE`**. Earlier application releases can execute against the V017 schema without crashing on missing columns.

## 4. Local Rollback Rehearsal Evidence
- **Environment**: Completely isolated network (`worksphere-restore-test-rollback-net`) and isolated PostgreSQL container/volume restored via Stage 19D tooling.
- **Current Image**: `worksphere-backend:rollback-current-38795ee` (Stage 19 runtime).
  - Health: HTTP **200 OK** (`UP`)
  - Prometheus: 399 lines exported
  - Protected API `/api/v1/users/me`: HTTP **401 Unauthorized** (X-Request-ID: `baseline-current-req-001`)
- **Rollback Execution**: Current container stopped and replaced with `worksphere-backend:rollback-previous-e231a79` (pre-19B baseline image).
- **Post-Rollback Verification**:
  - Health: HTTP **200 OK** (`UP`)
  - Prometheus: HTTP **401 Unauthorized** (Expected: endpoint was not exposed in pre-19B security config)
  - Protected API `/api/v1/users/me`: HTTP **401 Unauthorized** (Demonstrating backward-compatible database connectivity and security integrity)
  - Flyway table: 17 migrations preserved, 0 unexpected migrations triggered, 0 schema mutations.
  - Business tables & roles: 37 tables, 4 roles preserved intact.

## 5. Image Retention & Registry Policy Gap
- **Identified Gap**: Current CI builds images in ephemeral runners without pushing to a registry.
- **Status Classification**: `REGISTRY_PUBLICATION_REQUIRED_BEFORE_STAGING_ROLLBACK`.
- **Policy Standard**: Staging/production requires pushing immutable tags (`worksphere-backend:sha-<commit-sha>`) with digest recording and multi-generation retention.

## 6. Failure-Path Validation Evidence
- Missing confirmation token: **REFUSED** (`ConfirmationToken must be provided as 'ROLLBACK_WORKSPHERE_ISOLATED_TEST'`).
- Mutable tag (`:latest`): **REFUSED** (`Rollback requires an explicit, immutable image tag`).
- Non-existent image: **REFUSED** (`Target rollback image was not found`).

## 7. Preservation & Teardown
- All isolated test containers and networks stopped and purged.
- Temporary rollback test image tags untagged.
- Ports 8080, 5432, 5433, 18080, and 18081 released.
- Named volumes (`worksphere-postgres-data`, `worksphere-uploads`, `jenkins_home`) and container `worksphere-dev-pg` preserved untouched.
- `RPO = DECISION_REQUIRED`, `RTO = DECISION_REQUIRED`.
