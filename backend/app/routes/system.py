"""System API routes.

Provides system health and diagnostic endpoints.
Phase II: Public endpoints (no auth required).
"""

from datetime import datetime, timezone

from fastapi import APIRouter

from app.database import check_db_connection, verify_schema_permissions


router = APIRouter(prefix="/api/system", tags=["system"])


@router.get("/db-health")
async def db_health():
    """Test database connectivity (no auth required).

    Returns:
        JSON with database_ok status and sample_time

    Response Examples:
        Success:
        {
            "database_ok": true,
            "sample_time": "2025-01-15T10:30:00Z"
        }

        Failure:
        {
            "database_ok": false,
            "sample_time": "2025-01-15T10:30:00Z",
            "error": "connection refused"
        }
    """
    db_status = await check_db_connection()

    response = {
        "database_ok": db_status["status"] == "healthy",
        "sample_time": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    }

    if db_status.get("error"):
        response["error"] = db_status["error"]

    return response


@router.get("/db-health/detailed")
async def db_health_detailed():
    """Detailed database health check with schema info (no auth required).

    Returns:
        Full database connectivity status including schema info
    """
    return await check_db_connection()


@router.get("/permissions")
async def check_permissions():
    """Check database permissions (no auth required).

    Returns:
        JSON with permission status for various operations
    """
    return await verify_schema_permissions()
