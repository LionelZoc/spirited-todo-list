"""Configuration for FastAPI test client using the shared test DB."""

import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine

from main import app

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Create a single in-memory engine and connection for all tests
TEST_DATABASE_URL = "sqlite://"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
connection = engine.connect()
SQLModel.metadata.create_all(connection)

# Patch the app's dependency to use the test session


def get_test_session():
    """Get a test session for the database using the shared connection."""
    with Session(bind=connection) as session:
        yield session


for route in app.routes:
    if hasattr(route, "dependant"):
        for dep in route.dependant.dependencies:
            if getattr(dep.call, "__name__", None) == "get_session":
                dep.call = get_test_session


@pytest.fixture(scope="function")
def db():
    """Fixture for a clean test DB per test."""
    # Truncate all tables before each test for isolation
    for table in reversed(SQLModel.metadata.sorted_tables):
        connection.execute(text(f"DELETE FROM {table.name}"))
    connection.commit()
    yield


@pytest.fixture(scope="function")
def client(db):  # pylint: disable=redefined-outer-name, unused-argument
    """Fixture for FastAPI test client using a clean test DB per test."""
    return TestClient(app)
