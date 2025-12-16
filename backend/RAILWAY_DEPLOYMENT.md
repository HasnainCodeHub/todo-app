# Railway.com Deployment Guide for Todo API Backend

This guide walks you through deploying the Todo API backend to Railway.com.

## Prerequisites

- Railway.com account (free tier available)
- GitHub repository with the code pushed
- PostgreSQL database (Railway can provision one automatically)

## Deployment Steps

### 1. Create Railway Account and Project

1. Go to [Railway.app](https://railway.app)
2. Sign up or log in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"

### 2. Connect GitHub Repository

1. Authorize Railway to access your GitHub account
2. Select your repository (`todo-app`)
3. Click "Deploy"

Railway will automatically:
- Detect the Python application using `requirements.txt`
- Read the `Procfile` for startup instructions
- Build and deploy the application

### 3. Configure Environment Variables

In Railway Dashboard:

1. Navigate to your project
2. Go to **Variables** tab
3. Add the following environment variables:

#### Required Variables

**DATABASE_URL** - PostgreSQL connection string
```
postgresql://username:password@host:port/database
```

To use Railway's built-in PostgreSQL plugin:
1. Click **+ Add** in the Variables section
2. Click **"Add a new service"**
3. Select **PostgreSQL** from the marketplace
4. Railway will automatically create `DATABASE_URL` environment variable

**BETTER_AUTH_SECRET** - JWT secret key for authentication
```
# Generate a secure 256-bit key (one-time setup):
# openssl rand -base64 32

# Example (DO NOT use this - generate your own!):
abc123def456ghi789jkl012mnopqrst+/==
```

#### Optional Variables

```
APP_NAME=Todo API
DEBUG=False
TESTING=0
INTEGRATION_TESTS=0
```

### 4. Set Port Configuration

Railway automatically handles port binding through the `$PORT` environment variable. The Procfile already configures this:

```
web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 5. Database Setup

The backend automatically creates tables on startup through the lifespan event:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()  # Runs once on startup
    yield
    await close_db()
```

If you need to run migrations manually:
```bash
# SSH into Railway container and run:
python -c "from app.database import create_tables; import asyncio; asyncio.run(create_tables())"
```

## Health Check

Railway automatically health checks your application using the `/health` endpoint:

- **Endpoint**: `GET /health`
- **Response**: `{"status": "ok", "database": "connected"}`

The Dockerfile includes a health check that validates the application is responding correctly.

## Viewing Logs

In Railway Dashboard:

1. Select your deployed application
2. Go to **Logs** tab
3. View real-time logs and deployment history

## Troubleshooting

### Build Fails

**Issue**: "Python version not found"
- **Solution**: Ensure `pyproject.toml` specifies `requires-python = ">=3.13"`

**Issue**: "Module not found" errors
- **Solution**: Verify `requirements.txt` is in the `backend/` directory and all dependencies are listed

### Application Crashes

**Issue**: "DATABASE_URL is required"
- **Solution**: Ensure `DATABASE_URL` environment variable is set in Railway Variables

**Issue**: Connection timeout
- **Solution**:
  - Check PostgreSQL is running and accessible
  - Verify connection string format: `postgresql://user:pass@host:port/db`
  - For special characters in password, URL-encode them (e.g., `@` → `%40`)

**Issue**: "BETTER_AUTH_SECRET is required"
- **Solution**: Generate and set the secret key in Railway Variables

### Port Binding Issues

**Issue**: "Address already in use"
- **Solution**: Railway uses `$PORT` environment variable automatically. The Procfile correctly passes this to uvicorn.

## Scaling and Performance

### Recommended Configuration for Production

In Railway Variables:
```
WORKERS=4              # Number of uvicorn workers
```

Update the Procfile to use workers:
```
web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4
```

### Database Connection Pooling

Current setup uses asyncpg with default connection pooling. For high traffic:

```
# Add to .env or Railway Variables:
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
```

Then update `app/database.py` to use these values.

## CORS Configuration

The backend CORS settings currently only allow localhost:3000. For production:

Update `backend/app/main.py`:

```python
CORS_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```

## Deployment Updates

To deploy new changes:

1. Push code to GitHub
2. Railway automatically re-deploys on push (if webhook enabled)
3. Or manually trigger deploy in Railway Dashboard

## Cost Estimation

Railway Free Tier includes:
- 500 compute hours/month
- 5 GB database storage
- Shared PostgreSQL instance

For production workloads, consider upgrading to paid plans.

## Related Resources

- [Railway Documentation](https://docs.railway.app)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Uvicorn Configuration](https://www.uvicorn.org/settings/)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)
