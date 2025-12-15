from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, DateTime

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    password_hash: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    tasks: List["Task"] = Relationship(back_populates="owner")

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(nullable=False)
    completed: bool = Field(default=False)
    priority: str = Field(default="medium", nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    owner_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    owner: Optional[User] = Relationship(back_populates="tasks")
