# WorkSphere - Local Backup Script (Stage 19C)
# Strict PowerShell script for deterministic, non-destructive PostgreSQL & File-Storage Backups

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$OutputRoot = "backups",

    [Parameter(Mandatory = $false)]
    [string]$EnvFile = ".env",

    [Parameter(Mandatory = $false)]
    [switch]$SkipUploads = $false,

    [Parameter(Mandatory = $false)]
    [int]$RetentionDays = 0,

    [Parameter(Mandatory = $false)]
    [switch]$DryRunRetention = $false
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Helper for Docker CLI path
function Resolve-DockerCli {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        $dockerBin = "C:\Users\dienm\AppData\Local\Programs\DockerDesktop\resources\bin"
        if (Test-Path $dockerBin) {
            $env:Path = "$dockerBin;" + $env:Path
        }
    }
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw "Docker CLI executable not found in PATH or standard installation directory."
    }
}

Resolve-DockerCli

# Ensure Docker Engine daemon is accessible
try {
    $engineVer = & docker info --format '{{.ServerVersion}}' 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $engineVer) {
        throw "Docker Engine daemon is not responding."
    }
} catch {
    throw "Failed to connect to Docker Engine daemon: $_"
}

# 1. Resolve Target Configuration from Environment / EnvFile
$dbUser = $env:POSTGRES_USER
$dbName = $env:POSTGRES_DB
$dbPassword = $env:POSTGRES_PASSWORD

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and ($line -match "^([^=]+)=(.*)$")) {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim()
            if (-not $dbUser -and $key -eq "POSTGRES_USER") { $dbUser = $val }
            if (-not $dbName -and $key -eq "POSTGRES_DB") { $dbName = $val }
            if (-not $dbPassword -and $key -eq "POSTGRES_PASSWORD") { $dbPassword = $val }
        }
    }
}

if (-not $dbUser) { $dbUser = "worksphere_user" }
if (-not $dbName) { $dbName = "worksphere" }

if (-not $dbPassword) {
    throw "POSTGRES_PASSWORD is not provided in environment or $EnvFile. Backup aborted."
}

# 2. Verify Compose PostgreSQL Service Container
$pgContainer = "worksphere-compose-postgres"
$pgInspect = & docker inspect $pgContainer --format '{{.State.Status}}' 2>&1
if ($LASTEXITCODE -ne 0 -or $pgInspect -ne "running") {
    throw "Container '$pgContainer' is not running (Status: '$pgInspect'). Please start services via 'docker compose up -d' before running backup."
}

# Check database health via pg_isready
$isReady = & docker exec -e PGPASSWORD=$dbPassword $pgContainer pg_isready -U $dbUser -d $dbName 2>&1
if ($LASTEXITCODE -ne 0) {
    throw "Database '$dbName' is not ready in '$pgContainer': $isReady"
}

# 3. Create Unique Timestamped Output Directory
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss")
$targetDir = Join-Path $OutputRoot $timestamp

if (Test-Path $targetDir) {
    throw "Target backup directory already exists: $targetDir"
}

New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
Write-Host "Creating backup in: $targetDir" -ForegroundColor Cyan

$backupSucceeded = $false
try {
    # 4. PostgreSQL Backup (pg_dump custom format)
    $dbDumpFile = Join-Path $targetDir "database.dump"
    Write-Host "Dumping PostgreSQL database '$dbName' to custom format..." -ForegroundColor Yellow

    # Execute pg_dump inside container directly to a container temp file, then copy out to guarantee binary preservation
    $containerDumpPath = "/tmp/ws_backup_$timestamp.dump"
    $pgDumpCmd = "pg_dump -U $dbUser -d $dbName --format=custom --no-owner --no-privileges -f $containerDumpPath"
    & docker exec -e PGPASSWORD=$dbPassword $pgContainer sh -c $pgDumpCmd

    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump inside container failed with exit code $LASTEXITCODE."
    }

    # Copy dump file from container to host target directory
    & docker cp "${pgContainer}:${containerDumpPath}" $dbDumpFile
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $dbDumpFile)) {
        throw "docker cp failed to copy database dump from container."
    }

    # Clean up temp dump file inside container
    & docker exec $pgContainer rm -f $containerDumpPath

    $dbDumpItem = Get-Item $dbDumpFile
    if ($dbDumpItem.Length -le 0) {
        throw "Database dump file is empty (0 bytes)."
    }

    # Verify dump using pg_restore --list inside container via docker run or container cp
    # We copy the dump back to /tmp/inspect_$timestamp.dump inside $pgContainer to inspect TOC
    $containerInspectPath = "/tmp/ws_inspect_$timestamp.dump"
    & docker cp $dbDumpFile "${pgContainer}:${containerInspectPath}"
    $listCheck = & docker exec $pgContainer pg_restore --list $containerInspectPath 2>&1
    & docker exec $pgContainer rm -f $containerInspectPath

    if ($LASTEXITCODE -ne 0) {
        throw "pg_restore inspection failed for dump file: $listCheck"
    }

    $hasFlyway = $false
    $listCheck | ForEach-Object {
        if ($_ -match "flyway_schema_history") {
            $hasFlyway = $true
        }
    }

    if (-not $hasFlyway) {
        Write-Warning "flyway_schema_history not found in dump archive. Database may be unmigrated."
    }

    # Query latest flyway version and postgres version from container
    $pgVersion = (& docker exec -e PGPASSWORD=$dbPassword $pgContainer psql -U $dbUser -d $dbName -t -c "SELECT version();" 2>$null)
    if ($pgVersion) { $pgVersion = $pgVersion.Trim() } else { $pgVersion = "unknown" }

    $latestFlyway = "none"
    $flywayQuery = & docker exec -e PGPASSWORD=$dbPassword $pgContainer psql -U $dbUser -d $dbName -t -c "SELECT version FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 1;" 2>$null
    if ($LASTEXITCODE -eq 0 -and $flywayQuery) {
        $latestFlyway = $flywayQuery.Trim()
    }

    # 5. Uploads File-Storage Backup (via read-only helper container)
    $uploadsArchiveFile = "none"
    $uploadsSizeBytes = 0
    $uploadsSha256 = "none"
    $uploadsVolume = "worksphere-uploads"

    if (-not $SkipUploads) {
        Write-Host "Backing up uploads volume '$uploadsVolume'..." -ForegroundColor Yellow
        $uploadsDumpFile = Join-Path $targetDir "uploads.tar.gz"

        # Check if volume exists
        $volExists = & docker volume ls -q -f name="^${uploadsVolume}$"
        if (-not $volExists) {
            throw "Docker volume '$uploadsVolume' does not exist."
        }

        # Resolve absolute host target path for helper container volume mount
        $absTargetDir = (Resolve-Path $targetDir).Path
        & docker run --rm -v "${uploadsVolume}:/data:ro" -v "${absTargetDir}:/backup_host" postgres:15-alpine tar -czf /backup_host/uploads.tar.gz -C /data .

        if ($LASTEXITCODE -ne 0 -or -not (Test-Path $uploadsDumpFile)) {
            throw "Failed to archive uploads volume."
        }

        $uploadsItem = Get-Item $uploadsDumpFile
        $uploadsSizeBytes = $uploadsItem.Length
        $uploadsArchiveFile = "uploads.tar.gz"

        # Calculate SHA256 for uploads
        $uploadsHash = (Get-FileHash -Path $uploadsDumpFile -Algorithm SHA256).Hash.ToLower()
        $uploadsSha256 = $uploadsHash
    }

    # 6. Checksums Calculation
    $dbHash = (Get-FileHash -Path $dbDumpFile -Algorithm SHA256).Hash.ToLower()
    $sha256SumsFile = Join-Path $targetDir "SHA256SUMS.txt"
    $checksumLines = @()
    $checksumLines += "$dbHash  database.dump"
    if ($uploadsArchiveFile -ne "none") {
        $checksumLines += "$uploadsSha256  $uploadsArchiveFile"
    }
    Set-Content -Path $sha256SumsFile -Value $checksumLines -Encoding UTF8

    # 7. Git Metadata
    $gitCommit = "unknown"
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $gitCommit = & git rev-parse HEAD 2>$null
        if ($gitCommit) { $gitCommit = $gitCommit.Trim() }
    }

    # 8. Manifest Generation (JSON)
    $manifestFile = Join-Path $targetDir "manifest.json"
    $manifestData = [PSCustomObject]@{
        formatVersion       = "1.0"
        createdAt           = (Get-Date).ToUniversalTime().ToString("o")
        gitCommit           = $gitCommit
        composeProject      = "worksphere"
        databaseName        = $dbName
        postgresVersion     = $pgVersion
        latestFlywayVersion = $latestFlyway
        databaseArchive     = "database.dump"
        databaseBytes       = $dbDumpItem.Length
        databaseSha256      = $dbHash
        uploadsArchive      = $uploadsArchiveFile
        uploadsBytes        = $uploadsSizeBytes
        uploadsSha256       = $uploadsSha256
        backupStatus        = "COMPLETE"
        backupEncryption    = "NOT_IMPLEMENTED"
    }

    $manifestJson = $manifestData | ConvertTo-Json -Depth 4
    Set-Content -Path $manifestFile -Value $manifestJson -Encoding UTF8

    Write-Host "[SUCCESS] Backup completed successfully in $targetDir" -ForegroundColor Green
    $backupSucceeded = $true

} catch {
    Write-Host "[ERROR] Backup failed: $_" -ForegroundColor Red
    if (Test-Path $targetDir) {
        $incompleteFile = Join-Path $targetDir "BACKUP_INCOMPLETE.txt"
        Set-Content -Path $incompleteFile -Value "Backup failed at $(Get-Date -Format 'o'): $_" -Encoding UTF8
    }
    exit 1
}

# 9. Retention Pruning (Only if RetentionDays > 0)
if ($RetentionDays -gt 0) {
    Write-Host "`nEvaluating backup retention (RetentionDays = $RetentionDays)..." -ForegroundColor Yellow
    $backupDirs = Get-ChildItem -Path $OutputRoot -Directory | Where-Object {
        $_.Name -match "^\d{8}-\d{6}$"
    } | Sort-Object Name

    $cutoffDate = (Get-Date).ToUniversalTime().AddDays(-$RetentionDays)
    $toDelete = @()

    # Never delete the newest backup
    $newest = if ($backupDirs.Count -gt 0) { $backupDirs[-1] } else { $null }

    foreach ($dir in $backupDirs) {
        if ($newest -and $dir.FullName -eq $newest.FullName) {
            continue
        }
        # Parse timestamp: yyyyMMdd-HHmmss
        try {
            $dirTime = [datetime]::ParseExact($dir.Name, "yyyyMMdd-HHmmss", [System.Globalization.CultureInfo]::InvariantCulture, [System.Globalization.DateTimeStyles]::AssumeUniversal).ToUniversalTime()
            if ($dirTime -lt $cutoffDate) {
                $toDelete += $dir
            }
        } catch {
            Write-Warning "Skipping non-standard backup directory name: $($dir.Name)"
        }
    }

    if ($toDelete.Count -gt 0) {
        foreach ($d in $toDelete) {
            if ($DryRunRetention) {
                Write-Host "[DRY-RUN] Would prune old backup: $($d.FullName)" -ForegroundColor DarkGray
            } else {
                Write-Host "Pruning expired backup: $($d.FullName)" -ForegroundColor Yellow
                Remove-Item -Path $d.FullName -Recurse -Force
            }
        }
    } else {
        Write-Host "No expired backups to prune." -ForegroundColor Gray
    }
}
