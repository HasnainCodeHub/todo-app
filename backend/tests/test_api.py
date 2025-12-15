"""Integration tests for the simplified, JWT-secured Task API endpoints."""

import pytest

def test_list_tasks_empty(client, auth_headers):
    """Test GET /api/tasks returns an empty list when no tasks exist."""
    response = client.get("/api/tasks", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

def test_create_task(client, auth_headers, test_user_id):
    """Test POST /api/tasks creates a task correctly."""
    task_data = {"title": "My first task"}
    response = client.post("/api/tasks", json=task_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My first task"
    assert data["completed"] is False
    assert data["user_id"] == test_user_id
    assert "id" in data
    assert "created_at" in data

def test_create_task_unauthorized(client):
    """Test that POST /api/tasks fails with 401 without a token."""
    task_data = {"title": "This should fail"}
    response = client.post("/api/tasks", json=task_data)
    assert response.status_code == 401

def test_get_task(client, auth_headers, test_user_id):
    """Test GET /api/tasks/{id} returns a specific task."""
    create_response = client.post("/api/tasks", json={"title": "Test Task"}, headers=auth_headers)
    task_id = create_response.json()["id"]

    response = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Test Task"
    assert data["user_id"] == test_user_id

def test_get_task_wrong_owner(client, auth_headers, other_auth_headers):
    """Test that a user cannot get a task belonging to another user."""
    # Create a task as the primary user
    create_response = client.post("/api/tasks", json={"title": "Private Task"}, headers=auth_headers)
    task_id = create_response.json()["id"]

    # Attempt to fetch it as the other user
    response = client.get(f"/api/tasks/{task_id}", headers=other_auth_headers)
    assert response.status_code == 404

def test_update_task(client, auth_headers):
    """Test PUT /api/tasks/{id} updates a task."""
    create_response = client.post("/api/tasks", json={"title": "Original Title"}, headers=auth_headers)
    task_id = create_response.json()["id"]

    update_data = {"title": "Updated Title", "completed": True}
    response = client.put(f"/api/tasks/{task_id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["completed"] is True

def test_delete_task(client, auth_headers):
    """Test DELETE /api/tasks/{id} removes a task."""
    create_response = client.post("/api/tasks", json={"title": "To be deleted"}, headers=auth_headers)
    task_id = create_response.json()["id"]

    response = client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 204

    get_response = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert get_response.status_code == 404

def test_filter_by_status(client, auth_headers):
    """Test filtering tasks by completion status."""
    client.post("/api/tasks", json={"title": "Pending Task"}, headers=auth_headers)
    create_response = client.post("/api/tasks", json={"title": "Completed Task"}, headers=auth_headers)
    task_id = create_response.json()["id"]
    client.put(f"/api/tasks/{task_id}", json={"completed": True}, headers=auth_headers)

    # Filter by pending
    pending_response = client.get("/api/tasks?status=pending", headers=auth_headers)
    assert pending_response.status_code == 200
    pending_tasks = pending_response.json()
    assert len(pending_tasks) == 1
    assert pending_tasks[0]["title"] == "Pending Task"

    # Filter by completed
    completed_response = client.get("/api/tasks?status=completed", headers=auth_headers)
    assert completed_response.status_code == 200
    completed_tasks = completed_response.json()
    assert len(completed_tasks) == 1
    assert completed_tasks[0]["title"] == "Completed Task"

def test_db_health_endpoint(client):
    """Test the database health check endpoint."""
    response = client.get("/api/system/db-health")
    assert response.status_code == 200
    data = response.json()
    assert data["database_ok"] is True
    assert "sample_time" in data

