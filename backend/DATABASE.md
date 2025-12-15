# Database Layer Documentation

## Overview

This document describes the database implementation for the Todo API Backend (Phase II).

## Architecture

The database layer consists of three main components:

1. **Configuration** (`app/config.py`) - Environment-based settings management
2. **Database Connection** (`app/database.py`) - Async SQLAlchemy engine and session management
3. **Models** (`app/models.py`) - SQLModel data models

## Components

### 1. Configuration (`app/config.py`)

Manages application settings using `pydantic-settings`.

**Key Features:**
- Loads settings from environment variables and `.env` file
- Type validation and conversion
- Default values for optional settings

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string with asyncpg driver

**Optional Environment Variables:**
- `APP_NAME`: Application name (default: "Todo API")
- `DEBUG`: Enable debug mode (default: False)

**Usage:**
```python
from app.config import settings

print(settings.DATABASE_URL)
print(settings.APP_NAME)
```

### 2. Database Connection (`app/database.py`)

Provides async database connectivity using SQLAlchemy and asyncpg.

**Key Features:**
- Async SQLAlchemy engine with connection pooling
- Session factory for request-scoped sessions
- Automatic table creation on startup
- Graceful connection cleanup on shutdown

**Components:**

#### `engine: AsyncEngine`
Global async database engine with:
- Connection pool pre-ping (validates connections before use)
- SQL query logging (when DEBUG=True)
- Future-compatible SQLAlchemy 2.0 style

#### `async_session_maker`
Session factory configured for async operations with:
- No auto-commit (explicit transaction control)
- No auto-flush (explicit flush control)
- Expire on commit disabled (allows accessing objects after commit)

#### `get_session() -> AsyncSession`
FastAPI dependency that provides database sessions per request.

**Usage in Routes:**
```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session

@app.get("/tasks")
async def list_tasks(session: AsyncSession = Depends(get_session)):
    # Use session here
    pass
```

**Transaction Handling:**
- Auto-commits on successful request completion
- Auto-rolls back on exceptions
- Always closes the session

#### `create_tables() -> None`
Creates all database tables defined in SQLModel models.

**Usage:**
```python
from app.database import create_tables

# On application startup
await create_tables()
```

#### `close_db() -> None`
Closes all database connections in the pool.

**Usage:**
```python
from app.database import close_db

# On application shutdown
await close_db()
```

### 3. Task Model (`app/models.py`)

SQLModel class representing a todo task.

**Table Name:** `tasks`

**Schema:**

| Field | Type | SQL Type | Constraints | Default |
|-------|------|----------|-------------|---------|
| `id` | `int` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Auto |
| `title` | `str` | VARCHAR(255) | NOT NULL | - |
| `description` | `str \| None` | TEXT | NULLABLE | `None` |
| `completed` | `bool` | BOOLEAN | NOT NULL | `False` |
| `priority` | `str` | VARCHAR(20) | NOT NULL | `"medium"` |
| `tags` | `list[str]` | JSON | NOT NULL | `[]` |
| `due_date` | `datetime \| None` | TIMESTAMPTZ | NULLABLE | `None` |
| `recurrence` | `str` | VARCHAR(20) | NOT NULL | `"none"` |
| `created_at` | `datetime` | TIMESTAMPTZ | NOT NULL | Current UTC time |
| `updated_at` | `datetime` | TIMESTAMPTZ | NOT NULL | Current UTC time |

**Field Constraints:**

- **priority**: Must be one of: `"low"`, `"medium"`, `"high"`
- **recurrence**: Must be one of: `"none"`, `"daily"`, `"weekly"`, `"monthly"`
- **tags**: Stored as JSON array, defaults to empty list
- **timestamps**: Automatically set to current UTC time on creation

**Usage:**

```python
from app.models import Task
from datetime import datetime, timezone

# Create a new task
task = Task(
    title="Buy groceries",
    description="Milk, eggs, bread",
    priority="high",
    tags=["shopping", "home"],
    due_date=datetime.now(timezone.utc)
)

# Access fields
print(task.title)
print(task.completed)  # False by default
print(task.created_at)  # Auto-set to current time
```

## Database Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` and set your DATABASE_URL:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database
```

**Connection String Format:**
```
postgresql+asyncpg://[user[:password]@][host][:port][/database][?param=value]
```

**Common Parameters:**
- `sslmode=require` - Enforce SSL connections (recommended for production)
- `pool_size=10` - Maximum number of connections in the pool
- `max_overflow=20` - Maximum overflow connections

**Examples:**

Local development:
```
postgresql+asyncpg://postgres:password@localhost:5432/todo_db
```

Production with SSL:
```
postgresql+asyncpg://user:pass@db.example.com:5432/todo_db?sslmode=require
```

### 3. Verify Setup

Run the verification script:

```bash
cd backend
python test_db_setup.py
```

This will:
1. Verify configuration loads correctly
2. Check model fields are defined properly
3. Test database connection
4. Create tables if they don't exist

## Integration with FastAPI

### Application Lifecycle

Wire the database layer into your FastAPI application:

```python
from fastapi import FastAPI
from app.database import create_tables, close_db

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    await create_tables()
    print("Database tables created/verified")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on application shutdown."""
    await close_db()
    print("Database connections closed")
```

### Using Sessions in Routes

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.database import get_session
from app.models import Task

@app.get("/tasks")
async def list_tasks(session: AsyncSession = Depends(get_session)):
    """List all tasks."""
    result = await session.execute(select(Task))
    tasks = result.scalars().all()
    return tasks

@app.post("/tasks")
async def create_task(task: Task, session: AsyncSession = Depends(get_session)):
    """Create a new task."""
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
```

## Best Practices

### Transaction Management

1. **Let the dependency handle transactions**: The `get_session()` dependency automatically commits on success and rolls back on errors.

2. **Explicit transactions when needed**:
```python
async with session.begin():
    # Multiple operations in one transaction
    task1 = Task(title="Task 1")
    task2 = Task(title="Task 2")
    session.add_all([task1, task2])
    # Auto-commits at end of context if no errors
```

### Connection Pooling

The engine uses connection pooling by default:
- Connections are reused across requests
- Pool pre-ping verifies connections before use
- Stale connections are automatically discarded

### Error Handling

```python
from sqlalchemy.exc import IntegrityError

@app.post("/tasks")
async def create_task(task: Task, session: AsyncSession = Depends(get_session)):
    try:
        session.add(task)
        await session.commit()
        await session.refresh(task)
        return task
    except IntegrityError as e:
        # Handle constraint violations
        raise HTTPException(status_code=400, detail="Invalid task data")
```

### Timestamps

The model automatically sets `created_at` and `updated_at` on creation. To update `updated_at` on modifications:

```python
from datetime import datetime, timezone

task.updated_at = datetime.now(timezone.utc)
await session.commit()
```

## Testing

### Unit Tests

Test models in isolation:

```python
from app.models import Task

def test_task_defaults():
    task = Task(title="Test")
    assert task.completed is False
    assert task.priority == "medium"
    assert task.tags == []
    assert task.recurrence == "none"
```

### Integration Tests

Test with a real database (use a test database):

```python
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from app.models import Task

@pytest.fixture
async def session():
    engine = create_async_engine("postgresql+asyncpg://localhost/test_db")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session

    await engine.dispose()

@pytest.mark.asyncio
async def test_create_task(session: AsyncSession):
    task = Task(title="Test Task")
    session.add(task)
    await session.commit()

    assert task.id is not None
    assert task.title == "Test Task"
```

## Troubleshooting

### Connection Errors

**Error:** `asyncpg.exceptions.InvalidPasswordError`
- **Solution**: Verify DATABASE_URL credentials are correct

**Error:** `Cannot connect to database`
- **Solution**: Check database server is running and accessible
- Verify host, port, and database name in DATABASE_URL
- Check firewall rules

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'asyncpg'`
- **Solution**: Install dependencies: `pip install -r requirements.txt`

### Table Creation Errors

**Error:** `ProgrammingError: relation "tasks" does not exist`
- **Solution**: Ensure `create_tables()` is called on application startup

## Security Considerations

1. **Never commit `.env` file**: Add to `.gitignore`
2. **Use SSL in production**: Add `?sslmode=require` to DATABASE_URL
3. **Use environment variables**: Never hardcode credentials
4. **Limit database permissions**: Application user should have minimal required permissions
5. **Connection pooling**: Configure appropriate pool sizes to prevent connection exhaustion

## Performance Optimization

1. **Connection pooling**: Already configured in the engine
2. **Indexes**: Add database indexes for frequently queried fields (id, created_at, completed)
3. **Pagination**: Use LIMIT/OFFSET for large result sets
4. **Lazy loading**: Use `joinedload()` for relationships when needed

## Migration Strategy

For schema changes, consider using Alembic (not included in Phase II):

```bash
pip install alembic
alembic init migrations
alembic revision --autogenerate -m "Add new field"
alembic upgrade head
```

## References

- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [SQLAlchemy Async Documentation](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [asyncpg Documentation](https://magicstack.github.io/asyncpg/)
- [Pydantic Settings Documentation](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
