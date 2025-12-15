# Phase II Task Breakdown
## Full-Stack Todo Web App (Next.js + FastAPI + SQLModel + Neon)
### Agent-Ready Implementation Tasks

---

## 0. Task Format Rules

Every task in this document follows this format:

| Field | Description |
|-------|-------------|
| **Task ID** | Unique identifier: `P2-T01`, `P2-T02`, etc. |
| **Title** | Short, descriptive name |
| **Description** | What the task accomplishes |
| **Category** | One of: `planning`, `config`, `database`, `backend`, `frontend`, `integration`, `testing`, `docs` |
| **Suggested Agent** | One of: `db-modeler`, `backend-builder`, `frontend-builder`, `test-writer`, `doc-writer`, `manual-architect` |
| **Dependencies** | List of Task IDs that must be completed first |
| **Acceptance Criteria** | 2-5 bullet points defining "done" |

**No implementation code is included in this document.**

**Agents execute these tasks. They do not make architectural decisions.**

---

## 1. Repository & Environment Setup Tasks

---

### P2-T01: Create Backend Directory Structure

**Title:** Initialize backend folder structure

**Description:** Create the `backend/` directory with the complete module structure as defined in the technical plan. Set up all necessary subdirectories and placeholder files.

**Category:** config

**Suggested Agent:** manual-architect

**Dependencies:** None

**Acceptance Criteria:**
- `backend/app/` directory exists with `__init__.py`
- `backend/app/services/` directory exists with `__init__.py`
- `backend/app/routes/` directory exists with `__init__.py`
- Empty files created: `main.py`, `config.py`, `database.py`, `models.py`, `schemas.py`
- `backend/requirements.txt` exists (can be empty initially)

---

### P2-T02: Create Frontend Directory Structure

**Title:** Initialize Next.js frontend application

**Description:** Create the `frontend/` directory by initializing a new Next.js application with App Router, TypeScript, and Tailwind CSS. Set up the folder structure for components, hooks, and lib.

**Category:** config

**Suggested Agent:** frontend-builder

**Dependencies:** None

**Acceptance Criteria:**
- `frontend/` contains a valid Next.js 14+ project with App Router
- TypeScript is configured (`tsconfig.json` present)
- Tailwind CSS is installed and configured
- `frontend/components/`, `frontend/hooks/`, `frontend/lib/` directories exist
- `npm run dev` starts the development server without errors

---

### P2-T03: Create Backend Environment Configuration

**Title:** Set up backend `.env.example` file

**Description:** Create the `.env.example` template file for the backend with the `DATABASE_URL` placeholder and documentation comments explaining the expected format.

**Category:** config

**Suggested Agent:** doc-writer

**Dependencies:** P2-T01

**Acceptance Criteria:**
- `backend/.env.example` exists with `DATABASE_URL` placeholder
- Comments explain Neon connection string format
- Comments mention SSL requirement (`sslmode=require`)
- `.env` is listed in `.gitignore`

---

### P2-T04: Create Frontend Environment Configuration

**Title:** Set up frontend `.env.local.example` file

**Description:** Create the `.env.local.example` template file for the frontend with the `NEXT_PUBLIC_API_URL` variable.

**Category:** config

**Suggested Agent:** doc-writer

**Dependencies:** P2-T02

**Acceptance Criteria:**
- `frontend/.env.local.example` exists
- Contains `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Comments explain this connects to the backend API
- `.env.local` is in `.gitignore`

---

### P2-T05: Install Backend Dependencies

**Title:** Define Python dependencies in requirements.txt

**Description:** Populate `backend/requirements.txt` with all required Python packages for Phase II: FastAPI, SQLModel, uvicorn, asyncpg, python-dotenv, pydantic-settings, python-dateutil.

**Category:** config

**Suggested Agent:** backend-builder

**Dependencies:** P2-T01

**Acceptance Criteria:**
- `backend/requirements.txt` lists all required packages
- Versions are pinned or have minimum constraints
- `pip install -r requirements.txt` succeeds
- No packages for Phase III-V features (no AI, no Docker, no Kafka)

---

### P2-T06: Document Environment Requirements

**Title:** Document Python and Node version requirements

**Description:** Add environment requirements to a section in the README or a separate REQUIREMENTS.md file. Specify Python 3.13+, Node.js 18+, and npm versions.

**Category:** docs

**Suggested Agent:** doc-writer

**Dependencies:** P2-T03, P2-T04

**Acceptance Criteria:**
- Python version requirement (3.13+) documented
- Node.js version requirement (18+ LTS) documented
- Commands to verify versions provided
- Neon account requirement mentioned

---

## 2. Database & SQLModel Tasks (db-modeler)

---

### P2-T07: Implement Configuration Loader

**Title:** Create `config.py` for environment settings

**Description:** Implement the configuration module that loads `DATABASE_URL` from environment variables. Use pydantic-settings or a simple approach with `os.getenv`. Raise clear error if `DATABASE_URL` is not set.

**Category:** database

**Suggested Agent:** db-modeler

**Dependencies:** P2-T03, P2-T05

**Acceptance Criteria:**
- `backend/app/config.py` exists and loads `DATABASE_URL`
- Missing `DATABASE_URL` raises a descriptive error
- Configuration is importable from other modules
- Supports loading from `.env` file via python-dotenv

---

### P2-T08: Create Database Connection Module

**Title:** Implement `database.py` with async engine and sessions

**Description:** Create the database module that initializes an async SQLAlchemy engine using `asyncpg`, provides session management via `get_session` async generator, and includes a `create_tables` function for auto-creating tables on startup.

**Category:** database

**Suggested Agent:** db-modeler

**Dependencies:** P2-T07

**Acceptance Criteria:**
- `backend/app/database.py` creates async engine with `DATABASE_URL`
- `get_session` is an async generator yielding `AsyncSession`
- `create_tables` function creates all SQLModel tables
- Engine is configured for Neon (SSL mode, connection pooling)

---

### P2-T09: Define Task SQLModel Model

**Title:** Create `Task` model in `models.py`

**Description:** Define the `Task` SQLModel class with all required fields: id, title, description, completed, priority, tags, due_date, recurrence, created_at, updated_at. Follow the schema exactly as defined in the technical plan.

**Category:** database

**Suggested Agent:** db-modeler

**Dependencies:** P2-T08

**Acceptance Criteria:**
- `backend/app/models.py` contains `Task` class inheriting from SQLModel
- All 10 fields defined with correct types and defaults
- `tags` uses JSON type for array storage
- `priority` defaults to `"medium"`, `recurrence` defaults to `"none"`
- `created_at` and `updated_at` have automatic timestamp behavior

---

### P2-T10: Define Pydantic Request/Response Schemas

**Title:** Create schemas in `schemas.py`

**Description:** Define Pydantic schemas for API request bodies and responses: `TaskCreate`, `TaskUpdate`, `TaskResponse`, `TaskCompleteResponse`. Include validation for required fields and enum values.

**Category:** database

**Suggested Agent:** backend-builder

**Dependencies:** P2-T09

**Acceptance Criteria:**
- `TaskCreate` requires `title` (non-empty string)
- `TaskCreate` has optional fields with correct defaults
- `TaskUpdate` allows partial updates (all fields optional)
- `TaskResponse` matches full Task model structure
- `TaskCompleteResponse` includes both `task` and `next_task` fields
- Priority validates to `low|medium|high`
- Recurrence validates to `none|daily|weekly|monthly`

---

### P2-T11: Implement Table Auto-Creation on Startup

**Title:** Wire database table creation to app startup

**Description:** Configure the FastAPI application to call `create_tables()` during the startup event, ensuring the `tasks` table exists when the server starts.

**Category:** database

**Suggested Agent:** db-modeler

**Dependencies:** P2-T08, P2-T09

**Acceptance Criteria:**
- FastAPI startup event calls `create_tables()`
- Tables are created if they don't exist (idempotent)
- Startup logs indicate successful database connection
- No errors if tables already exist

---

## 3. Backend Service Layer Tasks (backend-builder)

---

### P2-T12: Implement Create Task Service

**Title:** Create `create_task` function in task_service.py

**Description:** Implement the service function that creates a new task in the database. Accept `TaskCreate` schema, apply default values, set timestamps, and return the created task.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T09, P2-T10

**Acceptance Criteria:**
- Function accepts `TaskCreate` data and async session
- Applies defaults: `completed=False`, `priority="medium"` if not provided
- Sets `created_at` and `updated_at` to current UTC time
- Persists task to database and returns created `Task` with ID
- Validates title is non-empty (raises error if empty)

---

### P2-T13: Implement List Tasks Service with Filtering

**Title:** Create `get_tasks` function with filter/search/sort

**Description:** Implement the service function that retrieves tasks with optional filtering, searching, and sorting. Support all query parameters defined in the API specification.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T09

**Acceptance Criteria:**
- Function accepts filter params: `status`, `priority`, `tag`, `search`, `due_from`, `due_to`
- Function accepts sort params: `sort_by`, `sort_order`
- `status=pending` filters `completed=False`, `status=completed` filters `completed=True`
- `tag` filter checks if tags JSON array contains the value
- `search` performs case-insensitive match on title OR description
- Sorting works for `due_date`, `priority`, `title`, `created_at`
- Returns list of `Task` objects

---

### P2-T14: Implement Get Task by ID Service

**Title:** Create `get_task_by_id` function

**Description:** Implement the service function that retrieves a single task by its ID. Return the task if found, or `None` if not found.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T09

**Acceptance Criteria:**
- Function accepts task `id` (int) and async session
- Returns `Task` object if found
- Returns `None` if task does not exist
- Uses efficient primary key lookup

---

### P2-T15: Implement Update Task Service

**Title:** Create `update_task` function

**Description:** Implement the service function that updates an existing task's fields. Only update fields that are provided (partial update). Update `updated_at` timestamp. Do NOT modify `completed` field.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T09, P2-T10, P2-T14

**Acceptance Criteria:**
- Function accepts task ID, `TaskUpdate` schema, and session
- Only updates fields that are explicitly provided (not None)
- Updates `updated_at` to current UTC time
- Does NOT allow modification of `completed` field
- Returns updated `Task` or raises `TaskNotFoundError`
- Validates title is non-empty if provided

---

### P2-T16: Implement Delete Task Service

**Title:** Create `delete_task` function

**Description:** Implement the service function that deletes a task by ID.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T14

**Acceptance Criteria:**
- Function accepts task `id` and async session
- Deletes task from database if exists
- Returns `True` on successful deletion
- Raises `TaskNotFoundError` if task not found

---

### P2-T17: Implement Mark Complete Service with Recurrence

**Title:** Create `mark_complete` function with recurring task generation

**Description:** Implement the service function that marks a task as complete. If the task has a recurrence rule other than `"none"`, automatically generate the next occurrence.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T09, P2-T12, P2-T14, P2-T19

**Acceptance Criteria:**
- Function sets `completed = True` on the task
- Updates `updated_at` timestamp
- If `recurrence != "none"`, creates new task with:
  - Same title, description, priority, tags, recurrence
  - `completed = False`
  - New due_date calculated via `_calculate_next_due_date`
  - New `created_at` and `updated_at`
- Returns both completed task and new task (or None if not recurring)

---

### P2-T18: Implement Mark Incomplete Service

**Title:** Create `mark_incomplete` function

**Description:** Implement the service function that marks a task as incomplete. No recurrence logic triggered.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T14

**Acceptance Criteria:**
- Function sets `completed = False` on the task
- Updates `updated_at` timestamp
- Returns updated task
- Raises `TaskNotFoundError` if task not found
- Does NOT trigger any recurrence logic

---

### P2-T19: Implement Due Date Calculation Helper

**Title:** Create `_calculate_next_due_date` helper function

**Description:** Implement a utility function that calculates the next due date based on recurrence type. Handle daily (+1 day), weekly (+7 days), and monthly (+1 month with month-end handling).

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T05

**Acceptance Criteria:**
- Function accepts `due_date` (datetime or None) and `recurrence` (string)
- Returns `None` if input `due_date` is `None`
- Daily: adds 1 day using timedelta
- Weekly: adds 7 days using timedelta
- Monthly: adds 1 month using `dateutil.relativedelta`
- Handles month-end edge cases (e.g., Jan 31 -> Feb 28/29)

---

### P2-T20: Implement Custom Exception Classes

**Title:** Create custom exceptions for error handling

**Description:** Define custom exception classes for task-related errors: `TaskNotFoundError`, `ValidationError`, `EmptyTitleError`. These will be caught by FastAPI exception handlers.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T01

**Acceptance Criteria:**
- `TaskNotFoundError` includes task ID in message
- `ValidationError` includes field name and reason
- `EmptyTitleError` has clear message about title requirement
- Each exception has an `error_code` attribute for JSON responses

---

### P2-T21: Implement FastAPI Exception Handlers

**Title:** Create exception handlers in main.py

**Description:** Register FastAPI exception handlers that catch custom exceptions and return consistent JSON error responses with `detail` and `code` fields.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T20

**Acceptance Criteria:**
- `TaskNotFoundError` returns 404 with `TASK_NOT_FOUND` code
- `ValidationError` returns 400 with `VALIDATION_ERROR` code
- `EmptyTitleError` returns 400 with `EMPTY_TITLE` code
- Response format: `{"detail": "...", "code": "..."}`
- Generic 500 handler for unexpected errors

---

## 4. Backend API Layer Tasks (backend-builder)

---

### P2-T22: Create FastAPI Application Entry Point

**Title:** Implement `main.py` with app initialization

**Description:** Create the main FastAPI application file. Configure CORS middleware, register routers, add startup events, and include exception handlers.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T08, P2-T11, P2-T21

**Acceptance Criteria:**
- FastAPI app created with title "Todo API" and version "2.0.0"
- CORS middleware allows frontend origin (`localhost:3000`)
- Tasks router included under `/api` prefix
- Startup event calls `create_tables()`
- Exception handlers registered
- `uvicorn app.main:app` starts the server

---

### P2-T23: Implement GET /api/tasks Endpoint

**Title:** Create list tasks route with query parameters

**Description:** Implement the GET endpoint for listing tasks. Accept all query parameters for filtering, searching, and sorting. Delegate to service layer.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T13, P2-T22

**Acceptance Criteria:**
- Endpoint: `GET /api/tasks`
- Query params: `status`, `priority`, `tag`, `search`, `due_from`, `due_to`, `sort_by`, `sort_order`
- All params are optional with sensible defaults
- Returns `200 OK` with JSON array of tasks
- Empty array if no tasks match

---

### P2-T24: Implement GET /api/tasks/{id} Endpoint

**Title:** Create get single task route

**Description:** Implement the GET endpoint for retrieving a single task by ID.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T14, P2-T22

**Acceptance Criteria:**
- Endpoint: `GET /api/tasks/{id}`
- Returns `200 OK` with task JSON if found
- Returns `404 Not Found` with error JSON if not found
- Path parameter `id` validated as integer

---

### P2-T25: Implement POST /api/tasks Endpoint

**Title:** Create new task route

**Description:** Implement the POST endpoint for creating a new task. Validate request body using `TaskCreate` schema.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T10, P2-T12, P2-T22

**Acceptance Criteria:**
- Endpoint: `POST /api/tasks`
- Request body validated against `TaskCreate` schema
- Returns `201 Created` with created task JSON
- Returns `400 Bad Request` for validation errors
- Location header includes new task URL

---

### P2-T26: Implement PUT /api/tasks/{id} Endpoint

**Title:** Create update task route

**Description:** Implement the PUT endpoint for updating an existing task. Validate request body using `TaskUpdate` schema.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T10, P2-T15, P2-T22

**Acceptance Criteria:**
- Endpoint: `PUT /api/tasks/{id}`
- Request body validated against `TaskUpdate` schema
- Returns `200 OK` with updated task JSON
- Returns `404 Not Found` if task doesn't exist
- Returns `400 Bad Request` for validation errors
- Does NOT allow changing `completed` via this endpoint

---

### P2-T27: Implement PATCH /api/tasks/{id}/complete Endpoint

**Title:** Create mark complete route

**Description:** Implement the PATCH endpoint for marking a task as complete. Include recurrence handling in response.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T17, P2-T22

**Acceptance Criteria:**
- Endpoint: `PATCH /api/tasks/{id}/complete`
- Returns `200 OK` with `TaskCompleteResponse`
- Response includes `task` (completed) and `next_task` (new recurring or null)
- Returns `404 Not Found` if task doesn't exist

---

### P2-T28: Implement PATCH /api/tasks/{id}/incomplete Endpoint

**Title:** Create mark incomplete route

**Description:** Implement the PATCH endpoint for marking a task as incomplete.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T18, P2-T22

**Acceptance Criteria:**
- Endpoint: `PATCH /api/tasks/{id}/incomplete`
- Returns `200 OK` with updated task JSON
- Returns `404 Not Found` if task doesn't exist

---

### P2-T29: Implement DELETE /api/tasks/{id} Endpoint

**Title:** Create delete task route

**Description:** Implement the DELETE endpoint for removing a task.

**Category:** backend

**Suggested Agent:** backend-builder

**Dependencies:** P2-T16, P2-T22

**Acceptance Criteria:**
- Endpoint: `DELETE /api/tasks/{id}`
- Returns `204 No Content` on successful deletion
- Returns `404 Not Found` if task doesn't exist
- No response body on success

---

## 5. Frontend Structure & Layout Tasks (frontend-builder)

---

### P2-T30: Create TypeScript Type Definitions

**Title:** Define types in `lib/types.ts`

**Description:** Create TypeScript interfaces for all data types used in the frontend: `Task`, `TaskCreate`, `TaskUpdate`, `TaskFilters`, `TaskSort`, and API response types.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T02

**Acceptance Criteria:**
- `Task` interface matches backend model exactly
- `TaskCreate` has required `title` and optional other fields
- `TaskUpdate` has all optional fields
- `TaskFilters` includes all filter parameters
- `TaskSort` includes `sort_by` and `sort_order`
- Types exported and importable from `@/lib/types`

---

### P2-T31: Create API Client Module

**Title:** Implement `lib/api.ts` with typed fetch functions

**Description:** Create the API client module that provides typed functions for all backend endpoints. Use `fetch` API with proper error handling.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T04, P2-T30

**Acceptance Criteria:**
- Base URL from `NEXT_PUBLIC_API_URL` environment variable
- Functions: `fetchTasks`, `fetchTask`, `createTask`, `updateTask`, `deleteTask`, `completeTask`, `incompleteTask`
- All functions are async and return typed responses
- Error responses throw or return error objects
- Content-Type headers set correctly

---

### P2-T32: Create Root Layout

**Title:** Implement `app/layout.tsx`

**Description:** Create the root layout component with basic HTML structure, Tailwind CSS imports, and app-wide styling.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T02

**Acceptance Criteria:**
- Valid Next.js root layout with `<html>` and `<body>` tags
- Tailwind CSS imported via `globals.css`
- Basic typography and color scheme applied
- Metadata (title, description) set for SEO

---

### P2-T33: Create Task List Page

**Title:** Implement main page `app/page.tsx`

**Description:** Create the main task list page that displays all tasks with search, filter, and sort controls. Include the "Add Task" button linking to the create form.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T31, P2-T32, P2-T36, P2-T37, P2-T38, P2-T39, P2-T40

**Acceptance Criteria:**
- Page renders at `/`
- Shows header with app title and "Add Task" button
- Includes SearchBar, FilterControls, SortControls components
- Displays TaskList with fetched tasks
- Shows loading state while fetching
- Shows empty state when no tasks exist
- Shows "no results" state when filters match nothing

---

### P2-T34: Create New Task Page

**Title:** Implement `app/tasks/new/page.tsx`

**Description:** Create the page for adding a new task. Display the TaskForm component in create mode. Handle form submission and redirect on success.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T31, P2-T32, P2-T41

**Acceptance Criteria:**
- Page renders at `/tasks/new`
- Shows TaskForm in create mode
- On successful submission, redirects to `/`
- Cancel button returns to task list
- Shows error messages for validation failures

---

### P2-T35: Create Edit Task Page

**Title:** Implement `app/tasks/[id]/edit/page.tsx`

**Description:** Create the dynamic page for editing an existing task. Fetch task by ID, pre-fill form, and handle updates.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T31, P2-T32, P2-T41

**Acceptance Criteria:**
- Page renders at `/tasks/[id]/edit`
- Fetches task by ID on mount
- Shows loading state while fetching
- Pre-fills TaskForm with existing values
- On successful update, redirects to `/`
- Shows 404 message if task not found

---

### P2-T36: Create TaskList Component

**Title:** Build `components/TaskList.tsx`

**Description:** Create the task list container component that maps tasks to TaskItem components. Handle empty states.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T30, P2-T37

**Acceptance Criteria:**
- Accepts `tasks` array as prop
- Renders TaskItem for each task
- Shows "No tasks yet" when list is empty
- Shows "No matching tasks" when filters return empty
- Handles `onToggleComplete` and `onDelete` callbacks

---

### P2-T37: Create TaskItem Component

**Title:** Build `components/TaskItem.tsx`

**Description:** Create the component for displaying a single task row/card. Include completion toggle, edit/delete buttons, and visual indicators.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T30, P2-T42, P2-T43, P2-T44

**Acceptance Criteria:**
- Displays task title, description preview
- Shows PriorityBadge, TagList, DueDateIndicator
- Completion checkbox toggles task status
- Edit button links to edit page
- Delete button triggers confirmation and deletion
- Completed tasks show strikethrough/dimmed style
- Shows recurrence indicator if applicable

---

### P2-T38: Create SearchBar Component

**Title:** Build `components/SearchBar.tsx`

**Description:** Create the search input component with debounced input handling and clear button.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T02

**Acceptance Criteria:**
- Text input for search keyword
- Debounces input (300ms) before triggering callback
- Clear button resets search
- Search icon for visual clarity
- Placeholder text: "Search tasks..."

---

### P2-T39: Create FilterControls Component

**Title:** Build `components/FilterControls.tsx`

**Description:** Create the filter controls component with dropdowns for status, priority, tag, and date range inputs.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T02, P2-T30

**Acceptance Criteria:**
- Status dropdown: All, Completed, Pending
- Priority dropdown: All, High, Medium, Low
- Tag dropdown: populated from available tags (passed as prop)
- Due date range: From and To date pickers
- All filters default to "All" (no filter)
- Filter changes call `onFilterChange` callback

---

### P2-T40: Create SortControls Component

**Title:** Build `components/SortControls.tsx`

**Description:** Create the sort controls component with dropdown for sort field and toggle for sort order.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T02, P2-T30

**Acceptance Criteria:**
- Sort field dropdown: Due Date, Priority, Title, Created
- Sort order toggle: Asc/Desc (with icons)
- Changes call `onSortChange` callback
- Current selection visually indicated

---

### P2-T41: Create TaskForm Component

**Title:** Build `components/TaskForm.tsx`

**Description:** Create the reusable form component for creating and editing tasks. Include all task fields with appropriate input types.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T02, P2-T30

**Acceptance Criteria:**
- Title field (required, text input)
- Description field (optional, textarea)
- Priority field (dropdown: Low, Medium, High)
- Tags field (multi-input or comma-separated text)
- Due date field (datetime picker)
- Recurrence field (dropdown: None, Daily, Weekly, Monthly)
- Client-side validation for required title
- Submit and Cancel buttons
- Supports both create mode (empty) and edit mode (pre-filled)

---

### P2-T42: Create DueDateIndicator Component

**Title:** Build `components/DueDateIndicator.tsx`

**Description:** Create the component that displays due date status with visual indicators for overdue and due-soon tasks.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T02, P2-T30

**Acceptance Criteria:**
- Shows formatted due date when present
- Red "OVERDUE" badge if due_date < now and not completed
- Yellow "DUE SOON" badge if due_date within 24 hours and not completed
- No indicator for tasks without due date
- No status indicator for completed tasks

---

### P2-T43: Create PriorityBadge Component

**Title:** Build `components/PriorityBadge.tsx`

**Description:** Create the component that displays task priority as a colored badge.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T02

**Acceptance Criteria:**
- High priority: Red badge with "HIGH"
- Medium priority: Yellow badge with "MED"
- Low priority: Green badge with "LOW"
- Consistent sizing and styling

---

### P2-T44: Create TagList Component

**Title:** Build `components/TagList.tsx`

**Description:** Create the component that displays a list of tags as badges/chips.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T02

**Acceptance Criteria:**
- Renders each tag as a small badge/chip
- Consistent styling across all tags
- Handles empty tags array gracefully
- Tags displayed inline with wrapping

---

## 6. Frontend Hooks & State Tasks (frontend-builder)

---

### P2-T45: Create useTasks Hook

**Title:** Implement `hooks/useTasks.ts`

**Description:** Create a custom hook for fetching and managing the task list. Handle loading, error states, and refetching when filters/sort change.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T31, P2-T30

**Acceptance Criteria:**
- Accepts `filters` and `sort` parameters
- Returns `{ tasks, loading, error, refetch }`
- Fetches tasks on mount and when params change
- Handles API errors gracefully
- Uses useEffect for data fetching

---

### P2-T46: Create useTaskMutations Hook

**Title:** Implement `hooks/useTaskMutations.ts`

**Description:** Create a custom hook that provides functions for task mutations: create, update, delete, complete, incomplete.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T31, P2-T30

**Acceptance Criteria:**
- Returns mutation functions: `createTask`, `updateTask`, `deleteTask`, `completeTask`, `incompleteTask`
- Each function handles loading state
- Each function handles errors and returns result
- Provides `loading` and `error` state

---

## 7. Frontend UX Behavior Tasks (frontend-builder)

---

### P2-T47: Implement Search Functionality

**Title:** Wire SearchBar to task fetching

**Description:** Connect the SearchBar component to the task list page. When search input changes (debounced), update query parameters and refetch tasks.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T33, P2-T38, P2-T45

**Acceptance Criteria:**
- Typing in search bar updates search state
- Debounced (300ms) before triggering API call
- Task list updates with search results
- Clear search resets to full list

---

### P2-T48: Implement Filter Functionality

**Title:** Wire FilterControls to task fetching

**Description:** Connect FilterControls to the task list page. When any filter changes, update query parameters and refetch tasks.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T33, P2-T39, P2-T45

**Acceptance Criteria:**
- Filter changes update respective filter state
- API call includes all active filter parameters
- Multiple filters combine correctly (AND logic)
- Resetting a filter to "All" removes that parameter

---

### P2-T49: Implement Sort Functionality

**Title:** Wire SortControls to task fetching

**Description:** Connect SortControls to the task list page. When sort field or order changes, update query parameters and refetch tasks.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T33, P2-T40, P2-T45

**Acceptance Criteria:**
- Sort field selection updates `sort_by` parameter
- Sort order toggle updates `sort_order` parameter
- Task list re-orders based on selected sort
- Default sort: `created_at` descending

---

### P2-T50: Implement Completion Toggle

**Title:** Wire completion checkbox to API

**Description:** When user toggles a task's completion status, call the appropriate PATCH endpoint and update the UI.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T37, P2-T46

**Acceptance Criteria:**
- Clicking toggle calls PATCH `/complete` or `/incomplete`
- UI shows loading indicator on that task
- On success, task list refreshes
- For recurring tasks, new instance appears in list
- Error handling if API call fails

---

### P2-T51: Implement Task Deletion with Confirmation

**Title:** Wire delete button with confirmation dialog

**Description:** When user clicks delete, show confirmation dialog. On confirm, call DELETE endpoint and remove task from list.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T37, P2-T46

**Acceptance Criteria:**
- Delete button shows confirmation prompt/dialog
- Confirms: "Delete this task?"
- On confirm, calls DELETE API
- On success, removes task from list
- On cancel, closes dialog without action

---

### P2-T52: Implement Visual Due Date Indicators

**Title:** Display overdue and due-soon styling

**Description:** Apply visual styling to tasks based on due date status: overdue (red), due soon (yellow), normal.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T37, P2-T42

**Acceptance Criteria:**
- Overdue tasks (due_date < now, not completed): red highlight/border
- Due-soon tasks (within 24h, not completed): yellow/orange highlight
- Completed tasks show no due status indicators
- Tasks without due date show no indicators

---

### P2-T53: Display Recurrence Information

**Title:** Show recurrence rule in TaskItem

**Description:** Display the recurrence type (if not "none") in the TaskItem component so users know which tasks will repeat.

**Category:** frontend

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T37

**Acceptance Criteria:**
- Recurring tasks show recurrence badge (e.g., "Daily", "Weekly", "Monthly")
- Non-recurring tasks show no recurrence indicator
- Badge is visually distinct but subtle
- Recurrence icon or text label

---

## 8. Integration Tasks (frontend-builder + backend-builder)

---

### P2-T54: Verify API Client Matches Backend

**Title:** Ensure frontend API client matches backend endpoints

**Description:** Review and verify that all functions in `lib/api.ts` correctly match the backend API signatures, including URL paths, HTTP methods, and request/response formats.

**Category:** integration

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T31, P2-T29

**Acceptance Criteria:**
- All 7 endpoint functions match backend routes
- Query parameter names match exactly
- Request body schemas match backend expectations
- Response handling matches backend response formats
- Error response handling works correctly

---

### P2-T55: Implement Loading States

**Title:** Add loading indicators throughout frontend

**Description:** Ensure consistent loading state display across the frontend: spinner for initial load, inline indicators for mutations, disabled buttons during requests.

**Category:** integration

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T33, P2-T41, P2-T45, P2-T46

**Acceptance Criteria:**
- Task list shows spinner on initial fetch
- Form submit buttons show loading and are disabled
- Toggle buttons show loading during API calls
- Delete confirmation shows loading during deletion

---

### P2-T56: Implement Error State Handling

**Title:** Add error display throughout frontend

**Description:** Implement error handling across the frontend: display error messages when API calls fail, show retry options where appropriate.

**Category:** integration

**Suggested Agent:** frontend-builder

**Dependencies:** P2-T31, P2-T33, P2-T45, P2-T46

**Acceptance Criteria:**
- Failed task list fetch shows error with retry button
- Failed mutations show toast or inline error
- 404 errors on edit page show "not found" message
- Validation errors display field-specific messages

---

### P2-T57: End-to-End Manual Test

**Title:** Verify complete frontend-backend flow

**Description:** Manually test the complete flow from frontend to backend and database. Verify all CRUD operations, filters, sort, and recurrence work end-to-end.

**Category:** integration

**Suggested Agent:** test-writer

**Dependencies:** P2-T56

**Acceptance Criteria:**
- Create task from UI, verify in database
- Update task from UI, verify changes persist
- Delete task from UI, verify removed from database
- Complete recurring task, verify new task created
- All filters and sort options work correctly

---

## 9. Testing Tasks (test-writer)

---

### P2-T58: Create Manual Test Plan Document

**Title:** Write comprehensive manual test checklist

**Description:** Create a test plan document with detailed test cases for all Phase II functionality. Include steps, expected results, and pass/fail checkboxes.

**Category:** testing

**Suggested Agent:** test-writer

**Dependencies:** P2-T29, P2-T53

**Acceptance Criteria:**
- Test cases for all CRUD operations
- Test cases for search, each filter, each sort option
- Test cases for recurring task creation
- Test cases for visual indicators
- Test cases for error scenarios
- Test cases for edge cases (empty title, invalid data)

---

### P2-T59: Create Backend Unit Tests

**Title:** Write unit tests for service layer functions

**Description:** Create pytest unit tests for all service layer functions in `task_service.py`. Use SQLite in-memory database for testing.

**Category:** testing

**Suggested Agent:** test-writer

**Dependencies:** P2-T12, P2-T13, P2-T14, P2-T15, P2-T16, P2-T17, P2-T18, P2-T19

**Acceptance Criteria:**
- Tests for `create_task` with valid and invalid data
- Tests for `get_tasks` with various filter combinations
- Tests for `update_task` and `delete_task`
- Tests for `mark_complete` with and without recurrence
- Tests for `_calculate_next_due_date` with all recurrence types
- All tests pass with `pytest`

---

### P2-T60: Create Backend API Tests

**Title:** Write API integration tests with TestClient

**Description:** Create FastAPI TestClient tests for all API endpoints. Verify HTTP status codes, response formats, and error handling.

**Category:** testing

**Suggested Agent:** test-writer

**Dependencies:** P2-T29, P2-T59

**Acceptance Criteria:**
- Tests for each of the 7 endpoints
- Tests verify correct HTTP status codes
- Tests verify response JSON structure
- Tests verify error responses for invalid inputs
- All tests pass with `pytest`

---

## 10. Documentation Tasks (doc-writer)

---

### P2-T61: Update Main README for Phase II

**Title:** Add Phase II section to README.md

**Description:** Update the project README with comprehensive Phase II documentation: overview, setup instructions, and usage guide.

**Category:** docs

**Suggested Agent:** doc-writer

**Dependencies:** P2-T06, P2-T57

**Acceptance Criteria:**
- Phase II overview and feature list
- Backend setup instructions (Python, venv, requirements, .env)
- Frontend setup instructions (Node, npm install, .env.local)
- Neon database setup instructions
- Commands to run both frontend and backend
- Brief architecture diagram or description

---

### P2-T62: Create Backend README

**Title:** Write `backend/README.md`

**Description:** Create a dedicated README for the backend with detailed setup, configuration, and API documentation.

**Category:** docs

**Suggested Agent:** doc-writer

**Dependencies:** P2-T29

**Acceptance Criteria:**
- Setup instructions specific to backend
- Environment variable documentation
- API endpoint summary table
- Example requests/responses for each endpoint
- Troubleshooting tips

---

### P2-T63: Create Frontend README

**Title:** Write `frontend/README.md`

**Description:** Create a dedicated README for the frontend with setup instructions and component overview.

**Category:** docs

**Suggested Agent:** doc-writer

**Dependencies:** P2-T53

**Acceptance Criteria:**
- Setup instructions specific to frontend
- Environment variable documentation
- Component overview and structure
- Development commands (`npm run dev`, etc.)
- Build and deployment notes

---

### P2-T64: Create Demo Script

**Title:** Write demo walkthrough script

**Description:** Create a short script (60-90 seconds) for demonstrating Phase II features. Include step-by-step actions and expected outcomes.

**Category:** docs

**Suggested Agent:** doc-writer

**Dependencies:** P2-T57

**Acceptance Criteria:**
- Demo script with numbered steps
- Covers: creating tasks, filtering, sorting
- Shows recurring task completion
- Shows overdue visual indication
- Estimated time per step
- Can be used for video recording or live demo

---

### P2-T65: Update AI Instructions File

**Title:** Update GEMINI.md/CLAUDE.md for Phase II

**Description:** Update the AI collaboration instructions file to explain Phase II workflow, including Spec-Kit-Plus commands and agent usage.

**Category:** docs

**Suggested Agent:** doc-writer

**Dependencies:** P2-T61

**Acceptance Criteria:**
- Documents Phase II architecture
- Explains `/sp.*` command workflow
- Explains agent-based implementation model
- Lists Phase II scope boundaries
- Notes Phase III-V exclusions

---

## 11. Final Review & Cleanup Tasks (manual-architect)

---

### P2-T66: Review Backend Architecture

**Title:** Verify backend matches spec and plan

**Description:** Review the implemented backend code to ensure it matches the Phase II specification and technical plan. Check for any deviations or missing features.

**Category:** planning

**Suggested Agent:** manual-architect

**Dependencies:** P2-T29

**Acceptance Criteria:**
- All API endpoints implemented as specified
- Service layer follows documented design
- Error handling matches specification
- No Phase III-V features present (no AI, no auth)
- Code quality meets non-functional requirements

---

### P2-T67: Review Frontend Architecture

**Title:** Verify frontend matches spec and plan

**Description:** Review the implemented frontend to ensure it matches the Phase II specification. Check UX flows, components, and visual indicators.

**Category:** planning

**Suggested Agent:** manual-architect

**Dependencies:** P2-T53

**Acceptance Criteria:**
- All pages and components implemented
- Search, filter, sort work correctly
- Visual indicators display properly
- Form validation works
- No Phase III-V features present

---

### P2-T68: Verify Phase II Exclusions

**Title:** Confirm no out-of-scope features

**Description:** Final check to ensure no Phase III-V features were accidentally implemented: no AI/chatbot, no Docker/K8s, no auth, no event bus.

**Category:** planning

**Suggested Agent:** manual-architect

**Dependencies:** P2-T66, P2-T67

**Acceptance Criteria:**
- No AI or chatbot code present
- No Dockerfile or Kubernetes manifests
- No authentication/authorization code
- No Kafka/Dapr/event bus integration
- No CI/CD pipeline configuration

---

### P2-T69: Final Acceptance Checklist

**Title:** Complete Phase II acceptance criteria

**Description:** Go through the complete Phase II acceptance criteria checklist from the specification and verify each item is satisfied.

**Category:** planning

**Suggested Agent:** manual-architect

**Dependencies:** P2-T68

**Acceptance Criteria:**
- All core CRUD operations work
- All extended features (priority, tags, search, filter, sort) work
- Recurring tasks work correctly
- Due date indicators display properly
- Data persists in Neon Postgres
- Documentation is complete
- Phase II is ready for review/demo

---

## Task Summary

### By Category

| Category | Count | Task Range |
|----------|-------|------------|
| Config | 6 | P2-T01 to P2-T06 |
| Database | 5 | P2-T07 to P2-T11 |
| Backend | 18 | P2-T12 to P2-T29 |
| Frontend | 24 | P2-T30 to P2-T53 |
| Integration | 4 | P2-T54 to P2-T57 |
| Testing | 3 | P2-T58 to P2-T60 |
| Docs | 5 | P2-T61 to P2-T65 |
| Planning | 4 | P2-T66 to P2-T69 |
| **Total** | **69** | |

### By Agent

| Agent | Count | Primary Tasks |
|-------|-------|---------------|
| `manual-architect` | 5 | Setup, review, final checks |
| `db-modeler` | 5 | Models, database, config |
| `backend-builder` | 19 | Services, routes, API |
| `frontend-builder` | 31 | Components, hooks, pages, UX |
| `test-writer` | 4 | Tests, test plan |
| `doc-writer` | 6 | READMEs, documentation |

### Execution Order (Suggested)

1. **Phase A - Setup**: P2-T01 to P2-T06
2. **Phase B - Database**: P2-T07 to P2-T11
3. **Phase C - Backend Services**: P2-T12 to P2-T21
4. **Phase D - Backend API**: P2-T22 to P2-T29
5. **Phase E - Frontend Structure**: P2-T30 to P2-T44
6. **Phase F - Frontend Hooks/UX**: P2-T45 to P2-T53
7. **Phase G - Integration**: P2-T54 to P2-T57
8. **Phase H - Testing**: P2-T58 to P2-T60
9. **Phase I - Documentation**: P2-T61 to P2-T65
10. **Phase J - Review**: P2-T66 to P2-T69

---

**End of Phase II Task Breakdown**

**Total Tasks: 69**
**Ready for `/sp.implement` agent orchestration**
