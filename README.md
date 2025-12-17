# The Evolution of Todo

A multi-phase project demonstrating the evolution of a Todo application from a simple CLI to a full-stack web application with authentication.

## Project Overview

| Phase | Description | Status |
|-------|-------------|--------|
| Phase I | In-Memory Python Console App | ✅ Complete |
| Phase II | Full-Stack Web App with Auth (Next.js + FastAPI + PostgreSQL) | ✅ Complete |
| Phase III | AI/Chatbot Integration | 🔜 Planned |
| Phase IV | Containerization (Docker/K8s) | 🔜 Planned |
| Phase V | Event-Driven Architecture | 🔜 Planned |

---

## Phase II: Full-Stack Web Todo Application with Authentication

A modern, secure, multi-user Todo application with JWT authentication and persistent storage.

### Features

- **Authentication**: JWT-based auth with Better Auth integration
- **Multi-User**: User-scoped tasks with ownership enforcement
- **Core CRUD**: Add, view, update, delete, complete/incomplete tasks
- **Priorities**: Low, Medium, High with color-coded badges
- **Tags**: Multiple tags per task with filtering
- **Search**: Real-time keyword search across title and description
- **Filtering**: By status, priority, tag, due date range
- **Sorting**: By due date, priority, title, created time
- **Recurring Tasks**: Daily, weekly, monthly auto-generation
- **Due Date Indicators**: Visual alerts for overdue and due-soon tasks
- **Persistence**: PostgreSQL database (Neon Serverless or local)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP/JSON
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                          │
│              (Better Auth + App Router)                      │
│              http://localhost:3000                           │
└─────────────────────────────┬───────────────────────────────┘
                              │ REST API + JWT
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                           │
│              (Python 3.13+, JWT Auth)                        │
│              http://127.0.0.1:8001                           │
└─────────────────────────────┬───────────────────────────────┘
                              │ SQLModel + asyncpg
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               POSTGRESQL (Neon or Local)                     │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.13+, SQLModel |
| Auth | Better Auth + JWT (HS256) |
| Database | PostgreSQL (Neon Serverless or local) |

### Prerequisites

- **Python 3.13+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL** (Local or [Neon Cloud](https://neon.tech))

### Quick Start

#### 1. Clone and Setup Database

```bash
# Clone repository
git clone <repo-url>
cd todo-app
```

**Option A: Local PostgreSQL**
```sql
-- Create database and user (run in psql as superuser)
CREATE USER todo_user WITH PASSWORD 'your_password';
CREATE DATABASE todo_app OWNER todo_user;
GRANT ALL PRIVILEGES ON DATABASE todo_app TO todo_user;

-- Connect to todo_app database and grant schema permissions
\c todo_app
GRANT ALL PRIVILEGES ON SCHEMA public TO todo_user;
```

**Option B: Neon Cloud**
- Create account at https://neon.tech
- Create new project and copy connection string

#### 2. Start Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\Activate.ps1

# Activate (Linux/macOS)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

Edit `backend/.env`:
```bash
# Local PostgreSQL (special chars URL-encoded: @ = %40)
DATABASE_URL=postgresql://todo_user:your_password@localhost:5432/todo_app

# JWT Secret (REQUIRED - generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-256-bit-secret-key-here

# Optional
DEBUG=True
```

**Start server:**
```bash
uvicorn app.main:app --reload --port 8001
```

API available at: http://127.0.0.1:8001
API docs at: http://127.0.0.1:8001/docs

#### 3. Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local

# Start development server
npm run dev
```

App available at: http://localhost:3000

#### 4. Development Authentication Setup

For local development without Better Auth, generate a test token:

```bash
cd backend

# Generate test JWT token
python -c "from app.auth import create_test_token; print(create_test_token('demo_user'))"
```

Then in browser console:
```javascript
localStorage.setItem('auth_token', '<token-from-above>');
localStorage.setItem('user_id', 'demo_user');
// Refresh the page
```

---

## Railway Deployment (One-Click Deploy)

Deploy both backend and frontend as separate Railway services.

### Backend Deployment

1. **Create New Project on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `backend` folder as root directory

2. **Add PostgreSQL Database**
   - In your project, click "New" → "Database" → "PostgreSQL"
   - Railway auto-creates `DATABASE_URL` variable

3. **Set Environment Variables**
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | (auto-set by PostgreSQL plugin) |
   | `BETTER_AUTH_SECRET` | Generate: `openssl rand -base64 32` |
   | `CORS_ORIGINS` | `https://your-frontend.up.railway.app,http://localhost:3000` |

4. **Deploy**
   - Railway auto-detects Dockerfile and deploys
   - Check logs for successful startup

### Frontend Deployment

1. **Create New Service**
   - In same project, click "New" → "Deploy from GitHub repo"
   - Select `frontend` folder as root directory

2. **Set Environment Variables**
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend.up.railway.app/api` |

3. **Deploy**
   - Railway auto-detects Next.js and deploys

### Post-Deployment

1. **Update Backend CORS**
   - Add your frontend Railway URL to `CORS_ORIGINS`

2. **Verify Health**
   ```bash
   curl https://your-backend.up.railway.app/health
   ```

3. **Test Frontend**
   - Visit your frontend URL
   - Register a new account or login

---

### Project Structure

```
todo-app/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # App entry, CORS, routes
│   │   ├── config.py          # Environment config
│   │   ├── database.py        # Async DB connection
│   │   ├── models.py          # SQLModel Task model
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── auth.py            # JWT authentication
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API endpoints
│   │   └── utils/             # Datetime utilities
│   ├── tests/                 # Pytest tests
│   ├── requirements.txt
│   └── README.md
├── frontend/                   # Next.js frontend
│   ├── app/                   # Pages (App Router)
│   ├── components/            # React components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # API client, auth, types
│   └── package.json
├── scripts/                   # Integration scripts
│   ├── integration_smoke.sh   # Linux/macOS
│   └── integration_smoke.ps1  # Windows
├── specs/                     # Specifications
└── README.md                  # This file
```

### API Endpoints

All task endpoints require JWT authentication and follow the pattern `/api/tasks`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tasks` | List tasks (filters, sort) | Required |
| GET | `/api/tasks/{id}` | Get single task | Required |
| POST | `/api/tasks` | Create task | Required |
| PUT | `/api/tasks/{id}` | Update task | Required |
| DELETE | `/api/tasks/{id}` | Delete task | Required |
| GET | `/api/system/db-health` | Database health check | **None** |
| GET | `/health` | Application health check | **None** |

### Example API Requests

```bash
# Set your token
TOKEN="<your-jwt-token>"
USER_ID="demo_user"

# Health check (no auth)
curl http://127.0.0.1:8001/api/system/db-health

# List tasks
curl http://127.0.0.1:8001/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Create task
curl -X POST http://127.0.0.1:8001/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "priority": "high"}'

# Mark complete
curl -X PUT http://127.0.0.1:8001/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Running Tests

```bash
cd backend

# Run all tests (uses SQLite in-memory, no real DB needed)
pytest

# Run with verbose output
pytest -v

# Run specific test files
pytest tests/test_auth.py -v
pytest tests/test_api_phase2.py -v
```

### Integration Smoke Test

```bash
# Start backend first, then run:

# Windows PowerShell
.\scripts\integration_smoke.ps1

# Linux/macOS
./scripts/integration_smoke.sh
```

### Environment Variables

**Backend (`backend/.env`):**
```bash
# Database (required)
DATABASE_URL=postgresql://todo_user:password@localhost:5432/todo_app

# JWT Secret (required)
BETTER_AUTH_SECRET=your-256-bit-secret-key

# Optional
APP_NAME=Todo API
DEBUG=True
TESTING=0
```

**Frontend (`frontend/.env.local`):**
```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api
```

### Verification Checklist

```bash
# 1. Start backend
cd backend && uvicorn app.main:app --reload --port 8001

# 2. Check database health
curl http://127.0.0.1:8001/api/system/db-health

# 3. Generate test token
python -c "from app.auth import create_test_token; print(create_test_token('demo_user'))"

# 4. Test authenticated endpoint
curl http://127.0.0.1:8001/api/tasks \
  -H "Authorization: Bearer <token>"

# 5. Run tests
pytest -v

# 6. Start frontend
cd frontend && npm run dev
```

### Troubleshooting

**"permission denied for schema public" error:**
```sql
GRANT ALL PRIVILEGES ON SCHEMA public TO todo_user;
```

**"401 Unauthorized" error:**
- Ensure token is valid and not expired
- Check BETTER_AUTH_SECRET matches in frontend and backend

**"403 Forbidden" error:**
- user_id in URL must match user_id in JWT token

**Tables not created:**
- Check DATABASE_URL in `.env`
- Run startup to trigger migration

---

## Security Checklist

- [ ] Never commit `.env` files (secrets)
- [ ] Only commit `.env.example` with placeholder values
- [ ] Rotate BETTER_AUTH_SECRET if exposed
- [ ] Use HTTPS in production
- [ ] Tighten CORS origins for production

---

## Phase I: In-Memory Python Console Application

A simple command-line Todo application with in-memory storage.

### Running Phase I

```bash
python -m src.main
```

---

## License

Private project - Hackathon submission
