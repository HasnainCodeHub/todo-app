"""Unit tests for the simplified task service layer."""

import pytest
from datetime import datetime, timezone

from app.models import Task
from app.schemas import TaskCreate, TaskUpdate
from app.services.task_service import (
    create_task,
    get_tasks,
    get_task_by_id,
    update_task,
    delete_task,
    update_task_status,
)
from app.exceptions import TaskNotFoundError

# Test user IDs for all service tests (must be integers for owner_id)
TEST_USER_ID = 123
OTHER_USER_ID = 456


@pytest.mark.asyncio
async def test_create_task_valid(test_session):
    """Test creating a task with a valid title."""
    task_data = TaskCreate(title="Buy groceries")
    task = await create_task(test_session, task_data, user_id=TEST_USER_ID)

    assert task.id is not None
    assert task.title == "Buy groceries"
    assert task.completed is False
    assert task.owner_id == TEST_USER_ID


@pytest.mark.asyncio
async def test_get_tasks_all_for_user(test_session):
    """Test getting all tasks for a specific user."""
    await create_task(test_session, TaskCreate(title="My Task 1"), user_id=TEST_USER_ID)
    await create_task(test_session, TaskCreate(title="My Task 2"), user_id=TEST_USER_ID)
    await create_task(test_session, TaskCreate(title="Other User Task"), user_id=OTHER_USER_ID)
    await test_session.commit()

    # Get all tasks for the primary test user
    tasks = await get_tasks(test_session, user_id=TEST_USER_ID)
    assert len(tasks) == 2
    assert all(t.owner_id == TEST_USER_ID for t in tasks)


@pytest.mark.asyncio
async def test_get_tasks_filter_status(test_session):
    """Test filtering tasks by completion status."""
    await create_task(test_session, TaskCreate(title="Pending Task"), user_id=TEST_USER_ID)
    completed_task = await create_task(test_session, TaskCreate(title="Completed Task"), user_id=TEST_USER_ID)
    completed_task.completed = True
    await test_session.commit()

    # Filter by pending
    pending_tasks = await get_tasks(test_session, user_id=TEST_USER_ID, status="pending")
    assert len(pending_tasks) == 1
    assert pending_tasks[0].title == "Pending Task"

    # Filter by completed
    completed_tasks = await get_tasks(test_session, user_id=TEST_USER_ID, status="completed")
    assert len(completed_tasks) == 1
    assert completed_tasks[0].title == "Completed Task"


@pytest.mark.asyncio
async def test_get_task_by_id_and_owner(test_session):
    """Test getting an existing task by ID for the correct owner."""
    created_task = await create_task(test_session, TaskCreate(title="Find me"), user_id=TEST_USER_ID)
    await test_session.commit()

    found_task = await get_task_by_id(test_session, created_task.id, user_id=TEST_USER_ID)
    assert found_task.id == created_task.id
    assert found_task.title == "Find me"


@pytest.mark.asyncio
async def test_get_task_by_id_wrong_owner(test_session):
    """Test that getting a task by ID for the wrong owner raises TaskNotFoundError."""
    created_task = await create_task(test_session, TaskCreate(title="Private Task"), user_id=TEST_USER_ID)
    await test_session.commit()

    with pytest.raises(TaskNotFoundError):
        await get_task_by_id(test_session, created_task.id, user_id=OTHER_USER_ID)


@pytest.mark.asyncio
async def test_update_task(test_session):
    """Test updating a task's title and completion status."""
    task = await create_task(test_session, TaskCreate(title="Original Title"), user_id=TEST_USER_ID)
    await test_session.commit()

    update_data = TaskUpdate(title="Updated Title", completed=True)
    updated_task = await update_task(test_session, task.id, update_data, user_id=TEST_USER_ID)
    await test_session.commit()

    assert updated_task.id == task.id
    assert updated_task.title == "Updated Title"
    assert updated_task.completed is True


@pytest.mark.asyncio
async def test_delete_task(test_session):
    """Test deleting a task."""
    task = await create_task(test_session, TaskCreate(title="To be deleted"), user_id=TEST_USER_ID)
    await test_session.commit()
    task_id = task.id

    await delete_task(test_session, task_id, user_id=TEST_USER_ID)
    await test_session.commit()

    with pytest.raises(TaskNotFoundError):
        await get_task_by_id(test_session, task_id, user_id=TEST_USER_ID)


@pytest.mark.asyncio
async def test_update_task_status_complete(test_session):
    """Test marking a task as completed via update_task_status."""
    task = await create_task(test_session, TaskCreate(title="Test Task"), user_id=TEST_USER_ID)
    await test_session.commit()
    assert task.completed is False

    updated_task = await update_task_status(test_session, task.id, completed=True, user_id=TEST_USER_ID)
    await test_session.commit()

    assert updated_task.id == task.id
    assert updated_task.completed is True


@pytest.mark.asyncio
async def test_update_task_status_incomplete(test_session):
    """Test marking a task as incomplete via update_task_status."""
    task = await create_task(test_session, TaskCreate(title="Test Task"), user_id=TEST_USER_ID)
    task.completed = True
    await test_session.commit()

    updated_task = await update_task_status(test_session, task.id, completed=False, user_id=TEST_USER_ID)
    await test_session.commit()

    assert updated_task.id == task.id
    assert updated_task.completed is False


@pytest.mark.asyncio
async def test_update_task_status_wrong_owner(test_session):
    """Test that update_task_status raises TaskNotFoundError for wrong owner."""
    task = await create_task(test_session, TaskCreate(title="Private Task"), user_id=TEST_USER_ID)
    await test_session.commit()

    with pytest.raises(TaskNotFoundError):
        await update_task_status(test_session, task.id, completed=True, user_id=OTHER_USER_ID)

