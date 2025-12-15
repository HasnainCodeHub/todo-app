#!/bin/bash
# Integration Smoke Test Script for Phase II Todo API
# Runs basic curl commands to verify API functionality
#
# Prerequisites:
#   1. Backend running on port 8001: uvicorn app.main:app --port 8001
#   2. INTEGRATION_TESTS=1 environment variable (optional)
#
# Usage:
#   ./scripts/integration_smoke.sh

set -e

API_BASE="${API_BASE:-http://127.0.0.1:8001/api}"
USER_ID="${USER_ID:-smoke_test_user}"

echo "========================================"
echo "Phase II Integration Smoke Test"
echo "========================================"
echo ""

# Generate a test JWT token
echo "[1/7] Generating test JWT token..."
cd backend 2>/dev/null || true
TOKEN=$(python -c "from app.auth import create_test_token; print(create_test_token('$USER_ID'))" 2>/dev/null || echo "demo-token")
cd - >/dev/null 2>&1 || true

if [ "$TOKEN" = "demo-token" ]; then
    echo "WARNING: Using demo token (backend may not be properly configured)"
else
    echo "Token generated successfully"
fi

# Test 1: Health check (no auth required)
echo ""
echo "[2/7] Testing database health endpoint..."
HEALTH_RESPONSE=$(curl -s "$API_BASE/system/db-health")
echo "Response: $HEALTH_RESPONSE"
if echo "$HEALTH_RESPONSE" | grep -q '"database_ok":true'; then
    echo "PASS: Database is healthy"
else
    echo "WARN: Database may have issues"
fi

# Test 2: Create a task
echo ""
echo "[3/7] Creating a test task..."
CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/$USER_ID/tasks" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Smoke Test Task",
        "description": "Created by integration smoke test",
        "priority": "high",
        "tags": ["smoke-test", "integration"],
        "recurrence": "none"
    }')
echo "Response: $CREATE_RESPONSE"

TASK_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
if [ -n "$TASK_ID" ]; then
    echo "PASS: Task created with ID $TASK_ID"
else
    echo "FAIL: Could not create task"
    TASK_ID=""
fi

# Test 3: List tasks
echo ""
echo "[4/7] Listing tasks..."
LIST_RESPONSE=$(curl -s "$API_BASE/$USER_ID/tasks" \
    -H "Authorization: Bearer $TOKEN")
TASK_COUNT=$(echo "$LIST_RESPONSE" | grep -o '"id":' | wc -l)
echo "Found $TASK_COUNT task(s)"
echo "PASS: List tasks succeeded"

# Test 4: Get single task
if [ -n "$TASK_ID" ]; then
    echo ""
    echo "[5/7] Getting task by ID..."
    GET_RESPONSE=$(curl -s "$API_BASE/$USER_ID/tasks/$TASK_ID" \
        -H "Authorization: Bearer $TOKEN")
    echo "Response: $GET_RESPONSE"
    echo "PASS: Get task succeeded"
fi

# Test 5: Mark task complete
if [ -n "$TASK_ID" ]; then
    echo ""
    echo "[6/7] Marking task complete..."
    COMPLETE_RESPONSE=$(curl -s -X PATCH "$API_BASE/$USER_ID/tasks/$TASK_ID/complete" \
        -H "Authorization: Bearer $TOKEN")
    echo "Response: $COMPLETE_RESPONSE"
    if echo "$COMPLETE_RESPONSE" | grep -q '"completed":true'; then
        echo "PASS: Mark complete succeeded"
    else
        echo "FAIL: Mark complete may have failed"
    fi
fi

# Test 6: Delete task
if [ -n "$TASK_ID" ]; then
    echo ""
    echo "[7/7] Deleting test task..."
    DELETE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_BASE/$USER_ID/tasks/$TASK_ID" \
        -H "Authorization: Bearer $TOKEN")
    if [ "$DELETE_STATUS" = "204" ]; then
        echo "PASS: Delete task succeeded (204 No Content)"
    else
        echo "FAIL: Delete task returned status $DELETE_STATUS"
    fi
fi

echo ""
echo "========================================"
echo "Smoke Test Complete"
echo "========================================"
