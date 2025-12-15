from pydantic import BaseModel, EmailStr
from datetime import datetime


# -------------------------------------------------
# USER SCHEMAS
# -------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------------------------------
# AUTH SCHEMAS
# -------------------------------------------------

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# -------------------------------------------------
# TASK SCHEMAS (for tasks.py imports)
# -------------------------------------------------

class TaskCreate(BaseModel):
    title: str
    priority: str = "medium"


class TaskUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None
    priority: str | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool
    priority: str
    created_at: datetime
    owner_id: int | None = None

    class Config:
        from_attributes = True
