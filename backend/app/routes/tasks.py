"""Task API routes, secured by JWT."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.schemas import TaskCreate, TaskUpdate, TaskResponse
from app.services import task_service
from app.exceptions import TaskNotFoundError
from app.auth import get_current_user_id

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
async def get_tasks(
    user_id: int = Depends(get_current_user_id),
    status: Optional[str] = Query(None, pattern="^(completed|pending)$"),
    session: AsyncSession = Depends(get_session)
):
    """Get all tasks for the authenticated user."""
    tasks = await task_service.get_tasks(session, user_id, status)
    return tasks


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Create a new task for the authenticated user."""
    task = await task_service.create_task(session, task_data, user_id)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int = Path(..., description="Task ID"),
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Get a single task by ID."""
    try:
        task = await task_service.get_task_by_id(session, task_id, user_id)
        return task
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_data: TaskUpdate,
    task_id: int = Path(..., description="Task ID"),
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Update an existing task."""
    try:
        task = await task_service.update_task(session, task_id, task_data, user_id)
        return task
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: int = Path(..., description="Task ID"),
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Delete a task."""
    try:
        await task_service.delete_task(session, task_id, user_id)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)

