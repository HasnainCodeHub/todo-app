"""Task service layer for business logic for the simplified Task model."""

import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models import Task
from app.schemas import TaskCreate, TaskUpdate
from app.exceptions import TaskNotFoundError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_task(session: AsyncSession, task_data: TaskCreate, user_id: int) -> Task:
    """Create a new task for a specific user."""
    task = Task(
        owner_id=user_id,
        title=task_data.title.strip(),
        completed=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    session.add(task)
    await session.flush()
    await session.refresh(task)
    logger.info(f"Created task {task.id} for user {user_id}")
    return task


async def get_tasks(
    session: AsyncSession,
    user_id: int,
    status: Optional[str] = None
) -> list[Task]:
    """Get all tasks for a specific user with optional status filtering."""
    query = select(Task).where(Task.owner_id == user_id)

    if status == "completed":
        query = query.where(Task.completed == True)
    elif status == "pending":
        query = query.where(Task.completed == False)

    query = query.order_by(Task.created_at.desc())
    result = await session.execute(query)
    tasks = result.scalars().all()
    return list(tasks)


async def get_task_by_id(session: AsyncSession, task_id: int, user_id: int) -> Task:
    """Get a single task by ID, ensuring ownership."""
    query = select(Task).where(and_(Task.id == task_id, Task.owner_id == user_id))
    result = await session.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise TaskNotFoundError(task_id)
    return task


async def update_task(session: AsyncSession, task_id: int, task_data: TaskUpdate, user_id: int) -> Task:
    """Update an existing task, ensuring ownership."""
    task = await get_task_by_id(session, task_id, user_id)

    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    task.updated_at = datetime.now(timezone.utc)
    await session.flush()
    await session.refresh(task)
    logger.info(f"Updated task {task_id} for user {user_id}")
    return task


async def delete_task(session: AsyncSession, task_id: int, user_id: int) -> None:
    """Delete a task, ensuring ownership."""
    task = await get_task_by_id(session, task_id, user_id)
    await session.delete(task)
    await session.flush()
    logger.info(f"Deleted task {task_id} for user {user_id}")
