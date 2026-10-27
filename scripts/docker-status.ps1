# WorkSphere - Local Docker Compose Status Script
# Strict PowerShell Script to report finite Compose health & resource state

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$EnvFile = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  WorkSphere - Local Docker Compose Status Check" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Ensure Docker executable is available in PATH
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    $dockerBin = "C:\Users\dienm\AppData\Local\Programs\DockerDesktop\resources\bin"
    if (Test-Path $dockerBin) {
        $env:Path = "$dockerBin;" + $env:Path
    }
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[FAIL] Docker CLI not found in system or Docker Desktop PATH." -ForegroundColor Red
    exit 1
}

# 2. Check Docker Engine daemon connectivity
try {
    $dockerInfo = & docker info --format '{{.ServerVersion}}' 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $dockerInfo) {
        Write-Host "[FAIL] Docker Engine daemon is not responding." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Docker Engine version: $dockerInfo" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Docker Engine connectivity error: $_" -ForegroundColor Red
    exit 1
}

# 3. Check Docker Compose Services Status
Write-Host "`n--- Docker Compose Services ---" -ForegroundColor Yellow
$composeArgs = @("compose")
if ($EnvFile -and (Test-Path $EnvFile)) {
    $composeArgs += @("--env-file", $EnvFile)
}
$composeArgs += @("ps", "--format", "table {{.Name}}`t{{.Service}}`t{{.Status}}`t{{.Ports}}")

$composePs = & docker $composeArgs 2>$null
if ($LASTEXITCODE -eq 0 -and $composePs) {
    $composePs | Out-String | Write-Host
} else {
    Write-Host "[INFO] No active Docker Compose services reporting (or environment variables not set)." -ForegroundColor DarkGray
    # Fallback: check containers by deterministic name
    $directContainers = & docker ps --filter "name=worksphere-compose" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}" 2>$null
    if ($directContainers) {
        Write-Host "Direct container match:" -ForegroundColor Cyan
        $directContainers | Out-String | Write-Host
    }
}

# 4. Check Ports Availability
Write-Host "--- Port Bindings Status ---" -ForegroundColor Yellow
$ports = @(8080, 5433, 5432)
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) {
        $states = ($conns | Select-Object -ExpandProperty State) -join ", "
        Write-Host " [IN USE] Port $p : $states" -ForegroundColor Cyan
    } else {
        Write-Host " [FREE]   Port $p" -ForegroundColor Green
    }
}

# 5. Check Dedicated Compose Volumes
Write-Host "`n--- Named Volumes Check ---" -ForegroundColor Yellow
$expectedVolumes = @("worksphere-postgres-data", "worksphere-uploads")
$existingVolumes = & docker volume ls --format '{{.Name}}'
foreach ($v in $expectedVolumes) {
    if ($existingVolumes -contains $v) {
        Write-Host " [OK] Volume exists: $v" -ForegroundColor Green
    } else {
        Write-Host " [INFO] Volume not present yet: $v" -ForegroundColor DarkGray
    }
}

# 6. Legacy Environment Safety Check
Write-Host "`n--- Legacy Resource Safety Check ---" -ForegroundColor Yellow
$legacyDevPg = & docker ps -a --filter "name=worksphere-dev-pg" --format '{{.Names}} (Status: {{.Status}})'
if ($legacyDevPg) {
    Write-Host " [PROTECTED] Legacy container exists: $legacyDevPg" -ForegroundColor Green
} else {
    Write-Host " [WARN] Legacy container worksphere-dev-pg not found in docker inventory." -ForegroundColor Yellow
}

Write-Host "`nDocker status check finished successfully." -ForegroundColor Cyan
exit 0
