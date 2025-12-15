"""Database connection verification script.

Run from backend directory: python verify_db.py

This script verifies:
1. DATABASE_URL is set correctly
2. Connection to PostgreSQL works
3. Tables can be created
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text


async def verify_connection():
    """Verify database connection and table creation."""
    from app.config import settings
    from app.database import engine, create_tables

    print("=" * 50)
    print("Database Connection Verification")
    print("=" * 50)

    # Show config (mask password)
    url = settings.DATABASE_URL
    masked_url = url.split("@")[0].rsplit(":", 1)[0] + ":****@" + url.split("@")[1] if "@" in url else url
    print(f"\n1. DATABASE_URL: {masked_url}")
    print(f"   Async URL: {settings.async_database_url.split('@')[0].rsplit(':', 1)[0]}:****@...")

    # Test connection
    print("\n2. Testing connection...")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            print(f"   SELECT 1 result: {row[0]}")
            print("   ✅ Connection successful!")
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False

    # Create tables
    print("\n3. Creating tables...")
    try:
        await create_tables()
        print("   ✅ Tables created/verified!")
    except Exception as e:
        print(f"   ❌ Table creation failed: {e}")
        return False

    # Verify tasks table exists
    print("\n4. Verifying 'tasks' table...")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'tasks'"
            ))
            count = result.fetchone()[0]
            if count > 0:
                print("   ✅ 'tasks' table exists!")
            else:
                print("   ❌ 'tasks' table not found!")
                return False
    except Exception as e:
        print(f"   ❌ Table verification failed: {e}")
        return False

    print("\n" + "=" * 50)
    print("✅ All verifications passed!")
    print("=" * 50)
    return True


if __name__ == "__main__":
    success = asyncio.run(verify_connection())
    sys.exit(0 if success else 1)
