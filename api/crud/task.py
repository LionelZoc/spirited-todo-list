from sqlmodel import Session, select
from models.task import Task, Priority
from schemas.task import TaskCreate, TaskUpdate
from typing import List, Optional
from datetime import datetime, timezone

def get_task(session: Session, task_id: int) -> Optional[Task]:
    return session.get(Task, task_id)

def get_tasks(session: Session) -> List[Task]:
    return session.exec(select(Task)).all()

def create_task(session: Session, task_in: TaskCreate) -> Task:
    task = Task(**task_in.model_dump())
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def update_task(session: Session, task_id: int, task_in: TaskUpdate) -> Optional[Task]:
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
    task = session.get(Task, task_id)
    if not task:
        return False
    session.delete(task)
    session.commit()
    return True 