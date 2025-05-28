from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, SQLModel, create_engine
from typing import List
from models.task import Task
from schemas.task import TaskCreate, TaskRead, TaskUpdate
from crud.task import get_task, get_tasks, create_task, update_task, delete_task
import os
import logging

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///data/todo.db")
engine = create_engine(DATABASE_URL, echo=True)

router = APIRouter(prefix="/tasks", tags=["tasks"])

def get_session():
    with Session(engine) as session:
        yield session
logging.info(f"DATABASE_URL: {DATABASE_URL}")

@router.get("/", response_model=List[TaskRead])
def list_tasks(session: Session = Depends(get_session)):
    return get_tasks(session)

@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_new_task(task_in: TaskCreate, session: Session = Depends(get_session)):
    return create_task(session, task_in)

@router.get("/{task_id}", response_model=TaskRead)
def read_task(task_id: int, session: Session = Depends(get_session)):
    task = get_task(session, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.patch("/{task_id}", response_model=TaskRead)
def update_existing_task(task_id: int, task_in: TaskUpdate, session: Session = Depends(get_session)):
    task = update_task(session, task_id, task_in)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_task(task_id: int, session: Session = Depends(get_session)):
    if not delete_task(session, task_id):
        raise HTTPException(status_code=404, detail="Task not found") 