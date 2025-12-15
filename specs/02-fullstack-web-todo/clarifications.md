# Phase II Pre-Implementation Clarifications
## Full-Stack Todo Web App (Next.js + FastAPI + SQLModel + Neon)

---

## Status: RESOLVED

All clarification questions have been analyzed and decisions have been made based on:
- Phase II Specification requirements
- Technical Plan architecture
- Industry best practices
- Practical implementation considerations
- User experience optimization

**This document is now ready for `/sp.implement` execution.**

---

## Final Decisions

### 1. Domain & Data Model

**Q1.1: Tags Input Format in Frontend**

| Decision | **B) Tag chips with individual add/remove buttons** |
|----------|-----------------------------------------------------|
| Rationale | Better UX - users can visually see each tag, easily remove specific tags, and avoid parsing errors. Modern UI pattern that users expect. Comma-separated input can be confusing with tags containing spaces. |

---

**Q1.2: Tag Validation Rules**

| Decision | **C + D) Lowercase only, auto-converted, max 50 characters per tag** |
|----------|----------------------------------------------------------------------|
| Rationale | Auto-lowercase prevents duplicate tags like "Work" and "work". Max 50 chars is reasonable for tag names. Trimming whitespace is implicit. This keeps tags consistent and prevents database bloat. |

---

**Q1.3: Title Maximum Length**

| Decision | **A) Enforce 255 character max with validation error** |
|----------|--------------------------------------------------------|
| Rationale | Explicit validation with clear error messages is better UX than silent truncation. 255 chars matches the database constraint and is sufficient for task titles. Frontend should show character count. |

---

### 2. Recurring Tasks Logic

**Q2.1: Time-of-Day Preservation**

| Decision | **A) Yes — preserve time-of-day from original due_date** |
|----------|----------------------------------------------------------|
| Rationale | If a user sets a task for 2:30 PM daily, they expect the next occurrence at 2:30 PM. All times stored in UTC; frontend handles display conversion. This is the most intuitive behavior for recurring reminders. |

---

**Q2.2: Recurring Task Without Due Date**

| Decision | **C) Set due_date to "now + interval" if original had no due_date** |
|----------|---------------------------------------------------------------------|
| Rationale | Recurring tasks without dates are semantically odd. If a task recurs daily but has no due date, the new instance should be due "now + 1 day". This gives the recurrence pattern meaning and enables due date sorting/filtering to work properly. |

---

**Q2.3: Completing Already-Completed Task**

| Decision | **A) Return 200 OK with same task (idempotent, no new recurring task)** |
|----------|-------------------------------------------------------------------------|
| Rationale | Idempotency is a REST best practice. Completing an already-completed task should be a no-op. This prevents accidental duplicate recurring task creation from double-clicks or retry logic. The response includes `next_task: null` to indicate no new task was created. |

---

### 3. Backend API Semantics

**Q3.1: Default Sort When None Specified**

| Decision | **A) `created_at DESC` (newest first)** |
|----------|----------------------------------------|
| Rationale | Newest tasks first is intuitive for a task list - users typically want to see what they just added. This matches the plan specification and is consistent behavior when no explicit sort is requested. |

---

**Q3.2: Null Due Dates in Sort**

| Decision | **A) At the end (after all dated tasks)** |
|----------|-------------------------------------------|
| Rationale | Tasks with due dates are more time-sensitive and should appear first. Tasks without due dates are "someday" items. PostgreSQL `NULLS LAST` clause handles this cleanly. This is the expected behavior in most todo applications. |

---

**Q3.3: POST Response Body**

| Decision | **A) Return full task object with all fields** |
|----------|------------------------------------------------|
| Rationale | Returning the full object eliminates the need for a follow-up GET request. Frontend immediately has access to `id`, `created_at`, and all computed/default values. This is standard REST practice and reduces network round-trips. |

---

**Q3.4: PATCH /complete Response for Non-Recurring Tasks**

| Decision | **A) Same format: `{ "task": {...}, "next_task": null }`** |
|----------|-----------------------------------------------------------|
| Rationale | Consistent response structure simplifies frontend code. TypeScript can use a single `TaskCompleteResponse` type. The frontend doesn't need to check task type before handling the response. `next_task: null` explicitly indicates no new task was created. |

---

### 4. Frontend UX & Behavior

**Q4.1: Due Date Display Format**

| Decision | **D) Both relative and absolute** |
|----------|-----------------------------------|
| Rationale | Show relative time as primary ("Tomorrow", "In 3 days") with absolute date on hover or as secondary text. This gives users quick context while allowing precise date viewing when needed. Best of both worlds for task management UX. |

---

**Q4.2: "Due Soon" Window Definition**

| Decision | **A) Exactly 24 hours from current time** |
|----------|-------------------------------------------|
| Rationale | Simple, predictable logic that's easy to implement and test. The spec explicitly says "within next 24 hours." Keeps implementation straightforward without complex timezone/day-boundary calculations. |

---

**Q4.3: Delete Confirmation UI**

| Decision | **B) Custom modal component (better UX)** |
|----------|-------------------------------------------|
| Rationale | A styled modal matches the application's design language. Browser `confirm()` looks outdated and cannot be styled. The modal can include the task title for clarity: "Delete 'Buy groceries'?" This provides a professional user experience. |

---

**Q4.4: Create/Edit Form Navigation**

| Decision | **A) Separate pages only (as specified)** |
|----------|-------------------------------------------|
| Rationale | Matches the plan specification. Separate pages provide clear URLs (`/tasks/new`, `/tasks/[id]/edit`) for bookmarking and navigation. Modal-based quick-add can be added in future phases if needed. Keeps Phase II scope focused. |

---

### 5. Filtering / Sorting / Search Details

**Q5.1: Search Minimum Characters**

| Decision | **B) Minimum 2 characters before searching** |
|----------|---------------------------------------------|
| Rationale | Single-character searches return too many results and are rarely useful. 2-character minimum balances usability (users can search "do" for "done") with performance. Prevents unnecessary API calls on first keystroke. Debouncing should also be applied (300ms). |

---

**Q5.2: Tag Filter Source**

| Decision | **A) Distinct tags from all tasks (client-side extraction)** |
|----------|--------------------------------------------------------------|
| Rationale | Extract unique tags from the loaded task list on the client side. No additional API endpoint needed for Phase II. The dropdown dynamically reflects actual tags in use. Simple and effective for a single-user application. |

---

**Q5.3: Due Date Range Filter — Inclusive or Exclusive?**

| Decision | **A) Inclusive on both ends** |
|----------|-------------------------------|
| Rationale | `due_date >= due_from AND due_date <= due_to` is intuitive for users. If someone filters "Jan 1 to Jan 7", they expect to see tasks due on both Jan 1 and Jan 7. Inclusive bounds are standard for date range filters. |

---

**Q5.4: Priority Sort Order**

| Decision | **A) Yes — ascending shows HIGH first (high=1 is smallest)** |
|----------|--------------------------------------------------------------|
| Rationale | Numeric sort where high=1, medium=2, low=3 means ascending order naturally puts HIGH priority first. This is semantically correct: "ascending priority" = "most important first". The UI label can say "Priority (High to Low)" for clarity. |

---

### 6. Environment & Configuration

**Q6.1: Default Ports**

| Decision | **B) Configurable via env var, defaults 8000/3000** |
|----------|-----------------------------------------------------|
| Rationale | Flexibility for different development environments. Backend uses `BACKEND_PORT` env var (default 8000), frontend uses Next.js default port configuration. Documented in README. Allows running multiple instances if needed. |

---

**Q6.2: CORS Configuration**

| Decision | **B) Allow `localhost:3000` and `127.0.0.1:3000`** |
|----------|---------------------------------------------------|
| Rationale | Both localhost forms may be used depending on how the frontend is accessed. Wildcard (`*`) is too permissive even for development. Explicit allowed origins list is a security best practice. Can be extended via env var for production deployment. |

---

**Q6.3: Timezone Handling**

| Decision | **A) Always UTC in API, frontend converts for display** |
|----------|--------------------------------------------------------|
| Rationale | UTC storage is the industry standard for timestamps. Eliminates timezone ambiguity in the database. Frontend uses browser's local timezone for display via JavaScript Date API. ISO 8601 format (`2024-01-15T14:30:00Z`) in all API responses. |

---

### 7. Agent Delegation & Boundaries

**Q7.1: Config Module Assignment**

| Decision | **A) `db-modeler` implements `config.py`** |
|----------|-------------------------------------------|
| Rationale | Follow the task breakdown (P2-T07) which explicitly assigns config.py to db-modeler. Config contains DATABASE_URL which is database-related. The db-modeler agent executes first, so config is available when backend-builder runs. |

---

**Q7.2: Schemas Assignment**

| Decision | **A) `backend-builder` owns schemas** |
|----------|---------------------------------------|
| Rationale | Schemas (Pydantic models for API request/response) are API-layer concerns, not database concerns. SQLModel models (db-modeler) define database structure; schemas (backend-builder) define API contracts. This separation of concerns is correct. |

---

**Q7.3: Manual-Architect Tasks**

| Decision | **B) Agents can assist with P2-T01; P2-T66–69 are human review** |
|----------|------------------------------------------------------------------|
| Rationale | Directory structure creation (P2-T01) is mechanical and agents can safely execute it. Final review tasks (P2-T66–69) require human judgment for acceptance testing and deployment decisions. This balances automation with human oversight. |

---

**Q7.4: Test-Writer Scope**

| Decision | **A) SQLite for tests (faster, no external dependency)** |
|----------|----------------------------------------------------------|
| Rationale | SQLite in-memory is fast, requires no network, and SQLModel/SQLAlchemy abstracts database differences. Unit tests should be quick and isolated. Phase II doesn't have Postgres-specific features that would require Neon for testing. Integration tests with Neon can be added in later phases. |

---

---

## Decision Summary Table

All 21 clarification questions have been resolved. Here is the complete summary:

### Domain & Data Model

| Question | Final Decision |
|----------|----------------|
| Q1.1 Tags Input | **B)** Tag chips with add/remove buttons |
| Q1.2 Tag Validation | **C+D)** Lowercase auto-convert, max 50 chars |
| Q1.3 Title Max Length | **A)** Enforce 255 char max with validation error |

### Recurring Tasks Logic

| Question | Final Decision |
|----------|----------------|
| Q2.1 Time Preservation | **A)** Yes — preserve time-of-day |
| Q2.2 Recurring Without Due Date | **C)** Set due_date to "now + interval" |
| Q2.3 Already Completed | **A)** Return 200 OK (idempotent) |

### Backend API Semantics

| Question | Final Decision |
|----------|----------------|
| Q3.1 Default Sort | **A)** `created_at DESC` |
| Q3.2 Null Due Dates | **A)** At the end |
| Q3.3 POST Response | **A)** Full task object |
| Q3.4 PATCH Response | **A)** Same format `{ task, next_task }` |

### Frontend UX & Behavior

| Question | Final Decision |
|----------|----------------|
| Q4.1 Date Display | **D)** Both relative and absolute |
| Q4.2 Due Soon Window | **A)** Exactly 24 hours |
| Q4.3 Delete Confirmation | **B)** Custom modal |
| Q4.4 Form Navigation | **A)** Separate pages only |

### Filtering / Sorting / Search

| Question | Final Decision |
|----------|----------------|
| Q5.1 Search Minimum | **B)** Minimum 2 characters |
| Q5.2 Tag Filter Source | **A)** Client-side extraction |
| Q5.3 Date Range Bounds | **A)** Inclusive both ends |
| Q5.4 Priority Sort | **A)** Ascending = HIGH first |

### Environment & Configuration

| Question | Final Decision |
|----------|----------------|
| Q6.1 Ports | **B)** Configurable, defaults 8000/3000 |
| Q6.2 CORS | **B)** localhost:3000 and 127.0.0.1:3000 |
| Q6.3 Timezone | **A)** Always UTC in API |

### Agent Delegation

| Question | Final Decision |
|----------|----------------|
| Q7.1 Config Module | **A)** `db-modeler` |
| Q7.2 Schemas | **A)** `backend-builder` |
| Q7.3 Manual Tasks | **B)** Agents assist P2-T01; human reviews P2-T66–69 |
| Q7.4 Test Database | **A)** SQLite for tests |

---

## Implementation Ready

This document is now **RESOLVED** and ready for `/sp.implement` execution.

Agents will execute tasks following:

1. **Phase II Specification** — what to build
2. **Phase II Technical Plan** — how to build it
3. **Phase II Task Breakdown** — discrete implementation units
4. **These Final Decisions** — explicit resolutions for all ambiguities

Agents will NOT:
- Add Phase III-V features
- Make architectural decisions beyond their scope
- Deviate from the spec, plan, or task breakdown

---

**End of Pre-Implementation Clarifications — All Questions Resolved**
