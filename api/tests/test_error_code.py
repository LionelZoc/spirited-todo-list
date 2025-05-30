"""Tests for error_code in Task API error responses in the Spirited Todo List API."""

import os

from models.error import ErrorCode
from models.task import Priority


def test_get_nonexistent_task_error_code(client):
    """Test error_code for getting a non-existent task."""
    resp = client.get("/tasks/999999")
    assert resp.status_code == 404
    data = resp.json()
    assert "detail" in data
    assert data["detail"].get("error_code") == ErrorCode.TASK_NOT_FOUND


def test_update_nonexistent_task_error_code(client):
    """Test error_code for updating a non-existent task."""
    resp = client.patch("/tasks/999999", json={"title": "Nope"})
    assert resp.status_code == 404
    data = resp.json()
    assert "detail" in data
    assert data["detail"].get("error_code") == ErrorCode.TASK_NOT_FOUND


def test_delete_nonexistent_task_error_code(client):
    """Test error_code for deleting a non-existent task."""
    resp = client.delete("/tasks/999999")
    assert resp.status_code == 404
    data = resp.json()
    assert "detail" in data
    assert data["detail"].get("error_code") == ErrorCode.TASK_NOT_FOUND


def test_high_priority_task_limit_error_code(client):
    """Test error_code for exceeding high priority task limit."""
    max_high = int(os.getenv("MAX_HIGH_PRIORITY_TASK", "5"))
    # Create up to the limit
    for i in range(max_high):
        resp = client.post(
            "/tasks/", json={"title": f"High {i}", "priority": Priority.HIGH.value}
        )
        assert resp.status_code == 201
    # The next one should fail
    resp = client.post(
        "/tasks/", json={"title": "Too many", "priority": Priority.HIGH.value}
    )
    assert resp.status_code == 400
    data = resp.json()
    assert "detail" in data
    assert data["detail"].get("error_code") == ErrorCode.HIGH_PRIORITY_LIMIT


def test_update_to_high_priority_limit_error_code(client):
    """Test error_code for updating a task to high priority when at the limit."""
    resp = client.get("/tasks/")
    for task in resp.json()["items"]:
        client.delete(f"/tasks/{task['id']}")
    max_high = int(os.getenv("MAX_HIGH_PRIORITY_TASK", "5"))
    ids = []
    for i in range(max_high):
        r = client.post(
            "/tasks/", json={"title": f"High {i}", "priority": Priority.HIGH.value}
        )
        assert r.status_code == 201
        ids.append(r.json()["id"])
    r = client.post("/tasks/", json={"title": "Low", "priority": Priority.LOW.value})
    assert r.status_code == 201
    low_id = r.json()["id"]
    r = client.patch(f"/tasks/{low_id}", json={"priority": Priority.HIGH.value})
    assert r.status_code == 400
    data = r.json()
    assert "detail" in data
    assert data["detail"].get("error_code") == ErrorCode.HIGH_PRIORITY_LIMIT
