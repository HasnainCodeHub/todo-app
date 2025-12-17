"""FastAPI application entry point"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_tables, close_db, check_db_connection

from app.routes.auth import router as auth_router
from app.routes.tasks import router as tasks_router
from app.routes.system import router as system_router
from app.routes.users import router as users_router


# -------------------------------------------------
# CORS (configured via CORS_ORIGINS env variable)
# -------------------------------------------------
cors_origins = settings.cors_origins_list
print(f"CORS Origins configured: {cors_origins}")


# -------------------------------------------------
# Lifespan
# -------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.APP_NAME}...")
    print(f"CORS Origins: {cors_origins}")
    try:
        await create_tables()
        print("Database ready")
    except Exception as e:
        print(f"DB warning: {e}")

    yield

    print("Shutting down...")
    await close_db()


# -------------------------------------------------
# CREATE APP (⚠️ MUST COME BEFORE include_router)
# -------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    lifespan=lifespan,
)


# -------------------------------------------------
# Middleware
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


# -------------------------------------------------
# ROUTES (✅ NOW app EXISTS)
# -------------------------------------------------
app.include_router(auth_router, prefix="/api/auth")
app.include_router(tasks_router)
app.include_router(system_router)
app.include_router(users_router, prefix="/api")



# -------------------------------------------------
# Root
# -------------------------------------------------
@app.get("/")
async def root():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return await check_db_connection()
