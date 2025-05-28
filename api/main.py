"""Main entrypoint for the Spirited Todo List FastAPI application."""

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from sqlmodel import SQLModel, create_engine

from routers.task import router as task_router

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///data/todo.db")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

engine = create_engine(DATABASE_URL, echo=True)


@asynccontextmanager
async def lifespan(_):
    """Create database tables at application startup."""
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(task_router)


@app.get("/")
def read_root():
    """Root endpoint for API health check."""
    return {"message": "Welcome to the Spirited Todo List API!"}
