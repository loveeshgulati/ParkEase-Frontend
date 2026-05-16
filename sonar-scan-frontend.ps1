# =========================================================
# sonar-scan-frontend.ps1
# Run SonarQube analysis on ParkEase Angular Frontend
#
# USAGE:
#   .\sonar-scan-frontend.ps1 -Token "your_sonar_token"
#   .\sonar-scan-frontend.ps1  (uses $env:SONAR_TOKEN if set)
# =========================================================

param(
    [string]$Token = $env:SONAR_TOKEN,
    [string]$SonarUrl = "http://localhost:9000",
    [string]$ProjectKey = "parkease-frontend"
)

# --- Validate token ---
if (-not $Token) {
    Write-Error "No SonarQube token provided. Pass -Token 'xxxx' or set `$env:SONAR_TOKEN"
    exit 1
}

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  ParkEase Frontend - SonarQube Analysis" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Server  : $SonarUrl" -ForegroundColor Gray
Write-Host "  Project : $ProjectKey" -ForegroundColor Gray
Write-Host ""

# --- Check sonarqube-scanner is available ---
if (-not (Get-Command "sonar-scanner" -ErrorAction SilentlyContinue)) {
    Write-Host "[!] sonar-scanner not found. Installing via npm..." -ForegroundColor Yellow
    npm install -g sonarqube-scanner
}

# --- Install npm dependencies if needed ---
if (-not (Test-Path "node_modules")) {
    Write-Host "[1/3] Installing npm dependencies..." -ForegroundColor Green
    npm ci
}

# --- Step 1: Run Angular tests with coverage ---
Write-Host ""
Write-Host "[2/3] Running Angular tests with code coverage..." -ForegroundColor Green
Write-Host "      (uses ChromeHeadless - make sure Chrome is installed)" -ForegroundColor Gray

npx ng test `
    --watch=false `
    --browsers=ChromeHeadless `
    --code-coverage

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Some tests failed or no tests found, continuing with analysis..."
}

# --- Check coverage report was generated ---
$lcovPath = "coverage\parkease-frontend\lcov.info"
if (Test-Path $lcovPath) {
    Write-Host "Coverage report found at: $lcovPath" -ForegroundColor Green
} else {
    Write-Warning "lcov.info not found at expected path. Coverage metrics won't be available."
    Write-Warning "Expected: $lcovPath"
}

# --- Step 2: Run SonarQube Scanner ---
Write-Host ""
Write-Host "[3/3] Running SonarQube analysis..." -ForegroundColor Green

# sonar-project.properties handles all config — just pass the token
sonar-scanner "-Dsonar.token=$Token" "-Dsonar.host.url=$SonarUrl" "-Dsonar.projectKey=$ProjectKey"

if ($LASTEXITCODE -ne 0) { Write-Error "SonarQube scanner failed"; exit 1 }

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Analysis complete!" -ForegroundColor Green
Write-Host "  View results: $SonarUrl/dashboard?id=$ProjectKey" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
