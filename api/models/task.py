"""Task model definition for the Spirited Todo List API."""

from datetime import datetime, timezone
from enum import IntEnum
from typing import Optional

from sqlalchemy import Column, Integer
from sqlmodel import Field, SQLModel


class Priority(IntEnum):
    """Priority levels for tasks. Used as integer values in the API: 1=LOW, 2=MID, 3=HIGH."""

    LOW = 1  # Low priority
    MID = 2  # Medium priority
    HIGH = 3  # High priority


class Task(SQLModel, table=True):
    """Task model."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    priority: Priority = Field(
        default=Priority.LOW,
        sa_column=Column(Integer),
        description="Priority of the task: 1=LOW, 2=MID, 3=HIGH. Use the integer value.",
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
