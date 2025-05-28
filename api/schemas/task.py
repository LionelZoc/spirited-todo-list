"""Schemas for Task model in the Spirited Todo List API."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from models.task import Priority


class TaskBase(BaseModel):
    """Base schema for Task model."""

    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    priority: Priority = Priority.low


class TaskCreate(TaskBase):
    """Schema for creating a new Task."""


class TaskRead(TaskBase):
    """Schema for reading a Task."""

    id: int
    created_at: datetime
    updated_at: datetime


class TaskUpdate(BaseModel):
    """Schema for updating a Task."""

    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
