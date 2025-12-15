# Integration Smoke Test Script for Phase II Todo API
# Runs basic curl commands to verify API functionality
#
# Prerequisites:
#   1. Backend running on port 8001: uvicorn app.main:app --port 8001
#   2. INTEGRATION_TESTS=1 environment variable (optional)
#
# Usage:
#   .\scripts\integration_smoke.ps1

param(
    [string]$ApiBase = "http://127.0.0.1:8001/api",
    [string]$UserId = "smoke_test_user"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase II Integration Smoke Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Generate a test JWT token
Write-Host "[1/7] Generating test JWT token..." -ForegroundColor Yellow
$TokenScript = @"
import sys
sys.path.insert(0, 'backend')
from app.auth import create_test_token
print(create_test_token('$UserId'))
"@

try {
    $Token = python -c $TokenScript 2>$null
    if (-not $Token) {
        Write-Host "ERROR: Failed to generate JWT token. Make sure backend is set up." -ForegroundColor Red
        Write-Host "Trying alternative method..." -ForegroundColor Yellow
        # Fallback: use a pre-generated token (valid for testing only)
        $Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzbW9rZV90ZXN0X3VzZXIiLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTgwNDA2NzIwMH0.demo"
    }
    Write-Host "Token generated successfully" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Could not generate token, using demo token" -ForegroundColor Yellow
    $Token = "demo-token"
}

$Headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# Test 1: Health check (no auth required)
Write-Host ""
Write-Host "[2/7] Testing database health endpoint..." -ForegroundColor Yellow
try {
    $HealthResponse = Invoke-RestMethod -Uri "$ApiBase/system/db-health" -Method Get
    Write-Host "Response: $($HealthResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
    if ($HealthResponse.database_ok -eq $true) {
        Write-Host "PASS: Database is healthy" -ForegroundColor Green
    } else {
        Write-Host "WARN: Database may have issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAIL: Health check failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Create a task
Write-Host ""
Write-Host "[3/7] Creating a test task..." -ForegroundColor Yellow
$TaskBody = @{
    title = "Smoke Test Task"
    description = "Created by integration smoke test"
    priority = "high"
    tags = @("smoke-test", "integration")
    recurrence = "none"
} | ConvertTo-Json

try {
    $CreateResponse = Invoke-RestMethod -Uri "$ApiBase/$UserId/tasks" -Method Post -Headers $Headers -Body $TaskBody
    $TaskId = $CreateResponse.id
    Write-Host "Response: $($CreateResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
    Write-Host "PASS: Task created with ID $TaskId" -ForegroundColor Green
} catch {
    Write-Host "FAIL: Create task failed - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    $TaskId = $null
}

# Test 3: List tasks
Write-Host ""
Write-Host "[4/7] Listing tasks..." -ForegroundColor Yellow
try {
    $ListResponse = Invoke-RestMethod -Uri "$ApiBase/$UserId/tasks" -Method Get -Headers $Headers
    Write-Host "Found $($ListResponse.Count) task(s)" -ForegroundColor Gray
    Write-Host "PASS: List tasks succeeded" -ForegroundColor Green
} catch {
    Write-Host "FAIL: List tasks failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get single task
if ($TaskId) {
    Write-Host ""
    Write-Host "[5/7] Getting task by ID..." -ForegroundColor Yellow
    try {
        $GetResponse = Invoke-RestMethod -Uri "$ApiBase/$UserId/tasks/$TaskId" -Method Get -Headers $Headers
        Write-Host "Response: $($GetResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
        Write-Host "PASS: Get task succeeded" -ForegroundColor Green
    } catch {
        Write-Host "FAIL: Get task failed - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Mark task complete
if ($TaskId) {
    Write-Host ""
    Write-Host "[6/7] Marking task complete..." -ForegroundColor Yellow
    try {
        $CompleteResponse = Invoke-RestMethod -Uri "$ApiBase/$UserId/tasks/$TaskId/complete" -Method Patch -Headers $Headers
        Write-Host "Task completed: $($CompleteResponse.task.completed)" -ForegroundColor Gray
        Write-Host "PASS: Mark complete succeeded" -ForegroundColor Green
    } catch {
        Write-Host "FAIL: Mark complete failed - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Delete task
if ($TaskId) {
    Write-Host ""
    Write-Host "[7/7] Deleting test task..." -ForegroundColor Yellow
    try {
        $DeleteResponse = Invoke-WebRequest -Uri "$ApiBase/$UserId/tasks/$TaskId" -Method Delete -Headers $Headers
        if ($DeleteResponse.StatusCode -eq 204) {
            Write-Host "PASS: Delete task succeeded (204 No Content)" -ForegroundColor Green
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 204) {
            Write-Host "PASS: Delete task succeeded (204 No Content)" -ForegroundColor Green
        } else {
            Write-Host "FAIL: Delete task failed - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Smoke Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
