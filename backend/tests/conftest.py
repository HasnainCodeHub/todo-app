import os

# Set environment variables for testing BEFORE any other imports
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("TESTING", "1")
os.environ.setdefault("BETTER_AUTH_SECRET", "test-secret-key-for-testing-only")

"""Pytest configuration and fixtures for testing.

Phase II: Includes JWT authentication fixtures.
Sets up test database, fixtures, and overrides for testing.
"""


import pytest
import pytest_asyncio
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from fastapi.testclient import TestClient
from contextlib import asynccontextmanager

# Import models to ensure they are registered
import app.models  # noqa: F401

from app.database import get_session


# Test database URL - SQLite in-memory for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Test user ID for auth tests
TEST_USER_ID = "test_user_123"
TEST_USER_ID_2 = "other_user_456"

@pytest.fixture(scope="session")
def test_database_url() -> str:
    """Return the in-memory SQLite database URL for tests."""
    return TEST_DATABASE_URL


@pytest.fixture(scope="session")
def anyio_backend():
    """Specify the async backend for pytest-asyncio."""
    return "asyncio"


@pytest.fixture(scope="session")
def test_user_id() -> str:
    """Return the test user ID."""
    return TEST_USER_ID


@pytest.fixture(scope="session")
def other_user_id() -> str:
    """Return a different test user ID for ownership tests."""
    return TEST_USER_ID_2


@pytest.fixture(scope="function")
def auth_headers(test_user_id: str) -> dict:
    """Generate authentication headers with a valid JWT for the test user."""
    from app.auth import create_test_token
    token = create_test_token(test_user_id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def other_auth_headers(other_user_id: str) -> dict:
    """Generate authentication headers for a different user (ownership tests)."""
    from app.auth import create_test_token
    token = create_test_token(other_user_id)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="function")
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create a test database engine.

    Uses SQLite in-memory database that is created fresh for each test.
    """
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    yield engine

    # Drop all tables after test
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_session(test_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session.

    Provides a clean database session for each test with automatic rollback.
    """
    async_session_maker = sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async with async_session_maker() as session:
        yield session
        await session.rollback()


@pytest.fixture(scope="function")
def client(test_engine: AsyncEngine, test_session: AsyncSession) -> TestClient:
    """Create a test client with test database dependency override.

    Overrides the get_session dependency to use the test database.
    Creates an app instance with a custom lifespan to avoid connecting to production DB.
    """
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from app.routes import tasks, system

    # Create a test-specific lifespan that doesn't connect to production DB
    @asynccontextmanager
    async def test_lifespan(app: FastAPI):
        yield

    # Create a test app instance
    test_app = FastAPI(
        title="Todo API Test",
        lifespan=test_lifespan
    )

    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    test_app.include_router(tasks.router)
    test_app.include_router(system.router)

    @test_app.get("/")
    async def root():
        return {"status": "ok", "app": "Todo API Test", "version": "2.0.0"}

    @test_app.get("/health")
    async def health():
        return {"status": "healthy", "database": {"status": "test"}}

    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        yield test_session

    test_app.dependency_overrides[get_session] = override_get_session

    with TestClient(test_app) as test_client:
        yield test_client

    test_app.dependency_overrides.clear()
