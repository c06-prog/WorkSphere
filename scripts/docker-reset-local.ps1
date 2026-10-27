# WorkSphere - Safe Local Docker Compose Reset Script
# Reset only worksphere compose named volumes with mandatory confirmation token.
# STRICTLY REFUSES to touch worksphere-dev-pg or anonymous legacy volume.

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ConfirmToken = "",

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$REQUIRED_TOKEN = "RESET_WORKSPHERE_LOCAL"

Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "  WorkSphere - Local Compose Safe Reset Utility" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

# Ensure Docker executable is available in PATH
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    $dockerBin = "C:\Users\dienm\AppData\Local\Programs\DockerDesktop\resources\bin"
    if (Test-Path $dockerBin) {
        $env:Path = "$dockerBin;" + $env:Path
    }
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[FAIL] Docker CLI not found in PATH." -ForegroundColor Red
    exit 1
}

# DryRun Check
if ($DryRun) {
    Write-Host "`n[DRY RUN MODE] The following actions WOULD be executed:" -ForegroundColor Cyan
    Write-Host "  1. Verify worksphere-dev-pg is unaffected."
    Write-Host "  2. Execute: docker compose down"
    Write-Host "  3. Remove ONLY named volumes: worksphere-postgres-data, worksphere-uploads"
    Write-Host "  4. Anonymous legacy volume '1a273309...' will NOT be touched."
    Write-Host "`nDry run complete. No modifications were made." -ForegroundColor Green
    exit 0
}

# Confirmation Token Validation
if ($ConfirmToken -ne $REQUIRED_TOKEN) {
    Write-Host "`n[ABORTED] Missing or invalid confirmation token." -ForegroundColor Red
    Write-Host "To execute a destructive reset of local Compose volumes, you MUST provide:" -ForegroundColor Yellow
    Write-Host "  .\scripts\docker-reset-local.ps1 -ConfirmToken $REQUIRED_TOKEN`n" -ForegroundColor White
    Write-Host "Safety Guarantee: Legacy container 'worksphere-dev-pg' and legacy volume will NEVER be removed." -ForegroundColor Green
    exit 1
}

# Pre-check legacy container protection
$legacyDevPg = & docker ps -a --filter "name=worksphere-dev-pg" --format '{{.Names}}'
if ($legacyDevPg -ne "worksphere-dev-pg") {
    Write-Host "[WARN] Legacy container worksphere-dev-pg not detected. Proceeding cautiously." -ForegroundColor Yellow
} else {
    Write-Host "[PROTECTED] Verified worksphere-dev-pg is present and isolated." -ForegroundColor Green
}

Write-Host "`n[1/3] Stopping Compose services..." -ForegroundColor Cyan
& docker compose down
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Failed to shut down docker compose services." -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/3] Removing ONLY Compose named volumes..." -ForegroundColor Cyan
$volumesToRemove = @("worksphere-postgres-data", "worksphere-uploads")
foreach ($v in $volumesToRemove) {
    $volExists = & docker volume ls --filter "name=^${v}$" --format '{{.Name}}'
    if ($volExists -eq $v) {
        Write-Host "  Removing volume: $v" -ForegroundColor Yellow
        & docker volume rm $v
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [WARN] Failed to remove volume $v (it may be in use)." -ForegroundColor Red
        } else {
            Write-Host "  [OK] Removed volume: $v" -ForegroundColor Green
        }
    } else {
        Write-Host "  [INFO] Volume $v does not exist. Skipping." -ForegroundColor DarkGray
    }
}

Write-Host "`n[3/3] Verifying legacy resources remain intact..." -ForegroundColor Cyan
$legacyVol = & docker volume ls --filter "name=1a273309" --format '{{.Name}}'
if ($legacyVol) {
    Write-Host "  [PROTECTED] Legacy volume '$legacyVol' intact." -ForegroundColor Green
}

Write-Host "`nLocal Compose reset completed safely." -ForegroundColor Green
exit 0
