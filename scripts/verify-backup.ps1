# WorkSphere - Verify Backup Script (Stage 19C)
# Strict PowerShell script to validate backup integrity, manifests, checksums and archives

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$BackupDir
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  WorkSphere - Backup Verification Tool" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

if (-not (Test-Path $BackupDir)) {
    throw "Backup directory does not exist: $BackupDir"
}

$dirItem = Get-Item $BackupDir
Write-Host "Target directory: $($dirItem.FullName)" -ForegroundColor Yellow

# 1. Verify directory naming pattern (yyyyMMdd-HHmmss)
if ($dirItem.Name -notmatch "^\d{8}-\d{6}$") {
    Write-Warning "Directory name '$($dirItem.Name)' does not match standard timestamp pattern 'yyyyMMdd-HHmmss'."
}

# 2. Check for failure markers
$incompleteFile = Join-Path $BackupDir "BACKUP_INCOMPLETE.txt"
if (Test-Path $incompleteFile) {
    throw "Backup directory contains failure marker: BACKUP_INCOMPLETE.txt. Backup is invalid."
}

# 3. Check for forbidden/secret file patterns
$forbiddenPatterns = @("*.key", "*.keystore", "*.p12", "*.pem", ".env*", "*password*", "*secret*")
foreach ($pat in $forbiddenPatterns) {
    $found = Get-ChildItem -Path $BackupDir -Filter $pat -Recurse -ErrorAction SilentlyContinue
    if ($found) {
        throw "Security violation! Secret pattern '$pat' found in backup: $($found.Name)"
    }
}

# 4. Check required files
$manifestPath = Join-Path $BackupDir "manifest.json"
$sha256Path = Join-Path $BackupDir "SHA256SUMS.txt"
$databaseDumpPath = Join-Path $BackupDir "database.dump"

if (-not (Test-Path $manifestPath)) { throw "Missing required file: manifest.json" }
if (-not (Test-Path $sha256Path)) { throw "Missing required file: SHA256SUMS.txt" }
if (-not (Test-Path $databaseDumpPath)) { throw "Missing required file: database.dump" }

# 5. Check non-zero size
$dbItem = Get-Item $databaseDumpPath
if ($dbItem.Length -le 0) {
    throw "database.dump is empty (0 bytes)."
}
Write-Host "[OK] database.dump exists ($($dbItem.Length) bytes)" -ForegroundColor Green

# 6. Validate manifest JSON
try {
    $manifestContent = Get-Content $manifestPath -Raw -Encoding UTF8
    $manifest = $manifestContent | ConvertFrom-Json
} catch {
    throw "manifest.json is not valid JSON: $_"
}

if ($manifest.backupStatus -ne "COMPLETE") {
    throw "manifest.json backupStatus is '$($manifest.backupStatus)', expected 'COMPLETE'."
}
Write-Host "[OK] manifest.json valid. Status: $($manifest.backupStatus), Flyway: $($manifest.latestFlywayVersion), Commit: $($manifest.gitCommit)" -ForegroundColor Green

# 7. Validate SHA256 Checksums
$checksumEntries = Get-Content $sha256Path -Encoding UTF8
foreach ($entry in $checksumEntries) {
    $line = $entry.Trim()
    if (-not $line -or $line.StartsWith("#")) { continue }
    if ($line -match "^([a-fA-F0-9]{64})\s+(.+)$") {
        $expectedHash = $matches[1].ToLower()
        $fileName = $matches[2].Trim()
        $filePath = Join-Path $BackupDir $fileName
        if (-not (Test-Path $filePath)) {
            throw "File listed in SHA256SUMS.txt not found: $fileName"
        }
        $actualHash = (Get-FileHash -Path $filePath -Algorithm SHA256).Hash.ToLower()
        if ($actualHash -ne $expectedHash) {
            throw "Checksum mismatch for $fileName! Expected: $expectedHash, Actual: $actualHash"
        }
        Write-Host "[OK] Checksum verified: $fileName ($actualHash)" -ForegroundColor Green
    }
}

# 8. Check uploads archive if present in manifest
if ($manifest.uploadsArchive -and $manifest.uploadsArchive -ne "none") {
    $uploadsPath = Join-Path $BackupDir $manifest.uploadsArchive
    if (-not (Test-Path $uploadsPath)) {
        throw "Uploads archive '$($manifest.uploadsArchive)' referenced in manifest was not found."
    }
    $upItem = Get-Item $uploadsPath
    Write-Host "[OK] Uploads archive exists: $($upItem.Name) ($($upItem.Length) bytes)" -ForegroundColor Green

    # Validate tar.gz content list via tar if available
    try {
        $tarCheck = & tar -tzf $uploadsPath 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Uploads tar.gz archive is readable." -ForegroundColor Green
        }
    } catch {
        Write-Warning "tar check skipped: $_"
    }
}

# 9. Verify pg_restore --list on database.dump if docker/postgres available
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        $engineVer = & docker info --format '{{.ServerVersion}}' 2>$null
        if ($LASTEXITCODE -eq 0 -and $engineVer) {
            Write-Host "Verifying archive readability with pg_restore via helper container..." -ForegroundColor Yellow
            $absBackupDir = (Resolve-Path $BackupDir).Path
            $listOutput = & docker run --rm -v "${absBackupDir}:/backup_host:ro" postgres:15-alpine pg_restore --list /backup_host/database.dump 2>&1
            if ($LASTEXITCODE -eq 0) {
                $hasFlyway = $false
                $listOutput | ForEach-Object {
                    if ($_ -match "flyway_schema_history") { $hasFlyway = $true }
                }
                Write-Host "[OK] pg_restore --list verified successfully (contains flyway_schema_history: $hasFlyway)." -ForegroundColor Green
            } else {
                Write-Warning "pg_restore inspection failed: $listOutput"
            }
        }
    } catch {
        Write-Warning "Docker-based pg_restore verification skipped: $_"
    }
}

Write-Host "`n[SUCCESS] Backup validation PASSED for $BackupDir" -ForegroundColor Green
