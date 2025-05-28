"""Tests for Task API endpoints and validation in the Spirited Todo List API."""

import os
import re
import sys

from fastapi.testclient import TestClient
from main import app
from models.task import Priority
from sqlmodel import Session, SQLModel, create_engine

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Create a single in-memory SQLite connection for all sessions
TEST_DATABASE_URL = "sqlite://"
test_engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
connection = test_engine.connect()
SQLModel.metadata.create_all(connection)


def get_test_session():
    """Get a test session for the database using the shared connection."""
    with Session(bind=connection) as session:
        yield session


# Patch the app's dependency to use the test session
def patch_app_session():
    """Patch the app's dependency to use the test session."""
    for route in app.routes:
        if hasattr(route, "dependant"):
            for dep in route.dependant.dependencies:
                if getattr(dep.call, "__name__", None) == "get_session":
                    dep.call = get_test_session


patch_app_session()

client = TestClient(app)


def test_create_read_update_delete_task():
    """Test create, read, update, and delete task (happy path)."""
    # Create
    response = client.post(
        "/tasks/", json={"title": "Test Task", "priority": Priority.mid.value}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["priority"] == Priority.mid.value
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
    response = client.patch(f"/tasks/{task_id}", json={"priority": Priority.high.value})
    assert response.status_code == 200
    data = response.json()
    assert data["priority"] == Priority.high.value
    assert data["updated_at"] != updated_at

    # Delete
    response = client.delete(f"/tasks/{task_id}")
    assert response.status_code == 204
    # Confirm deletion
    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 404


def test_create_task_missing_title():
    """Test creating a task with missing title."""
    response = client.post("/tasks/", json={"priority": Priority.low.value})
    assert response.status_code == 422
    assert "title" in response.text


def test_create_task_empty_title():
    """Test creating a task with empty title."""
    response = client.post(
        "/tasks/", json={"title": "", "priority": Priority.low.value}
    )
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
    response = client.post(
        "/tasks/", json={"title": 123, "priority": Priority.low.value}
    )
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
        "/tasks/", json={"title": "Extra", "priority": Priority.low.value, "foo": "bar"}
    )
    # By default, Pydantic will ignore extra fields unless configured otherwise
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Extra"
    assert "foo" not in data


def test_high_priority_task_limit():
    """Test that creating more than MAX_HIGH_PRIORITY_TASK high priority tasks fails."""
    max_high = int(os.getenv("MAX_HIGH_PRIORITY_TASK", "5"))
    # Create up to the limit
    for i in range(max_high):
        response = client.post(
            "/tasks/", json={"title": f"High {i}", "priority": Priority.high.value}
        )
        assert response.status_code == 201
    # The next one should fail
    response = client.post(
        "/tasks/", json={"title": "Too many", "priority": Priority.high.value}
    )
    assert response.status_code == 400
    assert "high priority tasks" in response.text


def test_task_pagination_and_sorting():
    """Test pagination and sorting of tasks."""
    # Clean up all tasks first
    response = client.get("/tasks/")
    for task in response.json():
        client.delete(f"/tasks/{task['id']}")
    # Create 5 tasks with different priorities and titles
    titles = ["A", "B", "C", "D", "E"]
    priorities = [Priority.low, Priority.mid, Priority.high, Priority.low, Priority.mid]
    for t, p in zip(titles, priorities):
        client.post("/tasks/", json={"title": t, "priority": p.value})
    # Test limit
    response = client.get("/tasks/?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Test offset
    response = client.get("/tasks/?limit=2&offset=2")
    assert response.status_code == 200
    data2 = response.json()
    assert len(data2) == 2
    # Test sort_by title desc
    response = client.get("/tasks/?sort_by=title&sort_order=desc")
    assert response.status_code == 200
    titles_desc = [task["title"] for task in response.json()]
    assert titles_desc[:5] == sorted(titles, reverse=True)
    # Test sort_by priority asc
    response = client.get("/tasks/?sort_by=priority&sort_order=asc")
    assert response.status_code == 200
    priorities_asc = [task["priority"] for task in response.json()]
    assert priorities_asc[:5] == sorted(priorities_asc[:5])
    # Test offset bigger than number of tasks
    response = client.get("/tasks/?offset=10")
    assert response.status_code == 200
    assert len(response.json()) == 0
    # Test limit bigger than number of tasks
    response = client.get("/tasks/?limit=10")
    assert response.status_code == 200
    assert len(response.json()) == 5
