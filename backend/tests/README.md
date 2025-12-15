# Backend Tests

This directory contains the complete test suite for the Full-Stack Todo Web Application backend.

## Test Files

- **`__init__.py`** - Makes this directory a Python package
- **`conftest.py`** - Pytest fixtures and configuration (test database setup)
- **`test_services.py`** - Unit tests for service layer (18 tests)
- **`test_api.py`** - Integration tests for API endpoints (17 tests)

## Quick Start

```bash
# Install dependencies (from backend directory)
pip install -r requirements.txt

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_services.py -v
```

## Test Database

Tests use **SQLite in-memory** database:
- Fast execution
- Clean state for each test
- No external dependencies
- Configuration in `conftest.py`

## Fixtures

### `test_engine`
Async SQLAlchemy engine with in-memory SQLite database.

### `test_session`
Async database session with automatic rollback after each test.

### `client`
FastAPI TestClient with test database dependency override.

## Test Coverage

**Total: 35 tests**

### Service Layer (18 tests)
- Task creation & validation
- Task retrieval with filters
- Task updates & deletion
- Task completion logic
- Recurrence calculations

### API Endpoints (17 tests)
- GET /api/tasks (list, filter, sort, search)
- GET /api/tasks/{id}
- POST /api/tasks
- PUT /api/tasks/{id}
- DELETE /api/tasks/{id}
- PATCH /api/tasks/{id}/complete
- PATCH /api/tasks/{id}/incomplete

## Documentation

See parent directory for:
- **`TEST_GUIDE.md`** - Complete testing guide
- **`TESTING_SUMMARY.md`** - Overview and summary
- **`../specs/02-fullstack-web-todo/test-plan.md`** - Manual test plan

## Running Tests

See `../TEST_GUIDE.md` for comprehensive instructions.
