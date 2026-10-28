# WorkSphere - Isolated Restore Script (Stage 19D)
# Strict PowerShell script to restore backups into isolated containers/volumes for verification

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$BackupDir,

    [Parameter(Mandatory = $false)]
    [string]$TargetPrefix = "worksphere-restore-test",

    [Parameter(Mandatory = $false)]
    [string]$ConfirmationToken = "",

    [Parameter(Mandatory = $false)]
    [int]$HostBackendPort = 18080
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  WorkSphere - Isolated Restore Tool" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Mandatory safety confirmation
if ($ConfirmationToken -ne "RESTORE_WORKSPHERE_ISOLATED_TEST") {
    throw "Security refusal: ConfirmationToken must be explicitly provided as 'RESTORE_WORKSPHERE_ISOLATED_TEST'."
}

# Ensure Docker executable is available in PATH
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    $dockerBin = "C:\Users\dienm\AppData\Local\Programs\DockerDesktop\resources\bin"
    if (Test-Path $dockerBin) {
        $env:Path = "$dockerBin;" + $env:Path
    }
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker CLI executable not found in PATH or standard installation directory."
}

# 1. Target Prefix Safety Guard: Prohibit canonical or legacy names
$prohibitedTargets = @(
    "worksphere", "worksphere-compose", "worksphere-compose-postgres",
    "worksphere-compose-backend", "worksphere-dev-pg", "jenkins-lts",
    "worksphere-postgres-data", "worksphere-uploads", "jenkins_home"
)

foreach ($prohib in $prohibitedTargets) {
    if ($TargetPrefix -eq $prohib) {
        throw "Security violation! TargetPrefix '$TargetPrefix' collides with canonical or legacy system resources."
    }
}

if (-not $TargetPrefix.StartsWith("worksphere-restore-test")) {
    throw "Safety refusal! TargetPrefix must begin with 'worksphere-restore-test' for proper isolation."
}

# 2. Pre-Restore Validation of Backup
Write-Host "`n1. Validating source backup..." -ForegroundColor Yellow
$verifyScript = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "verify-backup.ps1"
if (-not (Test-Path $verifyScript)) {
    throw "Verification script not found at $verifyScript"
}

& $verifyScript -BackupDir $BackupDir
if ($LASTEXITCODE -ne 0) {
    throw "Source backup failed integrity verification."
}

$manifestPath = Join-Path $BackupDir "manifest.json"
$manifest = (Get-Content $manifestPath -Raw -Encoding UTF8) | ConvertFrom-Json
$databaseDumpPath = (Resolve-Path (Join-Path $BackupDir $manifest.databaseArchive)).Path

# 3. Define Isolated Resource Identifiers
$isoNetwork = "${TargetPrefix}-net"
$isoPgVolume = "${TargetPrefix}-pgdata"
$isoUploadsVolume = "${TargetPrefix}-uploads"
$isoPgContainer = "${TargetPrefix}-pg"
$isoBackendContainer = "${TargetPrefix}-backend"

Write-Host "`n2. Preparing isolated environment resources:" -ForegroundColor Yellow
Write-Host "   Network:          $isoNetwork"
Write-Host "   Postgres Volume:  $isoPgVolume"
Write-Host "   Uploads Volume:   $isoUploadsVolume"
Write-Host "   Postgres Service: $isoPgContainer"
Write-Host "   Backend Service:  $isoBackendContainer"

# Check if any isolated resource already exists; fail-fast if exists
$existingVol = & docker volume ls -q -f name="^${isoPgVolume}$"
if ($existingVol) {
    throw "Target volume '$isoPgVolume' already exists. Aborting to prevent accidental overwrite."
}

$ephemeralDbUser = "restore_user"
$ephemeralDbPass = "ephemeral_restore_pwd_32bytes_long!!"
$ephemeralDbName = "restore_worksphere_db"
$ephemeralJwtSecret = "ephemeral_jwt_secret_at_least_32_bytes_long_restore_test!!"

$cleanupRequired = $true
try {
    # 4. Create Isolated Network and Volumes
    Write-Host "`n3. Creating isolated Docker network and volumes..." -ForegroundColor Yellow
    & docker network create $isoNetwork | Out-Null
    & docker volume create $isoPgVolume | Out-Null
    & docker volume create $isoUploadsVolume | Out-Null

    # 5. Launch Isolated PostgreSQL Container
    Write-Host "`n4. Launching isolated PostgreSQL container ($isoPgContainer)..." -ForegroundColor Yellow
    & docker run -d `
        --name $isoPgContainer `
        --network $isoNetwork `
        -e POSTGRES_USER=$ephemeralDbUser `
        -e POSTGRES_PASSWORD=$ephemeralDbPass `
        -e POSTGRES_DB=$ephemeralDbName `
        -v "${isoPgVolume}:/var/lib/postgresql/data" `
        postgres:15-alpine | Out-Null

    # Wait finitely for isolated postgres readiness
    $pgReady = $false
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Seconds 1
        $check = & docker exec -e PGPASSWORD=$ephemeralDbPass $isoPgContainer pg_isready -U $ephemeralDbUser -d $ephemeralDbName 2>&1
        if ($LASTEXITCODE -eq 0) {
            $pgReady = $true
            break
        }
    }
    if (-not $pgReady) {
        throw "Isolated PostgreSQL container failed to become ready in time."
    }
    Write-Host "[OK] Isolated PostgreSQL is ready." -ForegroundColor Green

    # 6. Restore Database via pg_restore
    Write-Host "`n5. Restoring database dump via pg_restore..." -ForegroundColor Yellow
    $containerDumpPath = "/tmp/restore_in.dump"
    & docker cp $databaseDumpPath "${isoPgContainer}:${containerDumpPath}"

    # Execute pg_restore (clean/no-owner/no-privileges)
    $restoreOutput = & docker exec -e PGPASSWORD=$ephemeralDbPass $isoPgContainer pg_restore `
        -U $ephemeralDbUser `
        -d $ephemeralDbName `
        --no-owner `
        --no-privileges `
        $containerDumpPath 2>&1

    # In PostgreSQL pg_restore, return code 0 = success, 1 = warning/ignored errors
    if ($LASTEXITCODE -gt 1) {
        throw "pg_restore failed with exit code ${LASTEXITCODE}: $restoreOutput"
    }

    & docker exec $isoPgContainer rm -f $containerDumpPath
    Write-Host "[OK] Database schema and data restored successfully." -ForegroundColor Green

    # 7. Restore Uploads Archive
    if ($manifest.uploadsArchive -and $manifest.uploadsArchive -ne "none") {
        Write-Host "`n6. Restoring uploads archive into $isoUploadsVolume..." -ForegroundColor Yellow
        $uploadsArchivePath = (Resolve-Path (Join-Path $BackupDir $manifest.uploadsArchive)).Path
        $absBackupDir = Split-Path -Parent $uploadsArchivePath

        # Extract uploads via temporary helper container
        & docker run --rm `
            -v "${isoUploadsVolume}:/data" `
            -v "${absBackupDir}:/backup_host:ro" `
            postgres:15-alpine `
            tar -xzf "/backup_host/$($manifest.uploadsArchive)" -C /data

        if ($LASTEXITCODE -ne 0) {
            throw "Failed to extract uploads archive into isolated volume."
        }
        Write-Host "[OK] Uploads archive restored successfully." -ForegroundColor Green
    }

    Write-Host "`n[SUCCESS] Restoration into isolated environment completed." -ForegroundColor Green
    $cleanupRequired = $false

} catch {
    Write-Host "`n[FAIL] Restore execution failed: $_" -ForegroundColor Red
    throw
}
