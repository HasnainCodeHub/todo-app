# Phase II Technical Plan
## Full-Stack Todo Web App (Next.js + FastAPI + SQLModel + Neon)
### Agent-Orchestrated Implementation

---

## 1. Goals & Constraints

### 1.1 Transformation Goal

Transform the Phase I in-memory Python CLI Todo application into a **persistent, full-stack web application** with:

- **Web UI** (Next.js) - Modern, responsive browser interface
- **REST API** (FastAPI) - Backend service layer
- **Persistent Storage** (Neon Postgres via SQLModel) - Data survives restarts

### 1.2 Feature Goals

Implement all Phase II features from the specification:

| Category | Features |
|----------|----------|
| Core CRUD | Add, View, Update, Delete, Mark Complete/Incomplete |
| Priorities | Low, Medium, High with filtering |
| Tags | Multiple tags per task, filter by tag |
| Search | Keyword search in title and description |
| Filter | By status, priority, tag, due date range |
| Sort | By due date, priority, title, created time |
| Due Dates | Optional datetime with visual indicators |
| Recurring | Daily, weekly, monthly auto-generation |

### 1.3 Explicit Constraints

| Constraint | Rationale |
|------------|-----------|
| No AI/Chatbot in runtime | Reserved for Phase III |
| No Docker/Kubernetes/Helm | Reserved for Phase IV-V |
| No Kafka/Dapr/Event Bus | Reserved for Phase IV-V |
| No Authentication | Single-user system in Phase II |
| No CI/CD Automation | Manual deployment only |
| Single Repository | Frontend + backend in one repo |

### 1.4 Agent Execution Model

This plan guides **Claude Code subagents** that implement (not design):

| Agent | Responsibility |
|-------|----------------|
| `backend-builder` | FastAPI routes, services, models |
| `frontend-builder` | Next.js pages, components, hooks |
| `db-modeler` | SQLModel schemas, database setup |
| `test-writer` | Manual test plans, verification |
| `doc-writer` | README, setup documentation |

**Agents execute tasks derived from this plan. They do not make architectural decisions.**

---

## 2. Overall Architecture

### 2.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                    (Single User Context)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/JSON
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                              │
│                  (App Router, TypeScript)                        │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Task List  │  │  Task Form  │  │  Filters &  │              │
│  │    Page     │  │   (Create/  │  │    Sort     │              │
│  │     (/)     │  │    Edit)    │  │  Controls   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │              lib/api.ts (API Client)            │            │
│  └─────────────────────────────────────────────────┘            │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API Calls
                            │ /api/tasks/*
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                               │
│                  (Python 3.13+, Async)                           │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Routes    │  │  Services   │  │   Models    │              │
│  │  (tasks.py) │──│ (task_svc)  │──│  (SQLModel) │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │           database.py (Session Management)      │            │
│  └─────────────────────────────────────────────────┘            │
└───────────────────────────┬─────────────────────────────────────┘
                            │ SQLModel ORM
                            │ (asyncpg)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 NEON SERVERLESS POSTGRES                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │                   tasks table                    │            │
│  │  id | title | description | completed | ...     │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Frontend Architecture (Next.js)

| Aspect | Decision |
|--------|----------|
| Router | App Router (recommended) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | React hooks (useState, useEffect) |
| Data Fetching | Custom hooks with fetch API |
| Forms | Controlled components |

**Frontend Responsibilities:**
- Render UI and handle user input
- Call backend API for all data operations
- Display loading, error, and empty states
- Compute visual indicators (overdue, due-soon) from data
- NO business logic for recurrence (backend handles this)

### 2.3 Backend Architecture (FastAPI)

| Aspect | Decision |
|--------|----------|
| Framework | FastAPI |
| Language | Python 3.13+ |
| ORM | SQLModel |
| Async | Yes, async routes and DB operations |
| Validation | Pydantic schemas |

**Backend Responsibilities:**
- Expose REST API endpoints
- Validate all inputs
- Execute business logic (recurrence, filtering, sorting)
- Interact with database
- Return consistent JSON responses

### 2.4 Development Model

```
┌──────────────────────────────────────────────────────────────┐
│                    SPEC-KIT-PLUS                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌───────────┐ │
│  │  Spec   │───▶│  Plan   │───▶│  Tasks  │───▶│ Implement │ │
│  │(sp.spec)│    │(sp.plan)│    │(sp.tasks│    │(sp.impl)  │ │
│  └─────────┘    └─────────┘    └─────────┘    └───────────┘ │
│       │              │              │               │        │
│       ▼              ▼              ▼               ▼        │
│    WHAT/WHY        HOW          DISCRETE      AGENT EXEC    │
│                                  UNITS                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Database Design (SQLModel + Neon)

### 3.1 Task Table Schema (Authoritative)

| Column | SQLModel Type | SQL Type | Constraints | Default |
|--------|---------------|----------|-------------|---------|
| `id` | `int` | `INTEGER` | PRIMARY KEY, AUTO INCREMENT | Auto |
| `title` | `str` | `VARCHAR(255)` | NOT NULL | - |
| `description` | `str | None` | `TEXT` | NULLABLE | `None` |
| `completed` | `bool` | `BOOLEAN` | NOT NULL | `False` |
| `priority` | `str` | `VARCHAR(20)` | NOT NULL | `"medium"` |
| `tags` | `list[str]` | `JSON` | NOT NULL | `[]` |
| `due_date` | `datetime | None` | `TIMESTAMPTZ` | NULLABLE | `None` |
| `recurrence` | `str` | `VARCHAR(20)` | NOT NULL | `"none"` |
| `created_at` | `datetime` | `TIMESTAMPTZ` | NOT NULL | `now()` |
| `updated_at` | `datetime` | `TIMESTAMPTZ` | NOT NULL | `now()` |

### 3.2 Tags Storage Strategy

**Decision: JSON Array**

Store tags as a JSON array of strings in a single column:

```
tags: ["work", "urgent", "project-alpha"]
```

**Rationale:**
- Simple schema (no join tables)
- Postgres JSON operators support querying
- Sufficient for Phase II single-user context
- Easy to implement with SQLModel

**Querying by Tag:**
Use Postgres `@>` operator or JSON functions to check if array contains a value.

### 3.3 Recurrence Values

**Valid Values (Enum-like):**

| Value | Meaning |
|-------|---------|
| `"none"` | No recurrence (default) |
| `"daily"` | Repeats every 1 day |
| `"weekly"` | Repeats every 7 days |
| `"monthly"` | Repeats every 1 month |

**Validation:** Backend must reject any other values.

### 3.4 Priority Values

**Valid Values (Enum-like):**

| Value | Sort Order |
|-------|------------|
| `"high"` | 1 (highest) |
| `"medium"` | 2 |
| `"low"` | 3 (lowest) |

**Default:** `"medium"`

### 3.5 Timestamp Handling

| Field | Behavior |
|-------|----------|
| `created_at` | Set to current UTC time on INSERT, never changes |
| `updated_at` | Set to current UTC time on INSERT, updated on every UPDATE |

**Implementation:** Use SQLModel `default_factory` or database defaults.

### 3.6 Database Connection

**Environment Variable:** `DATABASE_URL`

**Format:**
```
postgresql+asyncpg://user:password@host:port/database?sslmode=require
```

**Connection Strategy:**
- Use async SQLAlchemy engine with `asyncpg` driver
- Create session per request (dependency injection)
- Auto-create tables on startup (no migrations for Phase II)

---

## 4. Backend Module Structure

### 4.1 Directory Layout

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Environment configuration
│   ├── database.py          # Engine, session, table creation
│   ├── models.py            # SQLModel Task model
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_service.py  # Business logic
│   └── routes/
│       ├── __init__.py
│       └── tasks.py         # API endpoint handlers
├── requirements.txt
├── .env.example
└── README.md
```

### 4.2 Module Responsibilities

| Module | Responsibility | Agent |
|--------|----------------|-------|
| `main.py` | App init, CORS, router registration, startup events | `backend-builder` |
| `config.py` | Load `DATABASE_URL` from env, settings class | `backend-builder` |
| `database.py` | Async engine, session factory, `get_session` dependency | `db-modeler` |
| `models.py` | `Task` SQLModel class with all fields | `db-modeler` |
| `schemas.py` | `TaskCreate`, `TaskUpdate`, `TaskResponse` Pydantic models | `backend-builder` |
| `task_service.py` | CRUD operations, recurrence logic, filtering, sorting | `backend-builder` |
| `tasks.py` | Route handlers, parameter parsing, response formatting | `backend-builder` |

### 4.3 Service Layer Design

The `task_service.py` module contains all business logic:

| Function | Purpose |
|----------|---------|
| `create_task(data, session)` | Create new task with defaults |
| `get_tasks(filters, sort, session)` | List tasks with filtering/sorting |
| `get_task_by_id(id, session)` | Get single task or None |
| `update_task(id, data, session)` | Update task fields |
| `delete_task(id, session)` | Delete task |
| `mark_complete(id, session)` | Set completed=True, handle recurrence |
| `mark_incomplete(id, session)` | Set completed=False |
| `_generate_next_occurrence(task)` | Create recurring task instance |
| `_calculate_next_due_date(due_date, recurrence)` | Date arithmetic |

### 4.4 Error Handling Strategy

**Custom Exception Classes:**

| Exception | HTTP Status | Code |
|-----------|-------------|------|
| `TaskNotFoundError` | 404 | `TASK_NOT_FOUND` |
| `ValidationError` | 400 | `VALIDATION_ERROR` |
| `EmptyTitleError` | 400 | `EMPTY_TITLE` |

**Response Format:**
```json
{
  "detail": "Task with ID 123 not found",
  "code": "TASK_NOT_FOUND"
}
```

**Implementation:** FastAPI exception handlers in `main.py`.

---

## 5. API Endpoint Design

### 5.1 Endpoint Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/tasks` | List tasks (with filters/sort) |
| GET | `/api/tasks/{id}` | Get single task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/complete` | Mark complete |
| PATCH | `/api/tasks/{id}/incomplete` | Mark incomplete |
| DELETE | `/api/tasks/{id}` | Delete task |

### 5.2 GET /api/tasks - List Tasks

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | `"completed"` or `"pending"` | `?status=pending` |
| `priority` | string | `"low"`, `"medium"`, `"high"` | `?priority=high` |
| `tag` | string | Filter by tag | `?tag=work` |
| `search` | string | Keyword in title/description | `?search=meeting` |
| `due_from` | datetime | Due date >= value | `?due_from=2024-01-01` |
| `due_to` | datetime | Due date <= value | `?due_to=2024-12-31` |
| `sort_by` | string | Sort field | `?sort_by=due_date` |
| `sort_order` | string | `"asc"` or `"desc"` | `?sort_order=desc` |

**Filtering Logic:**
- All filters combine with AND
- `status=pending` means `completed=False`
- `status=completed` means `completed=True`
- `tag` checks if tags array contains the value
- `search` is case-insensitive ILIKE on title OR description

**Sorting Logic:**
- `sort_by` values: `due_date`, `priority`, `title`, `created_at`
- `sort_order` default: `asc`
- Priority sort: high(1) < medium(2) < low(3) for ascending

**Response:** `200 OK` with JSON array of tasks.

### 5.3 GET /api/tasks/{id} - Get Single Task

**Response:**
- `200 OK` with task JSON
- `404 Not Found` with error JSON

### 5.4 POST /api/tasks - Create Task

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string | null",
  "priority": "low | medium | high",
  "tags": ["string"],
  "due_date": "ISO datetime | null",
  "recurrence": "none | daily | weekly | monthly"
}
```

**Defaults Applied:**
- `priority`: `"medium"`
- `tags`: `[]`
- `recurrence`: `"none"`
- `completed`: `false`

**Response:**
- `201 Created` with created task JSON
- `400 Bad Request` for validation errors

### 5.5 PUT /api/tasks/{id} - Update Task

**Request Body:** Same fields as POST (all optional).

**Behavior:**
- Only update fields that are provided
- Does NOT modify `completed` (use PATCH endpoints)
- Updates `updated_at` timestamp

**Response:**
- `200 OK` with updated task JSON
- `404 Not Found` if task doesn't exist
- `400 Bad Request` for validation errors

### 5.6 PATCH /api/tasks/{id}/complete - Mark Complete

**Behavior:**
1. Set `completed = true`
2. Update `updated_at`
3. If `recurrence != "none"`, create next occurrence:
   - Copy title, description, priority, tags, recurrence
   - Set `completed = false`
   - Calculate new `due_date` (if original had one)
   - New `created_at` and `updated_at`

**Response:**
```json
{
  "task": { ... completed task ... },
  "next_task": { ... new recurring task or null ... }
}
```

- `200 OK` with response JSON
- `404 Not Found` if task doesn't exist

### 5.7 PATCH /api/tasks/{id}/incomplete - Mark Incomplete

**Behavior:**
1. Set `completed = false`
2. Update `updated_at`

**Response:**
- `200 OK` with updated task JSON
- `404 Not Found` if task doesn't exist

### 5.8 DELETE /api/tasks/{id} - Delete Task

**Response:**
- `204 No Content` on success
- `404 Not Found` if task doesn't exist

---

## 6. Frontend Module Structure

### 6.1 Directory Layout

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Task list (home)
│   ├── globals.css             # Tailwind imports
│   └── tasks/
│       ├── new/
│       │   └── page.tsx        # Create task form
│       └── [id]/
│           └── edit/
│               └── page.tsx    # Edit task form
├── components/
│   ├── TaskList.tsx            # Task list container
│   ├── TaskItem.tsx            # Single task row
│   ├── TaskForm.tsx            # Create/edit form
│   ├── SearchBar.tsx           # Search input
│   ├── FilterControls.tsx      # Filter dropdowns
│   ├── SortControls.tsx        # Sort dropdown
│   ├── DueDateIndicator.tsx    # Visual due date status
│   ├── PriorityBadge.tsx       # Priority display
│   └── TagList.tsx             # Tags display
├── hooks/
│   ├── useTasks.ts             # Fetch and manage tasks
│   └── useTaskMutations.ts     # Create/update/delete
├── lib/
│   ├── api.ts                  # API client functions
│   └── types.ts                # TypeScript interfaces
├── tailwind.config.js
├── next.config.js
├── package.json
├── .env.local.example
└── README.md
```

### 6.2 Page Responsibilities

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Main task list with search/filter/sort |
| `/tasks/new` | `app/tasks/new/page.tsx` | Create new task form |
| `/tasks/[id]/edit` | `app/tasks/[id]/edit/page.tsx` | Edit existing task |

### 6.3 Component Responsibilities

| Component | Purpose | Agent |
|-----------|---------|-------|
| `TaskList` | Container, maps tasks to TaskItems | `frontend-builder` |
| `TaskItem` | Single task display, completion toggle, actions | `frontend-builder` |
| `TaskForm` | Reusable form for create/edit | `frontend-builder` |
| `SearchBar` | Text input, debounced search | `frontend-builder` |
| `FilterControls` | Status, priority, tag, date range dropdowns | `frontend-builder` |
| `SortControls` | Sort field and order selection | `frontend-builder` |
| `DueDateIndicator` | Shows overdue/due-soon/normal status | `frontend-builder` |
| `PriorityBadge` | Colored badge for priority | `frontend-builder` |
| `TagList` | Display list of tags | `frontend-builder` |

### 6.4 Hook Responsibilities

| Hook | Purpose |
|------|---------|
| `useTasks(filters, sort)` | Fetch tasks, handle loading/error, refetch |
| `useTaskMutations()` | Create, update, delete, complete, incomplete |

### 6.5 API Client Design

`lib/api.ts` provides typed functions:

| Function | Endpoint |
|----------|----------|
| `fetchTasks(params)` | GET /api/tasks |
| `fetchTask(id)` | GET /api/tasks/{id} |
| `createTask(data)` | POST /api/tasks |
| `updateTask(id, data)` | PUT /api/tasks/{id} |
| `completeTask(id)` | PATCH /api/tasks/{id}/complete |
| `incompleteTask(id)` | PATCH /api/tasks/{id}/incomplete |
| `deleteTask(id)` | DELETE /api/tasks/{id} |

**Configuration:**
- Base URL from `NEXT_PUBLIC_API_URL` environment variable
- Default: `http://localhost:8000`

### 6.6 TypeScript Types

`lib/types.ts`:

```typescript
interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  tags: string[];
  due_date: string | null;  // ISO string
  recurrence: "none" | "daily" | "weekly" | "monthly";
  created_at: string;
  updated_at: string;
}

interface TaskCreate {
  title: string;
  description?: string | null;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  due_date?: string | null;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
}

interface TaskUpdate {
  title?: string;
  description?: string | null;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  due_date?: string | null;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
}

interface TaskFilters {
  status?: "completed" | "pending";
  priority?: "low" | "medium" | "high";
  tag?: string;
  search?: string;
  due_from?: string;
  due_to?: string;
}

interface TaskSort {
  sort_by?: "due_date" | "priority" | "title" | "created_at";
  sort_order?: "asc" | "desc";
}
```

---

## 7. Frontend UX Logic

### 7.1 Task List Page Flow

```
┌─────────────────────────────────────────────────────────┐
│  [Search Bar]                          [+ Add Task]     │
├─────────────────────────────────────────────────────────┤
│  Filters: [Status ▼] [Priority ▼] [Tag ▼] [Date Range]  │
│  Sort: [Sort By ▼] [Asc/Desc]                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  □ Task Title 1        [HIGH]  [work] [urgent]          │
│    Due: Jan 15, 2024   ⚠️ OVERDUE                       │
│    [Edit] [Delete]                                      │
│  ─────────────────────────────────────────────────────  │
│  ☑ Task Title 2        [MED]   [home]                   │
│    Completed                                            │
│    [Edit] [Delete]                                      │
│  ─────────────────────────────────────────────────────  │
│  □ Task Title 3        [LOW]   [study]                  │
│    Due: Tomorrow       ⏰ DUE SOON                       │
│    [Edit] [Delete]                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Visual Indicators

| Condition | Indicator | Style |
|-----------|-----------|-------|
| `completed = true` | Strikethrough title, dimmed | `line-through opacity-50` |
| `due_date < now` AND `completed = false` | "OVERDUE" badge | Red background |
| `due_date` within 24 hours AND `completed = false` | "DUE SOON" badge | Yellow/orange background |
| No due date | No indicator | - |
| Completed task | No due status indicator | - |

### 7.3 Search Behavior

- Debounce input (300ms) before API call
- Clear button to reset search
- Search applies to title AND description
- Case-insensitive

### 7.4 Filter Behavior

- All filters default to "All" (no filter)
- Changing filter triggers immediate refetch
- Multiple filters combine with AND logic
- Due date range uses date pickers

### 7.5 Sort Behavior

- Default sort: `created_at` descending (newest first)
- Changing sort field triggers refetch
- Toggle button for asc/desc

### 7.6 Completion Toggle

1. User clicks checkbox/toggle
2. UI shows loading indicator on that task
3. Call `PATCH /complete` or `/incomplete`
4. On success, refetch task list
5. For recurring tasks, new instance appears in list

### 7.7 Delete Confirmation

1. User clicks delete button
2. Show confirmation dialog: "Delete this task?"
3. On confirm, call `DELETE /api/tasks/{id}`
4. On success, remove from list

---

## 8. Recurring Tasks Logic

### 8.1 Trigger Condition

Recurrence is triggered ONLY when:
- Task has `recurrence` != `"none"`
- Task is marked complete via `PATCH /api/tasks/{id}/complete`

### 8.2 Next Occurrence Generation

**Algorithm:**

```
function generate_next_occurrence(original_task):
    new_task = copy(original_task)
    new_task.id = null  # Will be auto-generated
    new_task.completed = false
    new_task.created_at = now()
    new_task.updated_at = now()

    if original_task.due_date is not null:
        new_task.due_date = calculate_next_due_date(
            original_task.due_date,
            original_task.recurrence
        )
    else:
        new_task.due_date = null

    return new_task
```

### 8.3 Due Date Calculation

| Recurrence | Calculation |
|------------|-------------|
| `daily` | `due_date + 1 day` |
| `weekly` | `due_date + 7 days` |
| `monthly` | `due_date + 1 month` (same day, handle month-end) |

**Month-End Handling:**
- If original due_date is Jan 31 and recurrence is monthly
- Next due_date is Feb 28/29 (last day of Feb)
- Use `dateutil.relativedelta` for accurate calculation

### 8.4 Implementation Location

All recurrence logic in `backend/app/services/task_service.py`:
- `mark_complete()` calls `_generate_next_occurrence()`
- `_generate_next_occurrence()` calls `_calculate_next_due_date()`

**Frontend does NOT implement recurrence logic.**

---

## 9. Environment & Configuration

### 9.1 Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | Neon Postgres connection | `postgresql+asyncpg://...` |

**File:** `backend/.env` (not committed)

**Template:** `backend/.env.example`
```
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database?sslmode=require
```

### 9.2 Frontend Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | No | Backend API base URL | `http://localhost:8000` |

**File:** `frontend/.env.local` (not committed)

**Template:** `frontend/.env.local.example`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 9.3 Local Development Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Neon credentials
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local if needed
npm run dev
```

### 9.4 Neon Database Setup

1. Create account at https://neon.tech
2. Create new project
3. Copy connection string from dashboard
4. Set `DATABASE_URL` in backend `.env`
5. Tables auto-created on first backend startup

---

## 10. Non-Functional Requirements

### 10.1 Code Quality

| Requirement | Backend | Frontend |
|-------------|---------|----------|
| Type Hints | Yes, all functions | TypeScript strict mode |
| Formatting | Black, isort | Prettier |
| Linting | Ruff or flake8 | ESLint |
| Naming | snake_case | camelCase (JS), PascalCase (components) |

### 10.2 Async Behavior

- All FastAPI route handlers use `async def`
- Database operations use async SQLAlchemy
- No blocking I/O in request handlers

### 10.3 Error Handling

| Layer | Handling |
|-------|----------|
| Backend Routes | Try/catch, return appropriate status codes |
| Backend Services | Raise custom exceptions |
| Frontend API | Catch errors, return error objects |
| Frontend UI | Display user-friendly messages |

### 10.4 Performance

- No pagination required for Phase II (typical Todo list size)
- Async DB connections
- Frontend debounces search input

### 10.5 Responsiveness

- Mobile-first design with Tailwind CSS
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly controls

---

## 11. Agent Task Assignments

### 11.1 Agent: db-modeler

| Task | Deliverable |
|------|-------------|
| Create SQLModel Task model | `backend/app/models.py` |
| Create database engine setup | `backend/app/database.py` |
| Create config loader | `backend/app/config.py` |

### 11.2 Agent: backend-builder

| Task | Deliverable |
|------|-------------|
| Create FastAPI app | `backend/app/main.py` |
| Create Pydantic schemas | `backend/app/schemas.py` |
| Implement task service | `backend/app/services/task_service.py` |
| Implement API routes | `backend/app/routes/tasks.py` |
| Create requirements.txt | `backend/requirements.txt` |

### 11.3 Agent: frontend-builder

| Task | Deliverable |
|------|-------------|
| Initialize Next.js app | `frontend/` directory |
| Create TypeScript types | `frontend/lib/types.ts` |
| Create API client | `frontend/lib/api.ts` |
| Create custom hooks | `frontend/hooks/*.ts` |
| Create all components | `frontend/components/*.tsx` |
| Create all pages | `frontend/app/**/*.tsx` |

### 11.4 Agent: test-writer

| Task | Deliverable |
|------|-------------|
| Create manual test plan | `specs/02-fullstack-web-todo/test-plan.md` |
| Define verification steps | Checklist format |

### 11.5 Agent: doc-writer

| Task | Deliverable |
|------|-------------|
| Update main README | `README.md` |
| Create backend README | `backend/README.md` |
| Create frontend README | `frontend/README.md` |

---

## 12. Acceptance Criteria

### 12.1 Core CRUD

- [ ] Create task via web UI
- [ ] View all tasks in list
- [ ] Update task details
- [ ] Delete task with confirmation
- [ ] Mark task complete/incomplete

### 12.2 Extended Features

- [ ] Assign priority (low/medium/high)
- [ ] Assign multiple tags
- [ ] Search by keyword
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Filter by tag
- [ ] Filter by due date range
- [ ] Sort by due date
- [ ] Sort by priority
- [ ] Sort by title
- [ ] Sort by created time
- [ ] Toggle sort order (asc/desc)

### 12.3 Due Dates

- [ ] Set due date/time on task
- [ ] Display due date in task list
- [ ] Overdue tasks highlighted (red)
- [ ] Due-soon tasks highlighted (yellow)

### 12.4 Recurring Tasks

- [ ] Set recurrence (daily/weekly/monthly)
- [ ] Completing recurring task creates next instance
- [ ] Next instance has correct due date

### 12.5 Persistence

- [ ] Data stored in Neon Postgres
- [ ] Data survives browser refresh
- [ ] Data survives server restart

### 12.6 Technical

- [ ] Frontend and backend communicate via REST
- [ ] All API endpoints work correctly
- [ ] Error states handled gracefully
- [ ] Loading states displayed

### 12.7 Exclusions

- [ ] No AI/chatbot features
- [ ] No Docker/Kubernetes
- [ ] No authentication

---

## 13. Summary

This technical plan provides complete guidance for implementing Phase II:

| Component | Technology | Agent |
|-----------|------------|-------|
| Frontend | Next.js, TypeScript, Tailwind | `frontend-builder` |
| Backend | FastAPI, Python 3.13+, SQLModel | `backend-builder` |
| Database | Neon Postgres, async | `db-modeler` |
| Testing | Manual test plan | `test-writer` |
| Documentation | README files | `doc-writer` |

**Implementation proceeds via:**
1. `/sp.tasks` - Derives discrete tasks from this plan
2. `/sp.implement` - Orchestrates agents to execute tasks

**Agents are executors. This plan is the authority.**

---

**End of Phase II Technical Plan**
