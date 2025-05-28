"""Tests for Task API endpoints and validation in the Spirited Todo List API."""

import os
import re
import sys

from fastapi.testclient import TestClient

from main import app

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
client = TestClient(app)


def test_create_read_update_delete_task():
    """Test create, read, update, and delete task (happy path)."""
    # Create
    response = client.post("/tasks/", json={"title": "Test Task", "priority": "mid"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["priority"] == "mid"
    task_id = data["id"]
    created_at = data["created_at"]
    updated_at = data["updated_at"]
    # Check ISO format and timezone
    assert re.match(
        r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+(?:\+00:00)?$", created_at
    )
    assert re.match(
        r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+(?:\+00:00)?$", updated_at
    )

    # Read
    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id

    # Update
    response = client.patch(f"/tasks/{task_id}", json={"priority": "high"})
    assert response.status_code == 200
    data = response.json()
    assert data["priority"] == "high"
    assert data["updated_at"] != updated_at

    # Delete
    response = client.delete(f"/tasks/{task_id}")
    assert response.status_code == 204
    # Confirm deletion
    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 404


def test_create_task_missing_title():
    """Test creating a task with missing title."""
    response = client.post("/tasks/", json={"priority": "low"})
    assert response.status_code == 422
    assert "title" in response.text


def test_create_task_empty_title():
    """Test creating a task with empty title."""
    response = client.post("/tasks/", json={"title": "", "priority": "low"})
    assert response.status_code == 422
    assert "title" in response.text


def test_create_task_invalid_priority():
    """Test creating a task with invalid priority value."""
    response = client.post("/tasks/", json={"title": "Test", "priority": "urgent"})
    assert response.status_code == 422
    assert "priority" in response.text


def test_create_task_invalid_priority_type():
    """Test creating a task with invalid priority type."""
    response = client.post("/tasks/", json={"title": "Test", "priority": 123})
    assert response.status_code == 422
    assert "priority" in response.text


def test_create_task_invalid_title_type():
    """Test creating a task with invalid title type."""
    response = client.post("/tasks/", json={"title": 123, "priority": "low"})
    assert response.status_code == 422
    assert "title" in response.text


def test_create_task_malformed_json():
    """Test creating a task with malformed JSON payload."""
    response = client.post(
        "/tasks/",
        data="{title: 'bad json'}",
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 422 or response.status_code == 400


def test_update_task_invalid_priority():
    """Test updating a task with invalid priority value."""
    # Create a valid task
    response = client.post("/tasks/", json={"title": "ToUpdate"})
    assert response.status_code == 201
    task_id = response.json()["id"]
    # Try invalid update
    response = client.patch(f"/tasks/{task_id}", json={"priority": "urgent"})
    assert response.status_code == 422
    assert "priority" in response.text


def test_get_nonexistent_task():
    """Test getting a non-existent task."""
    response = client.get("/tasks/999999")
    assert response.status_code == 404


def test_update_nonexistent_task():
    """Test updating a non-existent task."""
    response = client.patch("/tasks/999999", json={"title": "Nope"})
    assert response.status_code == 404


def test_delete_nonexistent_task():
    """Test deleting a non-existent task."""
    response = client.delete("/tasks/999999")
    assert response.status_code == 404


def test_create_task_extra_fields():
    """Test creating a task with extra fields in payload."""
    response = client.post(
        "/tasks/", json={"title": "Extra", "priority": "low", "foo": "bar"}
    )
    # By default, Pydantic will ignore extra fields unless configured otherwise
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Extra"
    assert "foo" not in data
