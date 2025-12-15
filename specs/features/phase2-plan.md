# Phase II Technical Plan — Full-Stack Todo (Neon + Better Auth + JWT)

**Document Type:** Technical Plan (HOW)
**Source of Truth:** `specs/features/phase2-web.md`
**Status:** Ready for `/sp.tasks` and `/sp.implement`

---

## 0. Overview

This plan transforms the existing Phase II single-user Todo app into a multi-user, JWT-authenticated web application. The implementation adds Better Auth integration on the frontend, JWT verification on the backend, a `user_id` column to scope tasks per user, and maintains Neon-compatible PostgreSQL with timezone-aware timestamps. All work is spec-driven and executed by Claude Code subagents (db-modeler, backend-builder, frontend-builder, test-writer, doc-writer). No Docker/K8s/AI features are in scope.

---

## 1. Implementation Stages & Timeline

### Stage A — Database & Schema (db-modeler)
**Blocking:** None
**Deliverables:**
- [ ] Add `user_id: str` column to Task model (indexed, not null)
- [ ] Update `models.py` with `user_id` field
- [ ] Create migration SQL for existing tables (add column with default)
- [ ] Update `database.py` to handle schema migration
- [ ] Verify timestamptz columns are correctly configured
- [ ] Update `.env.example` with Neon and local DB examples

### Stage B — Backend Core & Auth (backend-builder)
**Blocking:** Stage A complete
**Deliverables:**
- [ ] Create `backend/app/auth.py` with JWT verification dependency
- [ ] Add `BETTER_AUTH_SECRET` to `config.py` Settings
- [ ] Update all routes to use `/{user_id}/tasks` path pattern
- [ ] Implement ownership verification (JWT claim vs path param)
- [ ] Update `task_service.py` to filter by `user_id`
- [ ] Update CORS to allow frontend origins
- [ ] Update error responses to match spec format
- [ ] Change backend port to 8001 (spec requirement)

### Stage C — Frontend Integration & Better Auth (frontend-builder)
**Blocking:** Stage B complete
**Deliverables:**
- [ ] Install and configure Better Auth
- [ ] Create `lib/auth.ts` for token management
- [ ] Update `lib/api.ts` to attach `Authorization: Bearer` header
- [ ] Update API client to use `/{user_id}/tasks` endpoints
- [ ] Add login/logout UI components
- [ ] Update `.env.local.example` with required variables
- [ ] Handle 401/403 errors with redirect to login

### Stage D — Tests & Verification (test-writer)
**Blocking:** Stage B complete
**Deliverables:**
- [ ] Create `backend/tests/test_auth.py` for JWT verification
- [ ] Update existing tests to include `user_id` in fixtures
- [ ] Add ownership enforcement tests (403 scenarios)
- [ ] Add multi-user isolation tests
- [ ] Ensure all tests use SQLite in-memory (no real DB)
- [ ] Create integration test script with curl examples

### Stage E — Documentation (doc-writer)
**Blocking:** Stages A-D complete
**Deliverables:**
- [ ] Update `backend/README.md` with auth setup instructions
- [ ] Update `frontend/README.md` with Better Auth config
- [ ] Update root `README.md` with Phase II overview
- [ ] Update `CLAUDE.md` files for agent guidance
- [ ] Create demo script for 90-second walkthrough

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS FRONTEND (:3000)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Better Auth │  │   Pages/    │  │      lib/api.ts         │  │
│  │  (Login)    │──│  Components │──│ (Authorization: Bearer) │  │
│  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │
└────────────────────────────────────────────────┬────────────────┘
                                                 │ JWT in Header
                                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND (:8001)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   auth.py   │  │   routes/   │  │    services/            │  │
│  │ (Verify JWT)│──│  tasks.py   │──│   task_service.py       │  │
│  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │
└────────────────────────────────────────────────┬────────────────┘
                                                 │ SQLModel/asyncpg
                                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              NEON SERVERLESS POSTGRESQL                          │
│                    (or Local Postgres)                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  tasks (id, user_id, title, ... , created_at, updated_at) │   │
│  │         └── INDEX on user_id                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Environment Variables:
├── Backend:  DATABASE_URL, BETTER_AUTH_SECRET, TESTING
└── Frontend: NEXT_PUBLIC_API_BASE_URL, BETTER_AUTH_SECRET
```

---

## 3. Neon & Database Strategy (db-modeler)

### 3.1 Connection Handling
- Read `DATABASE_URL` from environment (Pydantic Settings)
- Auto-convert `postgresql://` to `postgresql+asyncpg://` for async engine
- For Neon: connection string MUST include `?sslmode=require`
- For local dev: standard PostgreSQL connection works

### 3.2 Engine Configuration
```
Engine creation pattern:
1. Read DATABASE_URL from settings
2. Convert to async URL (postgresql+asyncpg://)
3. Create async engine with:
   - echo=DEBUG (for SQL logging in dev)
   - pool_pre_ping=True (connection health check)
   - pool_size=5, max_overflow=10 (conservative for Neon)
```

### 3.3 Schema Changes Required

**Current Model (no user_id):**
```
tasks: id, title, description, completed, priority, tags, due_date, recurrence, created_at, updated_at
```

**Target Model (with user_id):**
```
tasks: id, user_id, title, description, completed, priority, tags, due_date, recurrence, created_at, updated_at
        └── NOT NULL, INDEXED
```

### 3.4 Migration Strategy

**Step 1: Check if user_id column exists**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'user_id';
```

**Step 2: If not exists, add column**
```sql
-- Add column with default for existing rows
ALTER TABLE tasks ADD COLUMN user_id VARCHAR(255) DEFAULT 'legacy_user';

-- Update existing rows (if needed)
UPDATE tasks SET user_id = 'legacy_user' WHERE user_id IS NULL;

-- Make NOT NULL
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;

-- Remove default (column should be explicitly set)
ALTER TABLE tasks ALTER COLUMN user_id DROP DEFAULT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
```

**Step 3: Fallback for TESTING environment**
- If migration fails and `TESTING=1`, drop and recreate tables
- Log warning: "TESTING mode: tables recreated"

### 3.5 Database Permissions (for local dev)
```sql
-- Run as postgres superuser if permission errors occur
GRANT ALL PRIVILEGES ON SCHEMA public TO todo_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO todo_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO todo_user;
```

### 3.6 Neon-Specific Notes
- Neon auto-scales; keep pool_size conservative (5)
- Connection may sleep after inactivity; pool_pre_ping handles reconnection
- Always use `sslmode=require` in production connection string

---

## 4. Auth & Security Plan (backend-builder)

### 4.1 JWT Verification Dependency Design

**File:** `backend/app/auth.py`

**Dependency function: `get_current_user_id()`**
```
Input:
  - authorization: str (Header) - "Bearer <token>"
  - user_id: str (Path) - from URL /{user_id}/tasks

Process:
  1. If no authorization header → raise HTTPException(401)
  2. Extract token from "Bearer <token>" format
  3. If not "Bearer " prefix → raise HTTPException(401)
  4. Decode JWT using PyJWT:
     - algorithm: HS256
     - secret: settings.BETTER_AUTH_SECRET
     - options: verify_exp=True
  5. If decode fails (invalid signature, expired) → raise HTTPException(401)
  6. Extract user_id from claims:
     - Primary: payload["sub"]
     - Fallback: payload.get("user_id")
  7. Compare token_user_id with path user_id
  8. If mismatch → raise HTTPException(403)
  9. Return verified user_id

Output: str (verified user_id)
```

### 4.2 Route Protection Pattern
```
@router.get("/{user_id}/tasks")
async def list_tasks(
    user_id: str = Path(...),
    verified_user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    # verified_user_id is guaranteed to match user_id
    tasks = await task_service.get_tasks(session, user_id=verified_user_id, ...)
    return tasks
```

### 4.3 Error Response Format
All auth errors return JSON:
```json
{
  "detail": "Not authenticated"  // 401
}
{
  "detail": "Not authorized to access this resource"  // 403
}
```

### 4.4 CORS Configuration
```
Allowed origins (dev):
  - http://localhost:3000
  - http://127.0.0.1:3000

Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Allowed headers: * (including Authorization)
Credentials: True
```

### 4.5 Secrets Management
- `BETTER_AUTH_SECRET`: 256-bit secret key, shared between frontend and backend
- NEVER hardcode in source code
- Use `.env` files (gitignored)
- In production: use environment variables or secrets manager

---

## 5. Backend Design & Services (backend-builder)

### 5.1 Project Layout
```
backend/app/
├── __init__.py
├── main.py           # FastAPI app, CORS, lifespan (PORT 8001)
├── config.py         # Settings: DATABASE_URL, BETTER_AUTH_SECRET, TESTING
├── database.py       # Engine, get_session(), create_tables(), migrate_schema()
├── models.py         # Task SQLModel (with user_id)
├── schemas.py        # TaskCreate, TaskRead, TaskUpdate, TaskListQuery
├── auth.py           # NEW: get_current_user_id() dependency
├── exceptions.py     # Custom exceptions
├── services/
│   └── task_service.py  # CRUD + recurrence (filter by user_id)
├── routes/
│   ├── tasks.py      # /api/{user_id}/tasks endpoints
│   └── system.py     # /api/system/db-health (no auth)
└── utils/
    └── datetime_utils.py  # ensure_aware_utc()
```

### 5.2 Service Layer Changes

**All service functions must accept `user_id` parameter:**

| Function | Current Signature | New Signature |
|----------|-------------------|---------------|
| create_task | `(session, task_data)` | `(session, user_id, task_data)` |
| get_tasks | `(session, filters...)` | `(session, user_id, filters...)` |
| get_task_by_id | `(session, task_id)` | `(session, user_id, task_id)` |
| update_task | `(session, task_id, data)` | `(session, user_id, task_id, data)` |
| delete_task | `(session, task_id)` | `(session, user_id, task_id)` |
| mark_complete | `(session, task_id)` | `(session, user_id, task_id)` |
| mark_incomplete | `(session, task_id)` | `(session, user_id, task_id)` |

**Ownership enforcement in service layer:**
```
get_task_by_id(session, user_id, task_id):
    query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = await session.execute(query)
    if not task:
        raise TaskNotFoundError(task_id)  # 404
    return task
```

### 5.3 Recurrence Algorithm

**When mark_complete() is called on a recurring task:**

```
1. Fetch task by id AND user_id (ownership check)
2. Set task.completed = True
3. Set task.updated_at = datetime.now(timezone.utc)
4. If task.recurrence != "none":
   a. Calculate next_due_date:
      - If task.due_date is not None:
        - daily: due_date + timedelta(days=1)
        - weekly: due_date + timedelta(days=7)
        - monthly: due_date + relativedelta(months=1)
      - Else: next_due_date = None
   b. Create new Task:
      - user_id = task.user_id (IMPORTANT: copy user_id)
      - title = task.title
      - description = task.description
      - priority = task.priority
      - tags = task.tags.copy()
      - recurrence = task.recurrence
      - due_date = next_due_date
      - completed = False
      - created_at = now()
      - updated_at = now()
   c. Add new task to session
5. Flush and return (original_task, new_task or None)
```

### 5.4 DateTime Handling
- All datetime values normalized to UTC before storage
- Use `ensure_aware_utc()` helper for incoming datetimes
- Database columns use `DateTime(timezone=True)` → timestamptz
- Response serialization: ISO8601 format with Z suffix

### 5.5 Port Configuration
- **IMPORTANT:** Backend runs on port **8001** (not 8000)
- Update uvicorn command in docs and scripts

---

## 6. Frontend Plan (frontend-builder)

### 6.1 Environment Variables
```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api
BETTER_AUTH_SECRET=your-256-bit-secret-key-here
BETTER_AUTH_URL=http://localhost:3000/api/auth
```

### 6.2 Better Auth Integration

**Setup steps:**
1. Install: `npm install better-auth`
2. Create `lib/auth.ts`:
   - Configure Better Auth with `BETTER_AUTH_SECRET`
   - Enable JWT token generation
   - Configure session strategy
3. Create API routes for auth: `app/api/auth/[...all]/route.ts`
4. Create auth context/provider for client components

**Token flow:**
```
1. User logs in via Better Auth
2. Better Auth issues JWT (stored in cookie or localStorage for dev)
3. Frontend extracts token for API calls
4. API client attaches: Authorization: Bearer <token>
```

### 6.3 API Client Updates

**File:** `frontend/lib/api.ts`

```
Changes required:
1. Read NEXT_PUBLIC_API_BASE_URL from env
2. Add getAuthToken() function to retrieve JWT
3. Update all fetch calls to include Authorization header
4. Update endpoint paths: /api/tasks → /api/{user_id}/tasks
5. Add getUserId() to decode JWT and extract sub claim
6. Handle 401 → redirect to login
7. Handle 403 → show "access denied" message
```

### 6.4 User ID Strategy
```
1. User logs in → Better Auth issues JWT
2. Frontend decodes JWT to get user_id (sub claim)
3. Store user_id in auth context
4. All API calls use: /api/{user_id}/tasks
5. Backend verifies JWT claim matches path param
```

### 6.5 Component Updates

| Component | Changes |
|-----------|---------|
| TaskList | Add auth check; pass user_id to API calls |
| TaskItem | No changes (operates on fetched tasks) |
| TaskForm | Include user_id in create/update calls |
| FilterBar | No changes |
| Layout | Add auth provider wrapper |
| NEW: LoginButton | Better Auth login/logout |
| NEW: AuthGuard | Redirect to login if not authenticated |

### 6.6 Error Handling
```
401 Unauthorized → Redirect to /login
403 Forbidden → Show "Access denied" toast
404 Not Found → Show "Task not found" message
500 Server Error → Show "Something went wrong" message
```

---

## 7. Tests & Verification (test-writer)

### 7.1 Unit Tests (SQLite in-memory)

**File:** `backend/tests/test_auth.py`
```
Tests to create:
- test_valid_jwt_accepted
- test_missing_token_returns_401
- test_invalid_signature_returns_401
- test_expired_token_returns_401
- test_user_id_mismatch_returns_403
- test_sub_claim_extracted_correctly
- test_fallback_to_user_id_claim
```

**File:** `backend/tests/test_services.py` (updates)
```
Add user_id to all test fixtures:
- test_create_task_with_user_id
- test_list_tasks_filters_by_user_id
- test_cannot_access_other_user_task
- test_recurrence_preserves_user_id
```

### 7.2 Test Fixtures Update

**conftest.py additions:**
```python
TEST_USER_ID = "test_user_123"
TEST_OTHER_USER_ID = "other_user_456"
TEST_SECRET = "test-secret-key-for-testing-only"

@pytest.fixture
def valid_jwt():
    """Generate valid JWT for TEST_USER_ID"""

@pytest.fixture
def other_user_jwt():
    """Generate valid JWT for TEST_OTHER_USER_ID"""
```

### 7.3 Integration Test Script

**File:** `backend/test_integration.sh`
```bash
#!/bin/bash
# Requires backend running on 8001

# Health check
curl -s http://127.0.0.1:8001/api/system/db-health | jq

# Create task (with JWT)
curl -s -X POST http://127.0.0.1:8001/api/test_user/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_JWT" \
  -d '{"title": "Test task"}' | jq

# List tasks
curl -s http://127.0.0.1:8001/api/test_user/tasks \
  -H "Authorization: Bearer $TEST_JWT" | jq
```

### 7.4 CI Recommendations
```yaml
# .github/workflows/test.yml
- pytest backend/ -q --tb=short
- ruff check backend/
```

---

## 8. File-to-Agent Mapping

| File Path | Agent | Action |
|-----------|-------|--------|
| `backend/app/models.py` | db-modeler | UPDATE: add user_id field |
| `backend/app/database.py` | db-modeler | UPDATE: add migration logic |
| `backend/.env.example` | db-modeler | UPDATE: add BETTER_AUTH_SECRET |
| `backend/app/config.py` | backend-builder | UPDATE: add BETTER_AUTH_SECRET |
| `backend/app/auth.py` | backend-builder | CREATE: JWT verification |
| `backend/app/routes/tasks.py` | backend-builder | UPDATE: add {user_id} path, auth dep |
| `backend/app/services/task_service.py` | backend-builder | UPDATE: add user_id filtering |
| `backend/app/main.py` | backend-builder | UPDATE: port 8001, CORS |
| `backend/app/schemas.py` | backend-builder | UPDATE: add user_id to response |
| `frontend/lib/auth.ts` | frontend-builder | CREATE: Better Auth setup |
| `frontend/lib/api.ts` | frontend-builder | UPDATE: auth header, user_id paths |
| `frontend/app/api/auth/[...all]/route.ts` | frontend-builder | CREATE: Better Auth routes |
| `frontend/.env.local.example` | frontend-builder | UPDATE: add auth vars |
| `backend/tests/test_auth.py` | test-writer | CREATE: JWT tests |
| `backend/tests/test_services.py` | test-writer | UPDATE: user_id fixtures |
| `backend/tests/conftest.py` | test-writer | UPDATE: JWT fixtures |
| `backend/README.md` | doc-writer | UPDATE: auth setup |
| `frontend/README.md` | doc-writer | UPDATE: Better Auth config |
| `README.md` | doc-writer | UPDATE: Phase II overview |
| `CLAUDE.md` | doc-writer | UPDATE: agent guidance |

---

## 9. Run & Verification Commands

### 9.1 Backend Environment Setup
```bash
cd backend

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql://todo_user:password@localhost:5432/todo_app
BETTER_AUTH_SECRET=your-256-bit-secret-key-minimum-32-chars
TESTING=0
DEBUG=True
EOF
```

### 9.2 Start Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8001
```

### 9.3 Start Frontend
```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:3000
```

### 9.4 Health Check
```bash
curl http://127.0.0.1:8001/api/system/db-health
# Expected: {"database_ok": true, "sample_time": "2025-..."}
```

### 9.5 Create Task with JWT
```bash
# Generate test JWT (example using Python)
python -c "
import jwt
from datetime import datetime, timedelta
secret = 'your-256-bit-secret-key-minimum-32-chars'
payload = {'sub': 'test_user', 'exp': datetime.utcnow() + timedelta(hours=1)}
print(jwt.encode(payload, secret, algorithm='HS256'))
"

# Use the token
export JWT="<token from above>"
curl -X POST http://127.0.0.1:8001/api/test_user/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d '{"title": "Test task", "priority": "high"}'
```

### 9.6 Run Tests
```bash
cd backend
pytest -q
# Expected: all tests pass
```

---

## 10. Migration & Rollback Guidance

### 10.1 Forward Migration (Add user_id)
```sql
-- Step 1: Add column with default
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) DEFAULT 'legacy_user';

-- Step 2: Make not null
UPDATE tasks SET user_id = 'legacy_user' WHERE user_id IS NULL;
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN user_id DROP DEFAULT;

-- Step 3: Add index
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
```

### 10.2 Rollback (Remove user_id)
```sql
-- Only if needed to revert
DROP INDEX IF EXISTS idx_tasks_user_id;
ALTER TABLE tasks DROP COLUMN IF EXISTS user_id;
```

### 10.3 Backup Recommendation
```bash
# Before migration
pg_dump -U todo_user -d todo_app > backup_before_user_id.sql

# After migration (verify)
pg_dump -U todo_user -d todo_app > backup_after_user_id.sql
```

### 10.4 Testing Migration
```bash
# Dev only: set TESTING=1 to allow drop/recreate on failure
export TESTING=1
uvicorn app.main:app --reload --port 8001
```

---

## 11. Acceptance Criteria (Testable)

| ID | Criterion | Verification Command |
|----|-----------|---------------------|
| AC1 | Server starts | `uvicorn app.main:app --port 8001` (no errors) |
| AC2 | DB health | `curl http://127.0.0.1:8001/api/system/db-health` → `{"database_ok": true}` |
| AC3 | JWT required | `curl http://127.0.0.1:8001/api/user/tasks` → 401 |
| AC4 | Valid JWT works | `curl -H "Authorization: Bearer $JWT" http://127.0.0.1:8001/api/user/tasks` → 200 |
| AC5 | Ownership enforced | JWT for user_a accessing `/api/user_b/tasks` → 403 |
| AC6 | Create with user_id | Task created has correct user_id in DB |
| AC7 | Recurrence works | Complete recurring task → new task created with user_id |
| AC8 | Timestamps TZ-aware | `created_at` shows timezone offset |
| AC9 | Tests pass | `pytest backend/ -q` → exit 0 |
| AC10 | Frontend auth | Login → JWT attached → tasks load |

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **JWT secret leak** | High: Auth bypass | Use env vars only; gitignore .env; rotate secret if exposed |
| **Timezone bugs** | Medium: Wrong due dates | Use ensure_aware_utc() everywhere; test edge cases |
| **Neon connection limits** | Medium: 500 errors | Conservative pool sizing (5); pool_pre_ping=True |
| **CORS misconfiguration** | Medium: Frontend blocked | Explicit origin list; test from browser |
| **Spec drift** | Low: Implementation mismatch | Agents reference spec; acceptance criteria verify |

---

## 13. Deliverables & Reporting

### 13.1 Agent Reports (after each stage)
Each agent must report:
- [ ] Files created/modified (full paths)
- [ ] Commands to verify changes
- [ ] Test results (if applicable)
- [ ] Migration notes (if DB changes)
- [ ] Any manual steps required

### 13.2 Final Submission Requirements
- [ ] GitHub repository with all code
- [ ] Vercel deployment link (frontend) — optional
- [ ] Demo video (≤90 seconds) showing:
  - Login flow
  - Create task
  - Complete recurring task
  - Multi-user isolation
- [ ] Hackathon submission form completed

### 13.3 Verification Checklist
```
[ ] Backend starts on port 8001
[ ] /api/system/db-health returns 200
[ ] JWT verification works (401/403 scenarios)
[ ] CRUD operations work with auth
[ ] Recurrence creates new task with user_id
[ ] Frontend can login and manage tasks
[ ] pytest passes
[ ] No hardcoded secrets
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-15 | Claude (plan-writer) | Initial technical plan |

---

**End of Phase II Technical Plan**
