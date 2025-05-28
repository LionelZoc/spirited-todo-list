# Spirited Todo List API

This is the FastAPI backend for the Spirited Todo List app. It uses FastAPI, SQLModel, SQLite, and Pydantic for a simple, robust, and testable API.

## Quick Start

1. Install dependencies (in Docker):
   ```sh
   docker-compose build api
   ```
2. Run the API (in Docker):
   ```sh
   docker-compose up api
   ```
3. Run tests:
   ```sh
   make test-api
   ```

## Configuration
- Environment variables are loaded from a `.env` file (see `.env.example`).
- Default database: `sqlite:///data/todo.db`

## Features
- CRUD for tasks (title, description, priority, created_at, updated_at)
- Validation and error handling

## Test Coverage
The following test cases are covered:
- Create, read, update, and delete a task (happy path)
- Missing required fields (e.g., title)
- Empty or invalid title
- Invalid or missing priority
- Invalid types and malformed JSON
- Extra fields in payload
- 404 for non-existent tasks (get, update, delete)
- Data integrity: created_at/updated_at logic and format 