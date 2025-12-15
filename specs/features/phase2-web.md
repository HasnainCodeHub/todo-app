# Phase II Specification — Full-Stack Todo Web App

**Document Type:** Authoritative Specification (WHAT & WHY)
**Phase:** II — Web + Persistence + Auth
**Status:** Active
**Agents:** db-modeler, backend-builder, frontend-builder, test-writer, doc-writer

---

## 1. Purpose and Scope

### Purpose
Transform the Phase I CLI app into a multi-user, persistent, secure web application.

### Scope (Phase II Only)
| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Next.js 15 (App Router) | Better Auth integration |
| Backend | FastAPI, Python 3.13+ | SQLModel ORM |
| Database | Neon Serverless PostgreSQL | Local Postgres for dev |
| Authentication | Better Auth + JWT | HS256 signed tokens |

### Explicitly Out of Scope (Phase III–V)
- Docker/Kubernetes containerization
- Kafka/Dapr event bus
- AI/Chatbot integration
- Multi-tenant organization features

---

## 2. High-Level Requirements

### 2.1 Basic Level (MUST)
| ID | Requirement | API Endpoint |
|----|-------------|--------------|
| B1 | Create Task | `POST /api/{user_id}/tasks` |
| B2 | View Task List | `GET /api/{user_id}/tasks` |
| B3 | Update Task | `PUT /api/{user_id}/tasks/{id}` |
| B4 | Delete Task | `DELETE /api/{user_id}/tasks/{id}` |
| B5 | Mark Complete | `PATCH /api/{user_id}/tasks/{id}/complete` |
| B6 | Mark Incomplete | `PATCH /api/{user_id}/tasks/{id}/incomplete` |

### 2.2 Intermediate Level (MUST)
| ID | Requirement | Implementation |
|----|-------------|----------------|
| I1 | Priorities | Enum: `low`, `medium`, `high` |
| I2 | Tags | JSON array of strings |
| I3 | Search | Query param `?search=<keyword>` |
| I4 | Filter | Query params: `status`, `priority`, `tag`, `due_from`, `due_to` |
| I5 | Sort | Query params: `sort_by`, `sort_order` |

### 2.3 Advanced Level (MUST)
| ID | Requirement | Implementation |
|----|-------------|----------------|
| A1 | Due Dates | `TIMESTAMP WITH TIME ZONE` column |
| A2 | Recurring Tasks | Values: `none`, `daily`, `weekly`, `monthly` |

### 2.4 Security Requirements (MUST)
| ID | Requirement | Implementation |
|----|-------------|----------------|
| S1 | Multi-user | Each task has `user_id` foreign key |
| S2 | JWT Auth | All APIs require `Authorization: Bearer <token>` |
| S3 | Ownership | Users can only access their own tasks |
| S4 | Token Verification | Backend verifies HS256 JWT with `BETTER_AUTH_SECRET` |

---

## 3. API Specification (Authoritative)

### 3.1 Base Configuration
```
Base URL (dev): http://127.0.0.1:8001/api
Auth Header:    Authorization: Bearer <JWT>
Token Format:   HS256 signed with BETTER_AUTH_SECRET
```

### 3.2 Endpoint Definitions

#### `GET /api/{user_id}/tasks`
List all tasks for authenticated user.

**Query Parameters:**
| Param | Type | Values | Default |
|-------|------|--------|---------|
| `search` | string | keyword | - |
| `status` | string | `all`, `pending`, `completed` | `all` |
| `priority` | string | `low`, `medium`, `high` | - |
| `tag` | string | tag name | - |
| `due_from` | ISO8601 | datetime | - |
| `due_to` | ISO8601 | datetime | - |
| `sort_by` | string | `due_date`, `priority`, `title`, `created_at` | `created_at` |
| `sort_order` | string | `asc`, `desc` | `asc` |

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": "user_abc123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "priority": "high",
    "tags": ["shopping", "urgent"],
    "due_date": "2025-01-15T09:00:00Z",
    "recurrence": "weekly",
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  }
]
```

#### `POST /api/{user_id}/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high",
  "tags": ["shopping"],
  "due_date": "2025-01-15T09:00:00Z",
  "recurrence": "none"
}
```

**Required Fields:** `title`
**Optional Fields:** `description`, `priority` (default: `medium`), `tags` (default: `[]`), `due_date`, `recurrence` (default: `none`)

**Response:** `201 Created` — Returns created task JSON.

#### `GET /api/{user_id}/tasks/{id}`
Get a single task by ID.

**Response:** `200 OK` — Task JSON
**Errors:** `404` if not found, `403` if not owner

#### `PUT /api/{user_id}/tasks/{id}`
Update a task (full replacement of provided fields).

**Request Body:** Same as POST
**Response:** `200 OK` — Updated task JSON
**Behavior:** Updates `updated_at` timestamp automatically

#### `DELETE /api/{user_id}/tasks/{id}`
Delete a task.

**Response:** `204 No Content`
**Errors:** `404` if not found, `403` if not owner

#### `PATCH /api/{user_id}/tasks/{id}/complete`
Mark task as complete. Triggers recurrence logic if applicable.

**Response:** `200 OK`
```json
{
  "task": { /* completed task */ },
  "next_task": { /* new recurring task or null */ }
}
```

#### `PATCH /api/{user_id}/tasks/{id}/incomplete`
Mark task as incomplete.

**Response:** `200 OK` — Updated task JSON

#### `GET /api/system/db-health`
Public health check endpoint (no auth required).

**Response:** `200 OK`
```json
{
  "database_ok": true,
  "sample_time": "2025-01-15T10:30:00Z"
}
```

### 3.3 Error Response Format
All errors return JSON:
```json
{
  "detail": "Human-readable error message"
}
```

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not owner of resource) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 4. Domain Model (Authoritative)

### 4.1 Task Entity — SQLModel Definition

```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: int = Field(primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(max_length=1000, nullable=True)
    completed: bool = Field(default=False)
    priority: str = Field(default="medium")  # low|medium|high
    tags: list[str] = Field(sa_column=Column(JSON, default=[]))
    due_date: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    recurrence: str = Field(default="none")  # none|daily|weekly|monthly
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), default=func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    )
```

### 4.2 Field Constraints

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | int | Primary key, auto-increment |
| `user_id` | str | Not null, indexed |
| `title` | str | Not null, length 1-200 |
| `description` | str | Nullable, max 1000 |
| `completed` | bool | Default `false` |
| `priority` | str | Values: `low`, `medium`, `high`. Default `medium` |
| `tags` | JSON | Array of strings, default `[]` |
| `due_date` | timestamptz | Nullable, timezone-aware |
| `recurrence` | str | Values: `none`, `daily`, `weekly`, `monthly`. Default `none` |
| `created_at` | timestamptz | Auto-set on create |
| `updated_at` | timestamptz | Auto-set on create/update |

### 4.3 Database Indexes
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

---

## 5. Authentication & Security

### 5.1 Better Auth → JWT Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Better Auth │────▶│   FastAPI   │
│  (Next.js)  │     │   (Frontend) │     │  (Backend)  │
└─────────────┘     └──────────────┘     └─────────────┘
      │                    │                    │
      │  1. User login     │                    │
      │───────────────────▶│                    │
      │                    │                    │
      │  2. JWT issued     │                    │
      │◀───────────────────│                    │
      │                    │                    │
      │  3. API call with  │                    │
      │     Authorization: │                    │
      │     Bearer <JWT>   │───────────────────▶│
      │                    │                    │
      │                    │  4. Verify JWT     │
      │                    │     with secret    │
      │                    │                    │
      │                    │  5. Extract user_id│
      │                    │     from claims    │
      │                    │                    │
      │  6. Response       │◀───────────────────│
      │◀───────────────────│                    │
```

### 5.2 Environment Variables

**Backend (`backend/.env`):**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
BETTER_AUTH_SECRET=your-256-bit-secret-key-here
TESTING=0
```

**Frontend (`frontend/.env.local`):**
```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api
BETTER_AUTH_SECRET=your-256-bit-secret-key-here
```

### 5.3 JWT Token Structure

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Claims):**
```json
{
  "sub": "user_abc123",
  "iat": 1704067200,
  "exp": 1704153600
}
```

**Claim Mapping:**
- Primary: `sub` → `user_id`
- Fallback: `user_id` claim if `sub` not present
- Precedence: `sub` > `user_id`

### 5.4 Backend Auth Dependency

```python
async def get_current_user_id(
    authorization: str = Header(...),
    user_id: str = Path(...)
) -> str:
    """
    1. Extract token from "Bearer <token>"
    2. Verify HS256 signature with BETTER_AUTH_SECRET
    3. Decode and extract 'sub' claim
    4. Compare with path user_id
    5. Return user_id or raise 401/403
    """
```

### 5.5 Security Rules

| Rule | Implementation |
|------|----------------|
| Missing token | Return 401 Unauthorized |
| Invalid signature | Return 401 Unauthorized |
| Expired token | Return 401 Unauthorized |
| user_id mismatch | Return 403 Forbidden |
| Valid token + match | Proceed with request |

---

## 6. Recurrence Behavior (Authoritative)

### 6.1 Recurrence Values
| Value | Meaning |
|-------|---------|
| `none` | Non-recurring task |
| `daily` | Repeats every day |
| `weekly` | Repeats every 7 days |
| `monthly` | Repeats every month |

### 6.2 Completion Logic

When `PATCH /api/{user_id}/tasks/{id}/complete` is called on a recurring task:

```
1. Mark original task:
   - completed = true
   - updated_at = now()

2. Calculate next due_date:
   IF original.due_date exists:
     - daily:   next_due = due_date + 1 day
     - weekly:  next_due = due_date + 7 days
     - monthly: next_due = due_date + 1 month (clamp day if needed)
   ELSE:
     - next_due = null (no due_date)

3. Create new task:
   - user_id = original.user_id
   - title = original.title
   - description = original.description
   - priority = original.priority
   - tags = original.tags (copy)
   - recurrence = original.recurrence
   - due_date = next_due
   - completed = false
   - created_at = now()
   - updated_at = now()

4. Return both tasks in response
```

### 6.3 Edge Cases

| Scenario | Behavior |
|----------|----------|
| Non-recurring task completed | No new task created |
| Recurring task without due_date | New task created without due_date |
| Monthly on Jan 31 | Feb 28/29 (clamp to last day of month) |
| Race condition (double-complete) | Use database transaction; first wins |

---

## 7. Database Compatibility

### 7.1 Neon Production
```bash
DATABASE_URL=postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 7.2 Local Development
```bash
DATABASE_URL=postgresql://todo_user:password@localhost:5432/todo_app
```

### 7.3 SQLModel Engine Configuration
```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    settings.async_database_url,  # postgresql+asyncpg://...
    echo=settings.DEBUG,
    pool_pre_ping=True
)
```

### 7.4 Timestamp Handling
- All datetime columns use `TIMESTAMP WITH TIME ZONE`
- Application normalizes to UTC before storage
- SQLAlchemy: `Column(DateTime(timezone=True))`

---

## 8. File Structure (Implementation Reference)

### 8.1 Backend Files
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, lifespan
│   ├── config.py            # Settings (DATABASE_URL, BETTER_AUTH_SECRET)
│   ├── database.py          # Engine, get_session(), create_tables()
│   ├── models.py            # Task SQLModel
│   ├── schemas.py           # Pydantic DTOs
│   ├── auth.py              # JWT verification, get_current_user_id()
│   ├── services/
│   │   └── task_service.py  # Business logic, recurrence
│   ├── routes/
│   │   ├── tasks.py         # /api/{user_id}/tasks endpoints
│   │   └── system.py        # /api/system/db-health
│   └── utils/
│       └── datetime_utils.py
├── tests/
│   ├── conftest.py          # Fixtures, test DB setup
│   ├── test_services.py     # Service unit tests
│   ├── test_api.py          # API integration tests
│   └── test_auth.py         # JWT verification tests
├── .env.example
├── requirements.txt
└── README.md
```

### 8.2 Frontend Files
```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx             # Task list view
│   └── tasks/
│       ├── new/page.tsx     # Create task
│       └── [id]/edit/page.tsx
├── components/
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   ├── TaskForm.tsx
│   ├── FilterBar.tsx
│   └── SortControls.tsx
├── lib/
│   ├── api.ts               # API client with auth header
│   ├── auth.ts              # Better Auth integration
│   └── types.ts
├── .env.local.example
└── README.md
```

### 8.3 Spec Files
```
specs/
├── features/
│   └── phase2-web.md        # This file
├── api/
│   └── rest-endpoints.md
└── database/
    └── schema.md
```

---

## 9. Acceptance Criteria

### 9.1 Backend Criteria
| ID | Criterion | Verification |
|----|-----------|--------------|
| AC1 | Server starts | `uvicorn app.main:app --reload` succeeds |
| AC2 | DB health | `GET /api/system/db-health` returns `{"database_ok": true}` |
| AC3 | Create task | `POST /api/{user_id}/tasks` with valid JWT creates task |
| AC4 | Timestamps | `created_at` and `updated_at` are timezone-aware |
| AC5 | Ownership | JWT for user A cannot access user B's tasks (403) |
| AC6 | Recurrence | Completing recurring task creates new instance |
| AC7 | Tests pass | `pytest backend/ -q` exits 0 |

### 9.2 Frontend Criteria
| ID | Criterion | Verification |
|----|-----------|--------------|
| FC1 | Task list loads | UI displays tasks from API |
| FC2 | Create task | Form submits successfully |
| FC3 | Auth header | All API calls include `Authorization: Bearer` |
| FC4 | Error handling | Network errors show user-friendly message |

### 9.3 Integration Criteria
| ID | Criterion | Verification |
|----|-----------|--------------|
| IC1 | End-to-end | Create task in UI → appears in DB → shows in list |
| IC2 | Auth flow | Login → get JWT → make authenticated API calls |
| IC3 | Multi-user | Two users see only their own tasks |

---

## 10. Developer Workflow

### 10.1 Implementation Order
```
1. /sp.plan        → Generate technical plan
2. /sp.tasks       → Break down into agent-executable tasks
3. /sp.implement   → Execute tasks with agents:
   a. db-modeler     → Database schema, migrations
   b. backend-builder → API routes, services, auth
   c. frontend-builder → UI components, auth integration
   d. test-writer    → Unit and integration tests
   e. doc-writer     → README, CLAUDE.md updates
4. Manual verification → Run acceptance criteria checks
```

### 10.2 Verification Commands
```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8001
curl http://127.0.0.1:8001/api/system/db-health
pytest -q

# Frontend
cd frontend
npm run dev
# Open http://localhost:3000

# Full integration
# 1. Start backend on :8001
# 2. Start frontend on :3000
# 3. Login via Better Auth
# 4. Create/view/edit tasks
```

---

## 11. Glossary

| Term | Definition |
|------|------------|
| Better Auth | Authentication library for Next.js |
| JWT | JSON Web Token for stateless authentication |
| HS256 | HMAC-SHA256 signing algorithm |
| Neon | Serverless PostgreSQL platform |
| SQLModel | Python ORM combining SQLAlchemy + Pydantic |
| timestamptz | PostgreSQL timestamp with timezone |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-15 | Claude (spec-writer) | Initial Phase II spec with auth |

---

**End of Phase II Specification**
