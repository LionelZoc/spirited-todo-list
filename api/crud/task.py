"""CRUD operations for Task model in the Spirited Todo List API."""

from datetime import datetime, timezone
from typing import List, Optional

from sqlmodel import Session, select

from models.task import Task
from schemas.task import TaskCreate, TaskUpdate


def get_task(session: Session, task_id: int) -> Optional[Task]:
    """Retrieve a task by its ID."""
    return session.get(Task, task_id)


def get_tasks(session: Session) -> List[Task]:
    """Retrieve all tasks."""
    return session.exec(select(Task)).all()


def create_task(session: Session, task_in: TaskCreate) -> Task:
    """Create a new task from TaskCreate schema."""
    task = Task(**task_in.model_dump())
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def update_task(session: Session, task_id: int, task_in: TaskUpdate) -> Optional[Task]:
    """Update an existing task by ID with TaskUpdate schema."""
    task = session.get(Task, task_id)
    if not task:
        return None
    for field, value in task_in.model_dump(exclude_unset=True).items():
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
