# Phase II Specification
## Full-Stack Web Todo Application (Next.js + FastAPI + SQLModel + Neon)

---

## 1. Objective

Build a full-stack Todo web application that evolves the Phase I in-memory CLI into a persistent, browser-based experience.

The Phase II app must:

- Implement all existing **Basic Level features** from Phase I:
  1. Add Task
  2. Delete Task
  3. Update Task
  4. View Task List
  5. Mark as Complete / Incomplete

- AND implement the following **Intermediate and Advanced Level features** via the web UI and API:
  - Priorities & Tags/Categories
  - Search & Filter
  - Sort Tasks
  - Recurring Tasks
  - Due Dates & Time Reminders (browser-based)

All functionality must be accessible through a **web UI** powered by a **Next.js frontend** and a **FastAPI backend** connected to a **Neon serverless Postgres database via SQLModel**.

---

## 2. Scope

### 2.1 In-Scope (Phase II)

- Full-stack web application with:
  - Next.js frontend (React, TypeScript recommended)
  - FastAPI backend (Python 3.13+)
  - SQLModel ORM
  - Neon Postgres as the database

- Features:
  - Basic CRUD for tasks (Add, View, Update, Delete, Mark Complete/Incomplete)
  - Priorities (e.g. high / medium / low)
  - Tags / Categories (e.g. work, home, study)
  - Search by keyword
  - Filter by:
    - Status (completed / pending)
    - Priority
    - Tag/category
    - Due date range
  - Sort by:
    - Due date
    - Priority
    - Title (alphabetical)
    - Created time
  - Recurring tasks:
    - Support simple recurrence patterns like:
      - Daily
      - Weekly
      - Monthly
    - Automatically generate the next occurrence when one is completed or when a due date passes.
  - Due dates & time reminders:
    - Each task may have an optional due date and time
    - UI must provide a date/time selector
    - Browser-level reminders:
      - At minimum, highlight overdue/near-due tasks in the UI
      - Optional: use browser notifications if permission is granted and the page is open

### 2.2 Out-of-Scope (Phase II)

- No conversational AI/chatbot interface (Phase III).
- No MCP, OpenAI Agents SDK, or ChatKit integration.
- No containerization, Kubernetes, Helm, or cloud deployment automation (Phase IV-V).
- No event bus (Kafka, Dapr) yet.
- No multi-tenant or multi-user authentication system (Phase II can assume a single user context).

---

## 3. Technology Stack

### 3.1 Frontend

- Framework: **Next.js** (App Router or Pages Router; App Router preferred)
- Language: **TypeScript** (recommended)
- Styling: Any reasonable approach (e.g. CSS Modules, Tailwind CSS, or styled components)
- Responsibilities:
  - Render task lists and detail views
  - Provide forms for creating and editing tasks
  - Provide controls for search, filter, sort
  - Provide UI controls for priorities, tags, due dates, recurrence
  - Optionally show visual indicators for overdue/soon-due tasks

### 3.2 Backend

- Framework: **FastAPI**
- Language: **Python 3.13+**
- ORM: **SQLModel**
- Responsibilities:
  - Expose RESTful JSON APIs for all task operations
  - Enforce validation and business rules
  - Interact with Neon Postgres database through SQLModel models

### 3.3 Database

- **Neon serverless Postgres**
- SQLModel models mapped to database tables.
- Single `tasks` table (plus optional helper tables if needed, e.g. for tags) with fields defined in the domain model.

---

## 4. Domain Model

### 4.1 Task Entity

The Task entity in the database and API MUST include at least:

- `id` (int, primary key)
- `title` (string, required, non-empty)
- `description` (string, optional)
- `completed` (boolean, default: false)
- `priority` (enum/string: e.g. `"low" | "medium" | "high"`)
- `tags` (list of strings or normalized relation; spec may allow simple array for now)
- `due_date` (datetime, optional)
- `recurrence` (optional recurrence rule, e.g.: `"none" | "daily" | "weekly" | "monthly"`)
- `created_at` (datetime)
- `updated_at` (datetime)

Exact SQLModel implementation details are handled in the plan, but the spec defines these fields and semantics.

---

## 5. Backend API Design

Define a REST-style API for tasks, at minimum:

- `GET /api/tasks`
  - Query params for:
    - `status` (completed / pending)
    - `priority`
    - `tag`
    - `search` (keyword in title/description)
    - `sort_by` and `sort_order`
  - Returns paginated or full list of tasks.

- `GET /api/tasks/{id}`
  - Returns a single task by ID.

- `POST /api/tasks`
  - Creates a new task.
  - Accepts:
    - title (required)
    - description (optional)
    - priority (defaults to medium or similar)
    - tags (optional)
    - due_date (optional)
    - recurrence (optional)
  - Returns created task.

- `PUT /api/tasks/{id}`
  - Updates task fields (title, description, priority, tags, due_date, recurrence).
  - Does NOT directly toggle completion.

- `PATCH /api/tasks/{id}/complete`
  - Marks task complete (set `completed = true`).
  - For recurring tasks, may auto-create the next occurrence based on recurrence rule.

- `PATCH /api/tasks/{id}/incomplete`
  - Marks task incomplete (set `completed = false`).

- `DELETE /api/tasks/{id}`
  - Deletes a task by ID.

Error handling requirements:

- Clear JSON error responses for:
  - Invalid IDs
  - Validation failures
  - Missing required fields

---

## 6. Frontend UX & Flows

### 6.1 Main Task List View

The main page should:

- Display a list/table of tasks with:
  - Title
  - Priority
  - Tags
  - Due date
  - Completion status indicator
- Provide controls for:
  - Search input
  - Filter dropdowns or controls:
    - Status, priority, tag, due date
  - Sort dropdown (sort by due date, priority, title, created time)
- Visually indicate:
  - Completed tasks
  - Overdue tasks (due_date < now)
  - Tasks due soon (e.g. within next 24 hours, if implemented)

### 6.2 Task Creation & Editing

- A form to create new tasks:
  - Fields: title, description, priority, tags, due date, recurrence
  - Validate required fields on the client and server.

- Edit flow:
  - Ability to open a task for editing.
  - Change any editable fields.
  - Save changes via API.

### 6.3 Completion & Recurrence UX

- Allow toggling completion from the task list (e.g. checkbox or button).
- For recurring tasks:
  - When a recurring task is completed, the system creates the next instance according to the recurrence rule.
  - The UI should show the new instance appropriately.

### 6.4 Reminders & Notifications (Phase II level)

At minimum:

- Overdue/soon-due tasks are visually highlighted in the UI.
- Optional:
  - If technically feasible without overcomplicating Phase II, browser notifications can be used when:
    - User has granted permission.
    - The page is open.

---

## 7. Data Persistence & Environment

- All tasks must be stored in **Neon Postgres** via SQLModel.
- No in-memory-only storage for the main app (in-memory is only for Phase I).
- Configuration such as DB URL must be loaded from environment variables (e.g. `.env`).
- The spec does not dictate exact deployment of Neon; it only requires that the app can connect to a Neon Postgres instance.

---

## 8. Non-Functional Requirements

- Clean and maintainable code in both frontend and backend.
- Consistent error handling and user feedback.
- No blocking calls in the FastAPI backend where async is appropriate.
- Reasonable performance for typical Todo list usage.
- Clear separation of concerns:
  - UI components vs. data fetching hooks in Next.js.
  - API routers vs. database models vs. service logic in FastAPI.

---

## 9. Project Structure (High-Level Guidance)

The exact structure will be finalized in the Phase II Technical Plan, but at a high level:

- A single repository containing both frontend and backend, for example:

  - `frontend/` - Next.js app
  - `backend/` - FastAPI + SQLModel app
  - `specs/` - Spec-Kit-Plus specs for Phase II
  - `.specify/` - Spec-Kit-Plus internal data

- Frontend and backend must be able to run locally with simple commands described later in the README.

---

## 10. Acceptance Criteria

Phase II is considered complete when:

1. A user can manage tasks fully through the web UI:
   - Add, view, update, delete, mark complete/incomplete.

2. The app supports:
   - Priorities
   - Tags/categories
   - Search by keyword
   - Filter by status, priority, tag, due date range
   - Sort by due date, priority, title, created time

3. Recurring tasks work:
   - User can set a task to recur daily, weekly, or monthly.
   - When a recurring task is completed, the next occurrence is created automatically.

4. Due dates and reminders work:
   - User can set a due date/time on any task.
   - Overdue and soon-due tasks are visually highlighted.
   - Optional: browser notifications for reminders (if page is open and permission granted).

5. All data persists in Neon Postgres:
   - Tasks survive browser refresh and server restart.

6. The frontend (Next.js) and backend (FastAPI) communicate correctly via REST API.

7. No out-of-scope features are present:
   - No AI/chatbot
   - No containerization or cloud deployment automation
   - No multi-user authentication

---

## 11. Summary

Phase II evolves the Phase I Todo app from an in-memory CLI to a full-stack web application. It introduces database persistence, a modern React-based frontend, and a Python backend. The feature set expands to include priorities, tags, search, filter, sort, recurring tasks, and due date reminders. This phase lays the foundation for future enhancements (AI agents, containerization, cloud deployment) in subsequent phases.
