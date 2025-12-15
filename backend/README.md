# Todo App Backend

FastAPI REST API backend for the Phase II Full-Stack Todo Application.

## Features

- **RESTful API**: Complete CRUD operations for tasks
- **Advanced Filtering**: Filter by status, priority, tags, and due date range
- **Flexible Sorting**: Sort by due date, priority, title, or creation date
- **Search**: Case-insensitive keyword search in title and description
- **Recurring Tasks**: Automatic next occurrence generation on completion
- **Async Operations**: Non-blocking database operations with asyncpg

## Tech Stack

- **Framework**: FastAPI (Python 3.13+)
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: PostgreSQL (Local or Neon Cloud)
- **Async Driver**: asyncpg
- **Date Handling**: python-dateutil

## Prerequisites

- Python 3.13+
- PostgreSQL (Local installation or Neon cloud account)

## Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # Linux/macOS
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database credentials:

   **Local PostgreSQL:**
   ```bash
   # Note: Special characters must be URL-encoded (@ = %40, # = %23, etc.)
   DATABASE_URL=postgresql://todo_user:your_password@localhost:5432/todo_app
   ```

   **Neon Cloud:**
   ```bash
   DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.neon.tech/neondb?sslmode=require
   ```

4. **Verify database connection**:
   ```bash
   python verify_db.py
   ```

   Expected output:
   ```
   1. DATABASE_URL: postgresql://todo_user:****@...
   2. Testing connection...
      ✅ Connection successful!
   3. Creating tables...
      ✅ Tables created/verified!
   ```

5. **Run development server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access API docs**:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app, CORS, lifespan events
│   ├── config.py         # Environment configuration
│   ├── database.py       # Async engine, sessions, table creation
│   ├── models.py         # SQLModel Task model
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── exceptions.py     # Custom exception classes
│   ├── services/
│   │   └── task_service.py  # Business logic, CRUD, recurrence
│   └── routes/
│       └── tasks.py      # API endpoint handlers
├── tests/
│   ├── conftest.py       # Test fixtures and configuration
│   ├── test_services.py  # Unit tests for service layer
│   └── test_api.py       # API integration tests
├── requirements.txt
├── pytest.ini
└── .env.example
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (with filters/sort) |
| GET | `/api/tasks/{id}` | Get single task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/complete` | Mark complete |
| PATCH | `/api/tasks/{id}/incomplete` | Mark incomplete |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/health` | Health check |

### Query Parameters (GET /api/tasks)

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `"completed"` or `"pending"` |
| `priority` | string | `"low"`, `"medium"`, `"high"` |
| `tag` | string | Filter by tag |
| `search` | string | Keyword search |
| `due_from` | datetime | Due date >= value |
| `due_to` | datetime | Due date <= value |
| `sort_by` | string | `due_date`, `priority`, `title`, `created_at` |
| `sort_order` | string | `"asc"` or `"desc"` |

### Request/Response Examples

**Create Task:**
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "priority": "high",
    "tags": ["shopping"],
    "due_date": "2024-12-15T18:00:00Z",
    "recurrence": "weekly"
  }'
```

**Response:**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "priority": "high",
  "tags": ["shopping"],
  "due_date": "2024-12-15T18:00:00Z",
  "recurrence": "weekly",
  "created_at": "2024-12-10T10:00:00Z",
  "updated_at": "2024-12-10T10:00:00Z"
}
```

**Mark Complete (Recurring Task):**
```bash
curl -X PATCH http://localhost:8000/api/tasks/1/complete
```

**Response:**
```json
{
  "task": {
    "id": 1,
    "completed": true,
    ...
  },
  "next_task": {
    "id": 2,
    "completed": false,
    "due_date": "2024-12-22T18:00:00Z",
    ...
  }
}
```

## Datetime Handling and Migration

To prevent timezone-related errors, this application normalizes all datetime values to be **timezone-aware and in UTC**.

- **Storage**: All datetime columns (`due_date`, `created_at`, `updated_at`) are stored in the database using the `TIMESTAMP WITH TIME ZONE` (`timestamptz`) type.
- **Normalization**: The service layer ensures any incoming naive datetime is treated as UTC. Any datetime with a different timezone is converted to UTC before being stored.

### Automatic Migration

On application startup, the backend will automatically attempt to migrate the `tasks` table if it was created with timezone-naive columns. It does this by running the following SQL commands:

```sql
ALTER TABLE tasks ALTER COLUMN due_date TYPE timestamp with time zone USING (due_date AT TIME ZONE 'UTC');
ALTER TABLE tasks ALTER COLUMN created_at TYPE timestamp with time zone USING (created_at AT TIME ZONE 'UTC');
ALTER TABLE tasks ALTER COLUMN updated_at TYPE timestamp with time zone USING (updated_at AT TIME ZONE 'UTC');
```

If this migration fails, and the application is in a `TESTING` environment, the tables will be dropped and recreated. In a production environment, an error will be logged, but data will not be deleted.

## Running Tests

```bash
# Run all tests
pytest backend/

# Run with verbose output
pytest backend/ -v

# Run specific test file
pytest backend/tests/test_api.py
pytest backend/tests/test_utils.py

# Run with coverage
pytest backend/ --cov=app --cov-report=term-missing
```

Tests use SQLite in-memory database for isolation and speed.

### Timezone Verification

A special verification script can be run to programmatically check the datetime fix. It will use the in-memory test database.

```bash
python -m backend.verify_timezone_fix
```
Note: This script will report a failure when using SQLite because the standard Python `sqlite3` driver does not support timezone-aware datetimes. However, the application logic is correct for PostgreSQL.

## Error Handling

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `EMPTY_TITLE` | Title is empty or whitespace |
| 400 | `VALIDATION_ERROR` | Invalid field value |
| 404 | `TASK_NOT_FOUND` | Task ID not found |

**Error Response Format:**
```json
{
  "detail": {
    "detail": "Task with ID 99 not found",
    "code": "TASK_NOT_FOUND"
  }
}
```

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (local or Neon) | - |
| `APP_NAME` | No | Application name | `"Todo API"` |
| `DEBUG` | No | Enable debug logging | `False` |

## Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL on your system
2. Create database and user:
   ```sql
   -- Run in psql as superuser
   CREATE USER todo_user WITH PASSWORD 'your_password';
   CREATE DATABASE todo_app OWNER todo_user;
   GRANT ALL PRIVILEGES ON DATABASE todo_app TO todo_user;
   ```
3. Set DATABASE_URL in `.env`:
   ```bash
   DATABASE_URL=postgresql://todo_user:your_password@localhost:5432/todo_app
   ```

### Option B: Neon Cloud

1. Create account at https://neon.tech
2. Create a new project
3. Copy connection string from dashboard
4. The app auto-converts `postgresql://` to async format

**URL Encoding Note:**
Special characters in passwords must be URL-encoded:
- `@` → `%40`
- `#` → `%23`
- `:` → `%3A`
- `/` → `%2F`

Example: Password `p@ss#word` becomes `p%40ss%23word`

## Task Model Schema

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| `id` | int | Primary key, auto-increment | - |
| `title` | str | Required, max 255 chars | - |
| `description` | str | Optional | `null` |
| `completed` | bool | Required | `false` |
| `priority` | str | `low\|medium\|high` | `"medium"` |
| `tags` | JSON | Array of strings | `[]` |
| `due_date` | datetime | Optional | `null` |
| `recurrence` | str | `none\|daily\|weekly\|monthly` | `"none"` |
| `created_at` | datetime | Auto-set | UTC now |
| `updated_at` | datetime | Auto-updated | UTC now |

## Troubleshooting

**Connection refused to Neon:**
- Verify DATABASE_URL in .env
- Check SSL mode is `require`
- Ensure IP is not blocked by Neon

**Import errors:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

**Table not found:**
- Tables auto-create on startup
- Check database connection is successful

## Phase II Scope

This backend implements all Phase II features:
- Full CRUD operations
- Priority and tags management
- Search, filter, and sort
- Recurring task logic
- Due date tracking

**NOT included (Phase III+):**
- User authentication
- AI/chatbot integration
- Docker containerization
- Event bus integration
