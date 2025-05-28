"""Tests for Task API endpoints and validation in the Spirited Todo List API."""

import os
import re
import sys

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from main import app
from models.task import Priority

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
        "/tasks/", json={"title": "Test Task", "priority": Priority.MID.value}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["priority"] == Priority.MID.value
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
    response = client.patch(f"/tasks/{task_id}", json={"priority": Priority.HIGH.value})
    assert response.status_code == 200
    data = response.json()
    assert data["priority"] == Priority.HIGH.value
    assert data["updated_at"] != updated_at

    # Delete
    response = client.delete(f"/tasks/{task_id}")
    assert response.status_code == 204
    # Confirm deletion
    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 404


def test_create_task_missing_title():
    """Test creating a task with missing title."""
    response = client.post("/tasks/", json={"priority": Priority.LOW.value})
    assert response.status_code == 422
    assert "title" in response.text


def test_create_task_empty_title():
    """Test creating a task with empty title."""
    response = client.post(
        "/tasks/", json={"title": "", "priority": Priority.LOW.value}
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
        "/tasks/", json={"title": 123, "priority": Priority.LOW.value}
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
        "/tasks/", json={"title": "Extra", "priority": Priority.LOW.value, "foo": "bar"}
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
            "/tasks/", json={"title": f"High {i}", "priority": Priority.HIGH.value}
        )
        assert response.status_code == 201
    # The next one should fail
    response = client.post(
        "/tasks/", json={"title": "Too many", "priority": Priority.HIGH.value}
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
    priorities = [Priority.LOW, Priority.MID, Priority.HIGH, Priority.LOW, Priority.MID]
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
    tasks_asc = response.json()
    print("DEBUG tasks_asc:", [(t["id"], t["title"], t["priority"]) for t in tasks_asc])
    priorities_asc = [task["priority"] for task in tasks_asc]
    assert priorities_asc[:5] == [
        Priority.LOW.value,
        Priority.LOW.value,
        Priority.MID.value,
        Priority.MID.value,
        Priority.HIGH.value,
    ]
    # Test offset bigger than number of tasks
    response = client.get("/tasks/?offset=10")
    assert response.status_code == 200
    assert len(response.json()) == 0
    # Test limit bigger than number of tasks
    response = client.get("/tasks/?limit=10")
    assert response.status_code == 200
    assert len(response.json()) == 5
    # Test sort_by invalid field
    response = client.get("/tasks/?sort_by=invalid&sort_order=asc")
    assert response.status_code == 200
    assert len(response.json()) == 5
    # Test sort_order invalid value
    response = client.get("/tasks/?sort_by=priority&sort_order=invalid")
    assert response.status_code == 200
    assert len(response.json()) == 5
    # Test to make sure the default sort_by is priority by desc order
    response = client.get("/tasks/")
    assert response.status_code == 200
    assert len(response.json()) == 5
    assert response.json()[0]["priority"] == Priority.HIGH.value
    assert response.json()[1]["priority"] == Priority.MID.value
    assert response.json()[2]["priority"] == Priority.MID.value
    assert response.json()[3]["priority"] == Priority.LOW.value
    assert response.json()[4]["priority"] == Priority.LOW.value


def test_create_task_priority_out_of_range_and_type():
    """Test creating a task with out-of-range and non-integer priority values."""
    # Out of range (0, 4, -1, 999)
    for val in [0, 4, -1, 999]:
        response = client.post("/tasks/", json={"title": f"Bad {val}", "priority": val})
        assert response.status_code == 422
    # Non-integer (float, string, null)
    for val in [1.5, "high", None]:
        response = client.post("/tasks/", json={"title": f"Bad {val}", "priority": val})
        assert response.status_code == 422


def test_update_task_to_high_priority_at_limit():
    """Test updating a task to high priority when already at the high-priority limit."""
    # Clean up all tasks first
    response = client.get("/tasks/")
    for task in response.json():
        client.delete(f"/tasks/{task['id']}")
    max_high = int(os.getenv("MAX_HIGH_PRIORITY_TASK", "5"))
    # Create max_high high-priority tasks
    ids = []
    for i in range(max_high):
        resp = client.post(
            "/tasks/", json={"title": f"High {i}", "priority": Priority.HIGH.value}
        )
        assert resp.status_code == 201
        ids.append(resp.json()["id"])
    # Create a low-priority task
    resp = client.post("/tasks/", json={"title": "Low", "priority": Priority.LOW.value})
    assert resp.status_code == 201
    low_id = resp.json()["id"]
    # Try to update the low-priority task to high
    resp = client.patch(f"/tasks/{low_id}", json={"priority": Priority.HIGH.value})
    assert resp.status_code == 400
    assert "high priority tasks" in resp.text


def test_delete_high_priority_and_create_new():
    """Test deleting a high-priority task and then creating a new one (should succeed)."""
    # Clean up all tasks first
    response = client.get("/tasks/")
    for task in response.json():
        client.delete(f"/tasks/{task['id']}")
    max_high = int(os.getenv("MAX_HIGH_PRIORITY_TASK", "5"))
    ids = []
    for i in range(max_high):
        resp = client.post(
            "/tasks/", json={"title": f"High {i}", "priority": Priority.HIGH.value}
        )
        assert resp.status_code == 201
        ids.append(resp.json()["id"])
    # Delete one high-priority task
    resp = client.delete(f"/tasks/{ids[0]}")
    assert resp.status_code == 204
    # Now create a new high-priority task (should succeed)
    resp = client.post(
        "/tasks/", json={"title": "High new", "priority": Priority.HIGH.value}
    )
    assert resp.status_code == 201
