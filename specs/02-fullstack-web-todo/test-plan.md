# Manual Test Plan - Full-Stack Todo Web App (Phase II)

## Overview
This document provides a comprehensive manual testing checklist for the Full-Stack Todo Web Application backend API. Use this to verify all functionality works as expected.

## Test Environment Setup

### Prerequisites
- Python 3.11+ installed
- Backend dependencies installed (`pip install -r requirements.txt`)
- Backend server running (`uvicorn app.main:app --reload`)

### Test Database
- Tests use SQLite in-memory database
- Each test gets a fresh database instance
- No data persistence between tests

---

## 1. API Health & Setup Tests

### 1.1 Root Endpoint
- [ ] GET `/` returns status "ok"
- [ ] Response includes app name and version

### 1.2 Health Check
- [ ] GET `/health` returns status "healthy"
- [ ] Response indicates database is connected

---

## 2. Task Creation Tests

### 2.1 Valid Task Creation
- [ ] POST `/api/tasks` with valid data returns 201
- [ ] Response includes generated `id`
- [ ] Response includes `created_at` and `updated_at` timestamps
- [ ] Title is stored correctly (whitespace trimmed)
- [ ] Description is optional and stored correctly
- [ ] Priority defaults to "medium" if not specified
- [ ] Tags default to empty array if not specified
- [ ] Completed defaults to `false`
- [ ] Recurrence defaults to "none" if not specified

### 2.2 Invalid Task Creation
- [ ] POST with empty title (`""`) returns 400/422 error
- [ ] POST with whitespace-only title (`"   "`) returns 400/422 error
- [ ] POST with invalid priority value returns 422 error
- [ ] POST with invalid recurrence value returns 422 error
- [ ] POST with title > 255 characters returns 422 error

### 2.3 Task Creation with All Fields
- [ ] Create task with title, description, priority, tags, due_date, recurrence
- [ ] All fields are stored correctly
- [ ] Due date is stored with timezone information
- [ ] Tags array is stored correctly

---

## 3. Task Retrieval Tests

### 3.1 List All Tasks
- [ ] GET `/api/tasks` on empty database returns empty array
- [ ] GET `/api/tasks` returns all tasks in order
- [ ] Default sort order is by `created_at` ascending

### 3.2 Get Single Task
- [ ] GET `/api/tasks/{id}` returns task with all fields
- [ ] GET `/api/tasks/{id}` with non-existent ID returns 404
- [ ] 404 response includes error message with task ID

---

## 4. Task Filtering Tests

### 4.1 Filter by Status
- [ ] GET `/api/tasks?status=pending` returns only incomplete tasks
- [ ] GET `/api/tasks?status=completed` returns only completed tasks
- [ ] Invalid status value returns 422 error

### 4.2 Filter by Priority
- [ ] GET `/api/tasks?priority=low` returns only low priority tasks
- [ ] GET `/api/tasks?priority=medium` returns only medium priority tasks
- [ ] GET `/api/tasks?priority=high` returns only high priority tasks
- [ ] Invalid priority value returns 422 error

### 4.3 Filter by Tag
- [ ] GET `/api/tasks?tag=work` returns tasks containing "work" tag
- [ ] Tasks with multiple tags are included if any match
- [ ] Tag filter is case-sensitive
- [ ] Non-existent tag returns empty array

### 4.4 Search by Keyword
- [ ] GET `/api/tasks?search=keyword` searches in title
- [ ] Search also searches in description
- [ ] Search is case-insensitive
- [ ] Partial matches are included
- [ ] No matches returns empty array

### 4.5 Combined Filters
- [ ] Multiple filters can be applied together
- [ ] Filters work with AND logic (all must match)

---

## 5. Task Sorting Tests

### 5.1 Sort by Title
- [ ] GET `/api/tasks?sort_by=title&sort_order=asc` sorts A-Z
- [ ] GET `/api/tasks?sort_by=title&sort_order=desc` sorts Z-A

### 5.2 Sort by Priority
- [ ] GET `/api/tasks?sort_by=priority&sort_order=asc` works
- [ ] GET `/api/tasks?sort_by=priority&sort_order=desc` works

### 5.3 Sort by Due Date
- [ ] GET `/api/tasks?sort_by=due_date&sort_order=asc` sorts earliest first
- [ ] GET `/api/tasks?sort_by=due_date&sort_order=desc` sorts latest first
- [ ] Tasks without due_date are handled correctly

### 5.4 Sort by Created Date
- [ ] GET `/api/tasks?sort_by=created_at&sort_order=asc` sorts oldest first
- [ ] GET `/api/tasks?sort_by=created_at&sort_order=desc` sorts newest first

### 5.5 Invalid Sort Parameters
- [ ] Invalid `sort_by` field returns 422 error
- [ ] Invalid `sort_order` value returns 422 error

---

## 6. Task Update Tests

### 6.1 Valid Updates
- [ ] PUT `/api/tasks/{id}` updates title
- [ ] PUT updates description
- [ ] PUT updates priority
- [ ] PUT updates tags (replaces entire array)
- [ ] PUT updates due_date
- [ ] PUT updates recurrence
- [ ] PUT updates completed status
- [ ] `updated_at` timestamp is updated
- [ ] `created_at` timestamp remains unchanged

### 6.2 Partial Updates
- [ ] PUT with only title updates only title
- [ ] Other fields remain unchanged
- [ ] Multiple fields can be updated together

### 6.3 Invalid Updates
- [ ] PUT with empty title returns 400 error
- [ ] PUT with invalid priority returns 422 error
- [ ] PUT with invalid recurrence returns 422 error
- [ ] PUT with non-existent task ID returns 404

---

## 7. Task Deletion Tests

### 7.1 Valid Deletion
- [ ] DELETE `/api/tasks/{id}` returns 204
- [ ] Task is removed from database
- [ ] Subsequent GET for same ID returns 404

### 7.2 Invalid Deletion
- [ ] DELETE with non-existent ID returns 404
- [ ] Error message includes task ID

---

## 8. Task Completion Tests

### 8.1 Mark Complete (Non-Recurring)
- [ ] PATCH `/api/tasks/{id}/complete` marks task as completed
- [ ] Response includes completed task
- [ ] `completed` field is `true`
- [ ] `next_task` is `null` for non-recurring tasks
- [ ] `updated_at` timestamp is updated

### 8.2 Mark Complete (Daily Recurrence)
- [ ] PATCH complete on daily recurring task creates next task
- [ ] Original task is marked completed
- [ ] `next_task` is returned in response
- [ ] Next task has same title, description, priority, tags
- [ ] Next task `due_date` is +1 day from original
- [ ] Next task has same recurrence pattern
- [ ] Next task is not completed
- [ ] Next task has new `id`

### 8.3 Mark Complete (Weekly Recurrence)
- [ ] Weekly recurring task creates next occurrence
- [ ] Next task `due_date` is +7 days from original

### 8.4 Mark Complete (Monthly Recurrence)
- [ ] Monthly recurring task creates next occurrence
- [ ] Next task `due_date` is +1 month from original
- [ ] Month-end dates are handled correctly (e.g., Jan 31 → Feb 28)

### 8.5 Mark Complete Errors
- [ ] PATCH complete with non-existent ID returns 404

---

## 9. Task Incomplete Tests

### 9.1 Mark Incomplete
- [ ] PATCH `/api/tasks/{id}/incomplete` marks task as incomplete
- [ ] `completed` field is `false`
- [ ] `updated_at` timestamp is updated
- [ ] Works on previously completed tasks

### 9.2 Mark Incomplete Errors
- [ ] PATCH incomplete with non-existent ID returns 404

---

## 10. Recurrence Logic Tests

### 10.1 Daily Recurrence
- [ ] Due date calculation adds exactly 1 day
- [ ] Timezone is preserved
- [ ] Works across month boundaries
- [ ] Works across year boundaries

### 10.2 Weekly Recurrence
- [ ] Due date calculation adds exactly 7 days
- [ ] Same day of week is maintained

### 10.3 Monthly Recurrence
- [ ] Due date calculation adds 1 calendar month
- [ ] Same day of month is maintained when possible
- [ ] Jan 31 → Feb 28/29 (month-end adjustment)
- [ ] Feb 29 → Mar 29 (leap year handling)

### 10.4 No Recurrence
- [ ] Tasks with `recurrence: "none"` don't create next task
- [ ] Completing non-recurring task only marks it complete

---

## 11. Edge Cases & Error Handling

### 11.1 Empty States
- [ ] Empty task list returns `[]`
- [ ] Filters with no matches return `[]`
- [ ] Search with no results returns `[]`

### 11.2 Boundary Values
- [ ] Title exactly 255 characters is accepted
- [ ] Title 256 characters is rejected
- [ ] Empty tags array is valid
- [ ] Large tags array is handled correctly

### 11.3 Timezone Handling
- [ ] Timestamps are stored in UTC
- [ ] Due dates maintain timezone information
- [ ] ISO 8601 datetime format is used

### 11.4 Concurrent Operations
- [ ] Multiple clients can create tasks simultaneously
- [ ] Updates don't conflict with concurrent reads
- [ ] Database session management works correctly

---

## 12. Data Validation Tests

### 12.1 Schema Validation
- [ ] Pydantic validates required fields
- [ ] Pydantic validates field types
- [ ] Pydantic validates pattern constraints
- [ ] Pydantic strips whitespace from title
- [ ] Pydantic filters empty tags

### 12.2 Business Logic Validation
- [ ] Service layer prevents empty titles
- [ ] Service layer validates recurrence patterns
- [ ] Service layer validates priority values

---

## Test Data Examples

### Sample Task (Minimal)
```json
{
  "title": "Buy groceries"
}
```

### Sample Task (Complete)
```json
{
  "title": "Weekly team meeting",
  "description": "Discuss project progress and blockers",
  "priority": "high",
  "tags": ["work", "meeting", "recurring"],
  "due_date": "2025-12-18T10:00:00Z",
  "recurrence": "weekly"
}
```

### Sample Update
```json
{
  "title": "Updated Title",
  "priority": "low",
  "completed": true
}
```

---

## Test Execution Checklist

### Before Testing
- [ ] Backend server is running
- [ ] Database is accessible
- [ ] Environment variables are set (if needed)

### During Testing
- [ ] Record any unexpected behavior
- [ ] Note performance issues
- [ ] Check response times
- [ ] Monitor server logs for errors

### After Testing
- [ ] All tests passed
- [ ] Issues documented
- [ ] Test coverage is adequate
- [ ] Edge cases are covered

---

## Automated Test Execution

### Run Unit Tests
```bash
cd backend
pytest tests/test_services.py -v
```

### Run API Integration Tests
```bash
cd backend
pytest tests/test_api.py -v
```

### Run All Tests
```bash
cd backend
pytest -v
```

### Run Tests with Coverage
```bash
cd backend
pytest --cov=app --cov-report=html
```

---

## Test Results Summary

| Category | Tests Passed | Tests Failed | Notes |
|----------|--------------|--------------|-------|
| Health & Setup | | | |
| Task Creation | | | |
| Task Retrieval | | | |
| Filtering | | | |
| Sorting | | | |
| Updates | | | |
| Deletion | | | |
| Completion | | | |
| Recurrence | | | |
| Edge Cases | | | |

**Overall Status:** [ ] PASS / [ ] FAIL

**Tested By:** _______________
**Date:** _______________
**Environment:** _______________

---

## Notes & Issues

Use this section to document any issues, unexpected behavior, or areas for improvement discovered during testing.

---

**End of Test Plan**
