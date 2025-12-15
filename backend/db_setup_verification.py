"""Quick verification script for database setup.

Run this to verify:
1. Config loads correctly
2. Models are properly defined
3. Database connection can be established
"""

import asyncio
from datetime import datetime, timezone

from app.config import settings
from app.database import create_tables, close_db, engine
from app.models import Task


async def verify_setup():
    """Verify database setup and model definition."""
    print("=== Database Setup Verification ===\n")

    # 1. Check configuration
    print("1. Configuration:")
    print(f"   DATABASE_URL: {settings.DATABASE_URL[:30]}...")
    print(f"   APP_NAME: {settings.APP_NAME}")
    print(f"   DEBUG: {settings.DEBUG}\n")

    # 2. Check model definition
    print("2. Task Model Fields:")
    for field_name, field_info in Task.model_fields.items():
        print(f"   - {field_name}: {field_info.annotation}")
    print()

    # 3. Create a sample task instance (in-memory only)
    print("3. Sample Task Instance:")
    task = Task(
        title="Test Task",
        description="This is a test task",
        priority="high",
        tags=["test", "verification"],
        due_date=datetime.now(timezone.utc)
    )
    print(f"   {task}")
    print(f"   Created at: {task.created_at}")
    print(f"   Tags: {task.tags}")
    print()

    # 4. Test database connection (requires valid DATABASE_URL)
    print("4. Database Connection Test:")
    try:
        # This will attempt to connect - will fail if DATABASE_URL is invalid
        await create_tables()
        print("   ✓ Successfully connected to database")
        print("   ✓ Tables created/verified")
    except Exception as e:
        print(f"   ✗ Connection failed: {e}")
        print("   (This is expected if DATABASE_URL is not configured)")
    finally:
        await close_db()

    print("\n=== Verification Complete ===")


if __name__ == "__main__":
    asyncio.run(verify_setup())
