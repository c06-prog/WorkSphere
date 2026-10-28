# WorkSphere Rollback Operations Runbook

## 1. Overview & Rollback Taxonomy
Rollback operations must be precisely classified to prevent operational mistakes or data corruption:

1. **`APPLICATION_ROLLBACK`**:
   - Reverting the backend container to a previous, immutable image tag (`worksphere-backend:sha-<previous-sha>`) while running against the active database.
   - **Condition**: Only permitted when the current schema is classified as `APP_ROLLBACK_SAFE`.
2. **`DATABASE_RESTORE`**:
   - Reverting the PostgreSQL database and file-storage uploads from a verified backup snapshot using Stage 19D procedures (`restore-local.ps1`).
   - **Condition**: Mandatory whenever database mutations or schema migrations are backward-incompatible.
3. **`DATABASE_MIGRATION_REVERSAL`**:
   - **EXPLICITLY UNSUPPORTED**. Flyway migrations are forward-only. Never run automated rollback migrations or delete entries from `flyway_schema_history`.
4. **`CONFIGURATION_ROLLBACK`**:
   - Reverting environment variables or `.env` configuration to an earlier verified state.
5. **`MOBILE_ROLLBACK`**:
   - Handled via app store distribution channels, not Docker backend swaps.

---

## 2. Schema Compatibility Decision Matrix

| Change Type in Migration | Backward-Compatible with Previous App? | Verdict | Recovery Strategy |
| :--- | :--- | :--- | :--- |
| **New table created** | Yes | `APP_ROLLBACK_SAFE` | Application Rollback only |
| **New nullable column added** | Yes | `APP_ROLLBACK_SAFE` | Application Rollback only |
| **New index / foreign key added** | Yes | `APP_ROLLBACK_SAFE` | Application Rollback only |
| **Column dropped or renamed** | **NO** | `APP_ROLLBACK_REQUIRES_DB_RESTORE` | Full DB Restore + App Rollback |
| **Column type narrowed/changed** | **NO** | `APP_ROLLBACK_REQUIRES_DB_RESTORE` | Full DB Restore + App Rollback |
| **Irreversible data migration** | **NO** | `APP_ROLLBACK_REQUIRES_DB_RESTORE` | Full DB Restore + App Rollback |

---

## 3. Flyway Forward-Only Immutability Policy
- Migrations V001 through V017 in WorkSphere are strictly additive.
- Applied migrations must never be edited, deleted, or reordered.
- `flyway repair` must never be used as a routine rollback shortcut.
- Any bug fix or schema alteration requires a new, higher-version forward migration (`V018__...`).

---

## 4. Application Rollback Execution

### Prerequisites
- Deployment Checkpoint filled out (`DEPLOYMENT_CHECKPOINT_TEMPLATE.md`).
- Target rollback image present in local Docker daemon or approved registry with immutable tag.
- Pre-deployment backup verified and available.
- Confirmation token: `ROLLBACK_WORKSPHERE_ISOLATED_TEST`.

### Execution Command
```powershell
.\scripts\rollback-local.ps1 `
    -TargetImage "worksphere-backend:rollback-previous-<sha>" `
    -CurrentContainer "worksphere-compose-backend" `
    -ConfirmationToken "ROLLBACK_WORKSPHERE_ISOLATED_TEST"
```

---

## 5. Post-Rollback Verification Gate
Immediately verify runtime viability:
1. `GET /actuator/health` returns HTTP 200 `UP`.
2. Probes `/actuator/health/liveness` and `/readiness` return HTTP 200 `UP`.
3. Check `flyway_schema_history` row count has not mutated.
4. Execute non-destructive API check: `GET /api/v1/users/me` returns 401 Unauthorized (without DB errors).
5. Verify Request ID propagation and log output.

---

## 6. Remote Registry Gap & Governance
- **Current State**: CI builds images in ephemeral GitHub Actions runners without pushing to an external registry.
- **Requirement**: `REGISTRY_PUBLICATION_REQUIRED_BEFORE_STAGING_ROLLBACK`. Before staging or production deployments, images must be pushed to a secure, private registry with immutable SHA tags and recorded digests.
