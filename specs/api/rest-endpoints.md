# REST API Endpoints Specification

**Phase:** II — Full-Stack Web App with Auth
**Base URL:** `http://127.0.0.1:8001/api`

---

## Authentication

All endpoints except `/api/system/*` require authentication.

**Header:** `Authorization: Bearer <JWT>`
**Algorithm:** HS256
**Secret:** `BETTER_AUTH_SECRET` environment variable

---

## Task Endpoints

### List Tasks
```
GET /api/{user_id}/tasks
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| search | string | Search in title/description |
| status | enum | `all`, `pending`, `completed` |
| priority | enum | `low`, `medium`, `high` |
| tag | string | Filter by tag |
| due_from | ISO8601 | Due date >= |
| due_to | ISO8601 | Due date <= |
| sort_by | enum | `due_date`, `priority`, `title`, `created_at` |
| sort_order | enum | `asc`, `desc` |

**Response:** `200 OK` — Array of Task objects

---

### Create Task
```
POST /api/{user_id}/tasks
```

**Request Body:**
```json
{
  "title": "string (required, 1-200 chars)",
  "description": "string (optional, max 1000)",
  "priority": "low|medium|high (default: medium)",
  "tags": ["array", "of", "strings"],
  "due_date": "ISO8601 datetime (optional)",
  "recurrence": "none|daily|weekly|monthly (default: none)"
}
```

**Response:** `201 Created` — Created Task object

---

### Get Task
```
GET /api/{user_id}/tasks/{id}
```

**Response:** `200 OK` — Task object
**Errors:** `404` Not Found, `403` Forbidden

---

### Update Task
```
PUT /api/{user_id}/tasks/{id}
```

**Request Body:** Same as Create Task
**Response:** `200 OK` — Updated Task object

---

### Delete Task
```
DELETE /api/{user_id}/tasks/{id}
```

**Response:** `204 No Content`

---

### Mark Complete
```
PATCH /api/{user_id}/tasks/{id}/complete
```

**Response:** `200 OK`
```json
{
  "task": { /* completed task */ },
  "next_task": { /* new recurring task or null */ }
}
```

---

### Mark Incomplete
```
PATCH /api/{user_id}/tasks/{id}/incomplete
```

**Response:** `200 OK` — Updated Task object

---

## System Endpoints

### Database Health Check
```
GET /api/system/db-health
```

**Auth:** Not required
**Response:** `200 OK`
```json
{
  "database_ok": true,
  "sample_time": "2025-01-15T10:30:00Z"
}
```

---

## Error Responses

All errors return JSON:
```json
{
  "detail": "Error message"
}
```

| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |
