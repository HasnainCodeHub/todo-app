from pydantic import BaseModel, EmailStr, validator
from datetime import datetime


# -------------------------------------------------
# USER SCHEMAS
# -------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    father_name: str
    phone_number: str

    @validator("phone_number")
    def validate_phone_number(cls, v):
        if not v.isdigit():
            raise ValueError("Phone number must contain only digits.")
        if not 10 <= len(v) <= 15:
            raise ValueError("Phone number must be between 10 and 15 digits.")
        return v


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone_number: str
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


class TaskStatusUpdate(BaseModel):
    """Schema for updating only the completion status of a task."""
    completed: bool


class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool
    priority: str
    created_at: datetime
    owner_id: int | None = None

    class Config:
        from_attributes = True
