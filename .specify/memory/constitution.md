# Full Stack Todo Application Constitution

**Version**: 1.0.0 | **Status**: LOCKED | **Ratified**: 2025-12-16

---

## Purpose

Build a secure, production-ready Todo application with authentication, protected dashboards, clean routing, and robust error handling. This constitution defines immutable rules for backend, frontend, authentication, API behavior, and UI stability.

---

## Technology Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| Language | Python 3.11+ |
| ORM | SQLModel |
| Database | PostgreSQL |
| Auth Type | JWT Bearer Token |
| Password Hashing | passlib + bcrypt |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Auth Storage | localStorage |
| Routing | Client-side + protected routes |

---

## Global Laws

1. No breaking API changes without version bump
2. Authentication is required for all task operations
3. One login per session; no redirect loops allowed
4. Frontend must never crash due to undefined/null values
5. Backend must never infer user identity from client input

---

## Phase 1: Authentication & Core Tasks

### Authentication Rules

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Accepts**: `application/x-www-form-urlencoded`
- **Returns**: `access_token`, `token_type: bearer`, `user_id`
- **Behavior**:
  - On success, frontend must store token and user_id
  - Redirect user to `/dashboard` exactly once

#### Register
- **Endpoint**: `POST /api/auth/register`
- **Accepts**: `application/json`
- **Behavior**:
  - Hash password before storing
  - Enforce unique email
  - Never auto-login unless explicitly stated

### Frontend Auth Laws

1. `isAuthenticated()` must only check token existence
2. **AuthGuard must**:
   - Run ONLY on client
   - Redirect unauthenticated users to `/login`
   - Never redirect authenticated users back to `/login`
3. Login page must redirect authenticated users to `/dashboard`
4. Dashboard must NEVER require re-login after authentication

---

## Task Model (Canonical)

### Schema

| Field | Type | Notes |
|-------|------|-------|
| id | integer | Primary key |
| title | string | Required |
| description | string \| null | Optional |
| completed | boolean | Default: false |
| priority | low \| medium \| high | Default: "medium" |
| due_date | datetime \| null | Optional |
| owner_id | integer | Foreign key to user |
| created_at | datetime | Auto-generated |
| updated_at | datetime | Auto-updated |

### Data Integrity Laws

1. Priority is optional but defaults to "medium"
2. Priority must NEVER be undefined on frontend
3. UI must safely render missing fields
4. Backend validates all path params as integers

---

## Phase 2: Task Management & Patch Support

### Task Endpoints

| Operation | Method | Path | Auth |
|-----------|--------|------|------|
| List | GET | `/api/tasks` | Required |
| Create | POST | `/api/tasks` | Required |
| Update | PUT | `/api/tasks/{task_id}` | Required |
| Delete | DELETE | `/api/tasks/{task_id}` | Required |
| Toggle Completion | PATCH | `/api/tasks/{task_id}/status` | Required |

### Toggle Completion Rules
- **Body**: `{ completed: boolean }`
- Must validate `task_id` as integer
- Must validate ownership
- Must return updated task

---

## Frontend UI Laws

### Dashboard Rules

1. Dashboard is protected by AuthGuard
2. Dashboard fetches tasks only from `/api/tasks`
3. No route should ever resolve `/tasks` as `task_id`
4. Hooks must not call `/tasks/{string}`

### UI Safety Rules

1. No component may call `.toUpperCase()` on undefined
2. All visual labels must have fallbacks
3. PriorityBadge must default to "MEDIUM" if missing
4. Task rendering must survive empty or partial API data

---

## Error Handling

### Backend Errors

| Code | Meaning |
|------|---------|
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Internal server error |

### Frontend Errors

1. Display user-friendly error messages
2. Never expose stack traces to users
3. Log errors for debugging
4. Gracefully handle network failures

---

## Governance

1. This constitution supersedes all other practices
2. Amendments require documentation, approval, and migration plan
3. All PRs/reviews must verify compliance with these rules
4. Complexity must be justified against these principles

---

**Version**: 1.0.0 | **Ratified**: 2025-12-16 | **Last Amended**: 2025-12-16
