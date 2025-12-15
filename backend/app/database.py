import logging
import os
from collections.abc import AsyncGenerator
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from sqlmodel import SQLModel

from app.config import settings

# Import models to register them
import app.models  # noqa: F401

# -------------------------------------------------
# Logging
# -------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------------------------------
# Migration SQL (unchanged)
# -------------------------------------------------
MIGRATION_SQL = {
    "add_user_id": """
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
        UPDATE tasks SET user_id = 'legacy_user' WHERE user_id IS NULL;
        ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;
    """,
    "add_user_id_index": """
        CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    """,
    "timestamp_migration": [
        "ALTER TABLE tasks ALTER COLUMN due_date TYPE timestamptz USING (due_date AT TIME ZONE 'UTC');",
        "ALTER TABLE tasks ALTER COLUMN created_at TYPE timestamptz USING (created_at AT TIME ZONE 'UTC');",
        "ALTER TABLE tasks ALTER COLUMN updated_at TYPE timestamptz USING (updated_at AT TIME ZONE 'UTC');",
    ],
}

# -------------------------------------------------
# Engine
# -------------------------------------------------
engine: AsyncEngine = create_async_engine(
    settings.async_database_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

# -------------------------------------------------
# Session factory
# -------------------------------------------------
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# -------------------------------------------------
# ✅ FASTAPI DEPENDENCY (FIX)
# -------------------------------------------------
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency.
    This is what routes MUST import.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# 🔁 Backward compatibility (optional)
get_session = get_db

# -------------------------------------------------
# Startup helpers
# -------------------------------------------------
async def create_tables() -> None:
    logger.warning("🚨 DEVELOPMENT MODE: Dropping and recreating all tables")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

# -------------------------------------------------
# Shutdown
# -------------------------------------------------
async def close_db() -> None:
    await engine.dispose()

# -------------------------------------------------
# Health checks
# -------------------------------------------------
async def check_db_connection() -> dict:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

async def verify_schema_permissions() -> dict:
    result = {
        "can_create_table": False,
        "can_create_index": False,
        "can_alter_table": False,
        "can_drop_table": False,
        "issues": [],
    }

    try:
        async with engine.begin() as conn:
            try:
                await conn.execute(text("CREATE TABLE _perm_test (id INT)"))
                result["can_create_table"] = True
            except Exception as e:
                result["issues"].append(str(e))

            if result["can_create_table"]:
                try:
                    await conn.execute(text("DROP TABLE _perm_test"))
                    result["can_drop_table"] = True
                except Exception as e:
                    result["issues"].append(str(e))
    except Exception as e:
        result["issues"].append(str(e))

    return result
