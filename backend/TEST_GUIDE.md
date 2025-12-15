# Test Execution Guide

## Overview
This guide provides instructions for running the complete test suite for the Full-Stack Todo Web Application backend.

## Test Structure

```
backend/
├── tests/
│   ├── __init__.py           # Test package marker
│   ├── conftest.py           # Pytest fixtures and configuration
│   ├── test_services.py      # Unit tests for service layer (18 tests)
│   └── test_api.py           # API integration tests (17 tests)
├── pytest.ini                # Pytest configuration
└── requirements.txt          # Dependencies including test packages
```

## Prerequisites

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

This installs:
- `pytest` - Testing framework
- `pytest-asyncio` - Async test support
- `httpx` - HTTP client for API testing
- `aiosqlite` - SQLite async driver for test database

### 2. Verify Installation
```bash
pytest --version
```

## Running Tests

### Run All Tests
```bash
cd backend
pytest
```

### Run Tests with Verbose Output
```bash
pytest -v
```

### Run Tests with Extra Verbose Output (shows each test)
```bash
pytest -vv
```

### Run Only Unit Tests (Service Layer)
```bash
pytest tests/test_services.py -v
```

### Run Only Integration Tests (API)
```bash
pytest tests/test_api.py -v
```

### Run Specific Test Function
```bash
pytest tests/test_services.py::test_create_task_valid -v
```

### Run Tests Matching Pattern
```bash
pytest -k "test_create" -v
```

### Run Tests with Coverage Report
```bash
pytest --cov=app --cov-report=html
```
Then open `htmlcov/index.html` in your browser.

### Run Tests with Coverage (Terminal Output)
```bash
pytest --cov=app --cov-report=term-missing
```

### Run Tests and Stop on First Failure
```bash
pytest -x
```

### Run Tests with Print Statements Visible
```bash
pytest -s
```

### Run Tests in Parallel (faster execution)
```bash
pip install pytest-xdist
pytest -n auto
```

## Test Database

### Configuration
- Tests use **SQLite in-memory** database (`sqlite+aiosqlite:///:memory:`)
- Fresh database created for each test
- No data persistence between tests
- No need for Neon/PostgreSQL connection during testing

### Why In-Memory?
- **Fast**: No disk I/O
- **Isolated**: Each test gets clean state
- **Simple**: No setup/teardown required
- **CI-Friendly**: No external dependencies

## Test Coverage

### Service Layer Tests (test_services.py)

**Task Creation:**
- `test_create_task_valid` - Valid task creation
- `test_create_task_empty_title` - Empty title validation

**Task Retrieval:**
- `test_get_tasks_all` - Get all tasks
- `test_get_tasks_filter_status` - Filter by completed/pending
- `test_get_tasks_filter_priority` - Filter by priority
- `test_get_tasks_filter_tag` - Filter by tag
- `test_get_tasks_search` - Search by keyword
- `test_get_tasks_sort` - Sort by field and order
- `test_get_task_by_id_found` - Get task by ID
- `test_get_task_by_id_not_found` - 404 error handling

**Task Updates:**
- `test_update_task` - Update task fields
- `test_delete_task` - Delete task

**Task Completion:**
- `test_mark_complete_non_recurring` - Complete non-recurring task
- `test_mark_complete_recurring` - Complete recurring task (creates next)
- `test_mark_incomplete` - Mark task incomplete

**Recurrence Logic:**
- `test_calculate_next_due_date_daily` - Daily recurrence calculation
- `test_calculate_next_due_date_weekly` - Weekly recurrence calculation
- `test_calculate_next_due_date_monthly` - Monthly recurrence calculation

### API Integration Tests (test_api.py)

**Basic CRUD:**
- `test_list_tasks_empty` - Empty task list
- `test_create_task` - Create task via API
- `test_create_task_invalid` - Validation error handling
- `test_get_task` - Get single task
- `test_get_task_not_found` - 404 handling
- `test_update_task` - Update task via API
- `test_delete_task` - Delete task via API

**Completion Endpoints:**
- `test_complete_task` - Mark task complete
- `test_complete_recurring_task` - Complete recurring task
- `test_incomplete_task` - Mark task incomplete

**Filtering & Sorting:**
- `test_filter_by_status` - Status query parameter
- `test_filter_by_priority` - Priority query parameter
- `test_filter_by_tag` - Tag query parameter
- `test_search_tasks` - Search query parameter
- `test_sort_tasks` - Sort parameters

**Health Checks:**
- `test_health_endpoint` - Health check endpoint
- `test_root_endpoint` - Root endpoint

## Expected Output

### Successful Test Run
```
================================ test session starts ================================
platform win32 -- Python 3.11.0, pytest-8.3.0, pluggy-1.5.0
rootdir: D:\HDA DATA\Hackathon Projects\todo-app\backend
configfile: pytest.ini
testpaths: tests
plugins: asyncio-0.24.0
collected 35 items

tests/test_services.py ..................                                    [ 51%]
tests/test_api.py .................                                          [100%]

================================ 35 passed in 2.34s =================================
```

### Test Failure Example
```
________________________________ test_create_task __________________________________

    def test_create_task(client):
>       response = client.post("/api/tasks", json={"title": "Test"})
E       AssertionError: assert 201 == 200

tests/test_api.py:25: AssertionError
```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'app'"
**Solution:**
```bash
# Make sure you're in the backend directory
cd backend
# Run tests from there
pytest
```

### Issue: "aiosqlite not found"
**Solution:**
```bash
pip install aiosqlite
```

### Issue: "No tests collected"
**Solution:**
```bash
# Verify test files exist
ls tests/

# Run with verbose discovery
pytest --collect-only
```

### Issue: "Database errors"
**Solution:**
- Tests use in-memory SQLite, no external database needed
- Check that `conftest.py` is present in tests directory
- Verify `TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"`

### Issue: "AsyncIO errors"
**Solution:**
```bash
# Ensure pytest-asyncio is installed
pip install pytest-asyncio

# Check pytest.ini has: asyncio_mode = auto
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Fixtures

### Available Fixtures (from conftest.py)

**test_engine**: Async SQLAlchemy engine with in-memory SQLite
- Scope: function (new for each test)
- Creates/drops tables automatically

**test_session**: Async database session
- Scope: function
- Auto-rollback after test
- Isolated from other tests

**client**: FastAPI TestClient
- Scope: function
- Uses test_session for database
- Overrides get_session dependency

### Using Fixtures
```python
@pytest.mark.asyncio
async def test_example(test_session):
    # Use test_session for database operations
    task = Task(title="Test")
    test_session.add(task)
    await test_session.commit()

def test_api_example(client):
    # Use client for HTTP requests
    response = client.get("/api/tasks")
    assert response.status_code == 200
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clean State**: Use fixtures for fresh database per test
3. **Async Properly**: Use `@pytest.mark.asyncio` for async tests
4. **Assert Clearly**: Use descriptive assertion messages
5. **Test Edge Cases**: Empty strings, None values, invalid input
6. **Mock External Services**: Don't call real APIs in tests
7. **Fast Tests**: In-memory DB keeps tests fast

## Manual Testing

For manual API testing during development, see:
- `specs/02-fullstack-web-todo/test-plan.md` - Comprehensive manual test checklist

Use tools like:
- **curl** - Command-line HTTP client
- **Postman** - GUI API testing tool
- **Thunder Client** - VS Code extension
- **httpie** - Modern CLI HTTP client

## Next Steps

After tests pass:
1. Review coverage report
2. Add tests for edge cases
3. Run tests before committing
4. Set up pre-commit hooks
5. Configure CI/CD pipeline

## Support

If you encounter issues:
1. Check test output carefully
2. Review test fixtures in `conftest.py`
3. Verify all dependencies installed
4. Check Python version (3.11+)
5. Review individual test files for details

---

**Total Tests:** 35
- Unit Tests: 18
- Integration Tests: 17

**Test Database:** SQLite in-memory
**Test Framework:** pytest + pytest-asyncio
**HTTP Client:** httpx TestClient
