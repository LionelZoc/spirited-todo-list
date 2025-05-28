"""API routes for Task operations in the Spirited Todo List API."""

import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, create_engine

from crud.task import create_task, delete_task, get_task, get_tasks, update_task
from schemas.task import TaskCreate, TaskRead, TaskUpdate

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///data/todo.db")
engine = create_engine(DATABASE_URL, echo=True)

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_session():
    """Yield a database session."""
    with Session(engine) as session:
        yield session


@router.get("/", response_model=List[TaskRead])
def list_tasks(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort_by: str = Query("priority"),
    sort_order: str = Query("desc"),
    session: Session = Depends(get_session),
):
    """List all tasks with pagination and sorting."""
    return get_tasks(
        session, limit=limit, offset=offset, sort_by=sort_by, sort_order=sort_order
    )


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_new_task(task_in: TaskCreate, session: Session = Depends(get_session)):
    """Create a new task."""
    try:
        return create_task(session, task_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/{task_id}", response_model=TaskRead)
def read_task(task_id: int, session: Session = Depends(get_session)):
    """Get a task by ID."""
    task = get_task(session, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_existing_task(
    task_id: int, task_in: TaskUpdate, session: Session = Depends(get_session)
):
    """Update a task by ID."""
    try:
        task = update_task(session, task_id, task_in)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_task(task_id: int, session: Session = Depends(get_session)):
    """Delete a task by ID."""
    if not delete_task(session, task_id):
        raise HTTPException(status_code=404, detail="Task not found")
