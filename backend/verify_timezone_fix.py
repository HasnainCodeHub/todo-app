"""
Verification script for timezone-aware datetime fix.

This script programmatically inserts a task with a timezone-aware datetime
and verifies that it is stored and retrieved correctly from the database.

To run:
1. Ensure your .env file is configured correctly for a real DB, or run with TESTING=1.
2. Run `python -m backend.verify_timezone_fix` from the project root.
"""

import asyncio
import os
from datetime import datetime, timezone
import sys

# --- Environment and Path Setup ---
# Set TESTING=1 to use in-memory SQLite for this verification script
os.environ["TESTING"] = "1"

# Add the 'backend' directory to the Python path to resolve `from app...` imports
# This mimics the runtime environment of uvicorn/pytest.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_dir = os.path.join(project_root, 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
# --- End Setup ---


from app.config import settings
from app.database import create_tables, async_session_maker
from app.models import Task


async def main():
    print("--- Starting Timezone Fix Verification ---")

    # Ensure the database and tables are set up correctly
    print("Running table creation/migration...")
    # Since we are in testing mode, this will use the in-memory SQLite DB
    await create_tables()
    print("Table setup complete.")

    async with async_session_maker() as session:
        # 1. Create a task with a timezone-aware due_date
        aware_due_date = datetime(2025, 12, 26, 23, 4, 0, tzinfo=timezone.utc)
        test_task = Task(
            title="Timezone Verification Task",
            description="A task to test timestamptz.",
            due_date=aware_due_date,
            priority="high",
            tags=["test", "timezone"]
        )

        print(f"\n[INSERT] Creating task with due_date: {test_task.due_date} (tzinfo: {test_task.due_date.tzinfo})")
        
        session.add(test_task)
        await session.commit()
        await session.refresh(test_task)

        task_id = test_task.id
        print(f"Task created with ID: {task_id}")

        # 2. Select the task back from the database
        print("\n[SELECT] Retrieving task from database...")
        retrieved_task = await session.get(Task, task_id)

        if not retrieved_task:
            print("--- VERIFICATION FAILED: Could not retrieve task. ---")
            return

        print(f"Retrieved due_date: {retrieved_task.due_date} (tzinfo: {retrieved_task.due_date.tzinfo})")

        # 3. Verify the retrieved datetime
        if retrieved_task.due_date and retrieved_task.due_date.tzinfo:
            print("\n--- VERIFICATION SUCCESS: Retrieved datetime is timezone-aware. ---")
        else:
            print("\n--- VERIFICATION FAILED: Retrieved datetime is NOT timezone-aware. ---")
        
        # Cleanup
        await session.delete(retrieved_task)
        await session.commit()
        print("\nCleaned up test task.")

if __name__ == "__main__":
    asyncio.run(main())