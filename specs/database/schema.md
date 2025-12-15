# Database Schema Specification

**Phase:** II — Full-Stack Web App with Auth
**Database:** PostgreSQL (Neon Serverless or Local)

---

## Tasks Table

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' NOT NULL,
    tags JSON DEFAULT '[]'::json NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    recurrence VARCHAR(20) DEFAULT 'none' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

---

## Column Specifications

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | SERIAL | PRIMARY KEY | auto | Auto-increment |
| user_id | VARCHAR(255) | NOT NULL, INDEX | - | Better Auth user ID |
| title | VARCHAR(200) | NOT NULL | - | Task title |
| description | VARCHAR(1000) | NULLABLE | NULL | Optional description |
| completed | BOOLEAN | NOT NULL | FALSE | Completion status |
| priority | VARCHAR(20) | NOT NULL | 'medium' | low/medium/high |
| tags | JSON | NOT NULL | '[]' | Array of strings |
| due_date | TIMESTAMPTZ | NULLABLE | NULL | Timezone-aware |
| recurrence | VARCHAR(20) | NOT NULL | 'none' | none/daily/weekly/monthly |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | Last update timestamp |

---

## SQLModel Definition

```python
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON, DateTime

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: str = Field(default="medium")
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    due_date: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )
    recurrence: str = Field(default="none")
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
```

---

## Enum Constraints

### Priority
- `low`
- `medium` (default)
- `high`

### Recurrence
- `none` (default)
- `daily`
- `weekly`
- `monthly`

---

## Migration Notes

### From Phase I (no user_id)
```sql
-- Add user_id column
ALTER TABLE tasks ADD COLUMN user_id VARCHAR(255);

-- Set default for existing rows (if any)
UPDATE tasks SET user_id = 'legacy_user' WHERE user_id IS NULL;

-- Make NOT NULL
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;

-- Add index
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

### Timezone Migration
```sql
-- Convert naive timestamps to timezone-aware
ALTER TABLE tasks
    ALTER COLUMN due_date TYPE TIMESTAMP WITH TIME ZONE
    USING (due_date AT TIME ZONE 'UTC');

ALTER TABLE tasks
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE
    USING (created_at AT TIME ZONE 'UTC');

ALTER TABLE tasks
    ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE
    USING (updated_at AT TIME ZONE 'UTC');
```

---

## Connection Strings

### Neon (Production)
```
DATABASE_URL=postgresql://user:pass@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Local Development
```
DATABASE_URL=postgresql://todo_user:password@localhost:5432/todo_app
```

### Async Driver
The application converts `postgresql://` to `postgresql+asyncpg://` automatically.
