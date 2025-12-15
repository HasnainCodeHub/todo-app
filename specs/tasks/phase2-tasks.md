# Phase II Task Breakdown — Full-Stack Todo (Neon + Better Auth + JWT)

This document contains an exhaustive, atomic, and agent-executable task list for implementing the Phase II features.

---

## Stage A — Database & Schema (db-modeler)

### P2-T001: Initialize Neon-compatible DB wiring
- **Description:** Create `backend/app/database.py` that reads `DATABASE_URL`, creates an async SQLModel engine compatible with Neon/asyncpg, provides `get_session()` dependency, and implements `create_tables()` with ALTER-first strategy and dev fallback.
- **Category:** database
- **Suggested Agent:** db-modeler
- **Dependencies:** none
- **Acceptance Criteria:**
  - `backend/app/database.py` exists.
  - Contains engine creation reading `DATABASE_URL`.
  - `create_tables()` attempts ALTER (documented SQL) and logs outcomes.
  - One-line python snippet provided to `SELECT 1` using the engine.

### P2-T002: Implement Task SQLModel with timestamptz & JSON tags
- **Description:** Create `backend/app/models.py` with `Task` model: id, user_id, title, description, completed, priority, tags (JSON), due_date (DateTime(timezone=True)), recurrence, created_at, updated_at. Add indexes for `user_id` and `completed`.
- **Category:** database
- **Suggested Agent:** db-modeler
- **Dependencies:** P2-T001
- **Acceptance Criteria:**
  - `Task` model file exists.
  - SQLAlchemy column types use timezone-aware DateTime.
  - `tags` stored as JSON.
  - `SQLModel.metadata` contains `tasks` table.

### P2-T003: Add .env.example with Neon & local examples
- **Description:** Add `backend/.env.example` showing Neon connection example and local Postgres example plus `BETTER_AUTH_SECRET` and `TESTING`.
- **Category:** config
- **Suggested Agent:** db-modeler / doc-writer
- **Dependencies:** P2-T001, P2-T002
- **Acceptance Criteria:**
  - `.env.example` present with clear examples and notes.

### P2-T004: DB privileges guide & helper verification
- **Description:** Add SQL snippet and `verify_schema_permissions()` helper in `database.py` to check schema ownership and create test table (used only for verification). Document required GRANT commands.
- **Category:** database
- **Suggested Agent:** db-modeler
- **Dependencies:** P2-T001
- **Acceptance Criteria:**
  - Helper exists.
  - SQL guide included in README/doc snippet.

---

## Stage B — Backend Core & Auth (backend-builder)

### P2-T005: Config & Settings (Pydantic)
- **Description:** Implement `backend/app/config.py` with Pydantic `Settings` reading `DATABASE_URL`, `BETTER_AUTH_SECRET`, `TESTING`, `INTEGRATION_TESTS`. Provide safe fallback for test mode only.
- **Category:** backend
- **Suggested Agent:** backend-builder
- **Dependencies:** P2-T001, P2-T003
- **Acceptance Criteria:**
  - `config.py` exists.
  - `Settings` validates.
  - Unit snippet demonstrates environment reading.

### P2-T006: JWT Auth dependency & security middleware
- **Description:** Create `backend/app/auth.py` that verifies HS256 JWT using `BETTER_AUTH_SECRET`, extracts `sub` or `user_id` claim, and provides `get_current_user_id` dependency raising 401/403 as appropriate.
- **Category:** backend
- **Suggested Agent:** backend-builder
- **Dependencies:** P2-T005
- **Acceptance Criteria:**
  - `auth.py` exists and a small test snippet shows decoding a sample JWT.
  - Appropriate exceptions returned for invalid token.

### P2-T007: Task services (business logic)
- **Description:** Implement `backend/app/services/task_service.py` with service functions: `create_task`, `list_tasks` (search/filter/sort), `get_task_by_id`, `update_task`, `delete_task`, `mark_complete` (includes recurrence logic), `mark_incomplete`. Ensure datetime normalization using `ensure_aware_utc` helper.
- **Category:** backend
- **Suggested Agent:** backend-builder
- **Dependencies:** P2-T002, P2-T006, P2-T005
- **Acceptance Criteria:**
  - Service functions exist.
  - Recurrence algorithm described in docstring.
  - Unit-testable function signatures.

### P2-T008: Routes & API handlers
- **Description:** Create `backend/app/routes/tasks.py` implementing routes under `/api/{user_id}/tasks` as per spec; add `backend/app/routes/system.py` with `/api/system/db-health`. Use auth dependency to enforce ownership.
- **Category:** backend
- **Suggested Agent:** backend-builder
- **Dependencies:** P2-T007, P2-T006
- **Acceptance Criteria:**
  - Endpoints exist and are importable.
  - Calling `GET /api/system/db-health` returns `{ "database_ok": true }` when DB reachable.

### P2-T009: DateTime utilities
- **Description:** Add `backend/app/utils/datetime_utils.py` with `ensure_aware_utc` and tests/examples.
- **Category:** backend
- **Suggested Agent:** backend-builder
- **Dependencies:** P2-T002, P2-T007
- **Acceptance Criteria:**
  - Function normalizes naive and aware datetimes to timezone-aware UTC.
  - Unit tests pass.

### P2-T010: Error handling & JSON error shape
- **Description:** Ensure consistent JSON error response `{ "detail": "message" }` across backend. Add exception handlers if needed.
- **Category:** backend
- **Suggested Agent:** backend-builder
- **Dependencies:** P2-T005, P2-T008
- **Acceptance Criteria:**
  - Server returns JSON errors for 400/401/403/404.
  - Examples included.

---

## Stage C — Frontend Integration & Better Auth (frontend-builder)

### P2-T011: API client & env config
- **Description:** Implement `frontend/lib/api.ts` that reads `NEXT_PUBLIC_API_BASE_URL` and attaches `Authorization: Bearer <token>` header. Provide dev fallback to `http://127.0.0.1:8001/api`.
- **Category:** frontend
- **Suggested Agent:** frontend-builder
- **Dependencies:** P2-T008, P2-T005
- **Acceptance Criteria:**
  - `api.ts` file exists with functions `getTasks`, `createTask`, `updateTask`, `deleteTask`, `completeTask`, `incompleteTask`.
  - Example usage shown.

### P2-T012: Task UI components & pages
- **Description:** Create Next.js pages/components: TaskList (app/page.tsx), TaskForm (create/edit), TaskItem, FilterBar, SortControls. Components call `lib/api`.
- **Category:** frontend
- **Suggested Agent:** frontend-builder
- **Dependencies:** P2-T011
- **Acceptance Criteria:**
  - Frontend runs (`npm run dev`).
  - TaskList fetches data and renders items.
  - Create form posts to API (example test uses local token storage).

### P2-T013: Better Auth integration doc + client token retrieval
- **Description:** Provide frontend CLAUDE.md guidance or sample code showing how to configure Better Auth to issue JWTs and how to retrieve/store token in client (for prod/cookies vs dev/localStorage demo). Add `frontend/.env.local.example`.
- **Category:** frontend / docs
- **Suggested Agent:** frontend-builder + doc-writer
- **Dependencies:** P2-T005, P2-T011
- **Acceptance Criteria:**
  - CLAUDE.md updated with Better Auth instructions.
  - Sample token retrieval code present.

### P2-T014: Frontend error & UX improvements
- **Description:** Improve UI error reporting (show backend JSON detail instead of generic "Failed to fetch") and add loading/empty states and overdue/soon-due styling.
- **Category:** frontend
- **Suggested Agent:** frontend-builder
- **Dependencies:** P2-T012, P2-T011
- **Acceptance Criteria:**
  - UI shows descriptive error messages.
  - Overdue tasks flagged red.
  - Soon-due flagged yellow.

---

## Stage D — Tests & Verification (test-writer)

### P2-T015: Unit tests for services & datetime utils
- **Description:** Add `backend/tests/test_task_service.py` and `backend/tests/test_datetime_utils.py` using `sqlite:///:memory:` to test core service logic including recurrence, normalization, create/list/update/delete.
- **Category:** testing
- **Suggested Agent:** test-writer
- **Dependencies:** P2-T007, P2-T009
- **Acceptance Criteria:**
  - Running `pytest backend/ -q` runs the new tests and they pass in CI-like environment.

### P2-T016: Auth tests (JWT)
- **Description:** Add tests that generate HS256 JWT using the `BETTER_AUTH_SECRET` from environment and verify the `get_current_user_id` dependency and route authorization (accepts correct user, rejects mismatch).
- **Category:** testing
- **Suggested Agent:** test-writer
- **Dependencies:** P2-T006, P2-T008
- **Acceptance Criteria:**
  - Auth tests pass.
  - Example token generation snippet present in tests.

### P2-T017: Integration smoke-test scripts & curl suite
- **Description:** Create `scripts/integration_smoke.sh` or windows equivalent listing curl commands for health, create, list, complete (with Authorization header). Guard integration by `INTEGRATION_TESTS=1`.
- **Category:** testing / integration
- **Suggested Agent:** test-writer + doc-writer
- **Dependencies:** P2-T008, P2-T011, P2-T012
- **Acceptance Criteria:**
  - Developer can run script to demonstrate end-to-end API behavior locally.

---

## Stage E — Docs, Examples & Submission Prep (doc-writer)

### P2-T018: README Phase II & runbook
- **Description:** Update top-level `README.md` and `backend/README.md` with Neon examples, local Postgres fallback, env var guidance, steps to run backend & frontend, sample curl commands, and test commands.
- **Category:** docs
- **Suggested Agent:** doc-writer
- **Dependencies:** All prior tasks (recommended at least P2-T008, P2-T011, P2-T015)
- **Acceptance Criteria:**
  - README includes exact commands to start backend, start frontend, run tests, and perform curl checks.

### P2-T019: CLAUDE.md updates for monorepo & Spec-Kit
- **Description:** Ensure `CLAUDE.md` files (root, backend, frontend) reference the new spec and include agent workflow instructions (`/sp.plan`, `/sp.tasks`, `/sp.clarify`, `/sp.implement`).
- **Category:** docs
- **Suggested Agent:** doc-writer
- **Dependencies:** P2-T018
- **Acceptance Criteria:**
  - CLAUDE.md files updated.
  - doc-writer lists verification checklist.

### P2-T020: Phase II submission package & demo script
- **Description:** Prepare final package (git tag/branch), a short 60–90s demo script listing steps to show judges, and fill submission form instructions.
- **Category:** docs / planning
- **Suggested Agent:** doc-writer / manual-architect
- **Dependencies:** P2-T018, P2-T012, P2-T015
- **Acceptance Criteria:**
  - Demo script and checklist created.
  - Repository ready for submission.

---

## Final Review & Cleanup (manual-architect)

### P2-T021: Security review & secret rotation checklist
- **Description:** Manual review ensuring `BETTER_AUTH_SECRET` not committed, `.env.example` only, recommend rotating secrets if leaked. Provide steps to rotate and update docs.
- **Category:** planning / security
- **Suggested Agent:** manual-architect
- **Dependencies:** P2-T003, P2-T018
- **Acceptance Criteria:**
  - Security checklist created and included in README.

### P2-T022: Acceptance verification & sign-off
- **Description:** Manual QA: run full checklist, record steps & outputs, confirm all acceptance criteria from spec are met and report back.
- **Category:** planning / integration
- **Suggested Agent:** manual-architect
- **Dependencies:** All tasks complete
- **Acceptance Criteria:**
  - QA sign-off document with logs/screenshots and branch/tag for submission.
