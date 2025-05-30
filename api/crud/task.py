"""CRUD operations for Task model in the Spirited Todo List API."""

import os
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func
from sqlmodel import Session, select

from models.task import Priority, Task
from schemas.task import TaskCreate, TaskUpdate

MAX_HIGH_PRIORITY_TASK = int(os.getenv("MAX_HIGH_PRIORITY_TASK", "5"))


def get_task(session: Session, task_id: int) -> Optional[Task]:
    """Retrieve a task by its ID."""
    return session.get(Task, task_id)


def get_tasks(
    session: Session,
    limit: int = 20,
    offset: int = 0,
    sort_by: str = "priority",
    sort_order: str = "desc",
) -> tuple[list[Task], int]:
    """Retrieve all tasks with pagination and sorting, and return items and total count.
    The total count is calculated with a separate query to provide the total number of tasks in the database (for pagination),
    not just the number of items in the current page (which would be len(items)).
    """
    valid_sort_fields = {
        "priority": Task.priority,
        "created_at": Task.created_at,
        "updated_at": Task.updated_at,
        "title": Task.title,
        "id": Task.id,
    }
    order_col = valid_sort_fields.get(sort_by, Task.priority)
    if sort_order == "desc":
        order_col = order_col.desc()
    total = session.exec(
        select(func.count()).select_from(Task)  # pylint: disable=not-callable
    ).one()  # pylint: disable=not-callable
    query = select(Task).order_by(order_col).offset(offset).limit(limit)
    items = session.exec(query).all()
    return items, total


def create_task(session: Session, task_in: TaskCreate) -> Task:
    """Create a new task from TaskCreate schema, enforcing high priority limit."""
    if task_in.priority == Priority.HIGH:
        high_count = len(
            session.exec(select(Task).where(Task.priority == Priority.HIGH)).all()
        )
        if high_count >= MAX_HIGH_PRIORITY_TASK:
            raise ValueError(
                f"Cannot create more than {MAX_HIGH_PRIORITY_TASK} high priority tasks."
            )
    task = Task(**task_in.model_dump())
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def update_task(session: Session, task_id: int, task_in: TaskUpdate) -> Optional[Task]:
    """Update an existing task by ID with TaskUpdate schema, enforcing high priority limit."""
    task = session.get(Task, task_id)
    if not task:
        return None
    update_data = task_in.model_dump(exclude_unset=True)
    # Check if updating to high priority
    new_priority = update_data.get("priority", task.priority)
    if new_priority == Priority.HIGH and task.priority != Priority.HIGH:
        high_count = len(
            session.exec(select(Task).where(Task.priority == Priority.HIGH)).all()
        )
        if high_count >= MAX_HIGH_PRIORITY_TASK:
            raise ValueError(
                f"Cannot create more than {MAX_HIGH_PRIORITY_TASK} high priority tasks."
            )
    for field, value in update_data.items():
        setattr(task, field, value)
    task.updated_at = datetime.now(timezone.utc)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def delete_task(session: Session, task_id: int) -> bool:
    """Delete a task by its ID."""
    task = session.get(Task, task_id)
    if not task:
        return False
    session.delete(task)
    session.commit()
    return True
