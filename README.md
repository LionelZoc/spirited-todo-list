# Spirited Todo List

A full stack, dockerized todo list application with a FastAPI backend and a Next.js (TypeScript) frontend.

## Project Structure

- `api/` - FastAPI backend (Python, Pydantic, SQLModel, SQLite)
- `web/` - Next.js frontend (React, TypeScript, Tailwind, react-query, react-table)

## Tech Stack

- FastAPI, Pydantic, SQLModel, SQLite
- React, Next.js, TypeScript, Tailwind CSS, react-query, react-table
- Docker, Docker Compose
- Testing: pytest (backend), Jest/React Testing Library (frontend)
- Makefile for common tasks

## Software Quality & Automation

This project is built with a strong focus on code quality, maintainability, and automation:

- **Continuous Integration & Deployment (CI/CD):**
  - GitHub Actions workflows automatically run on every push and pull request.
  - All tests and linters must pass before merging to main.
  - Docker images are built and can be deployed automatically.

- **Automated Testing:**
  - **Backend:** Uses `pytest` for comprehensive API and business rule testing.
  - **Frontend:** Uses `Jest` and `React Testing Library` for unit and integration tests.
  - Tests are run in CI and locally via `make test-api` and `make test-web`.

- **Linting & Formatting:**
  - **ESLint** is configured for TypeScript/React code.
  - **Prettier** ensures consistent code formatting across the codebase.
  - **Pylint** is used for Python backend code.

- **Pre-commit Hooks:**
  - **Husky** is set up to run linters and formatters before every commit, preventing bad code from entering the repository.

- **Code Review & Branching:**
  - Pull requests are required for all changes to main.
  - Branch naming and commit message conventions are enforced for traceability.

- **Makefile:**
  - Common developer tasks (build, test, lint, up, down) are automated for consistency and ease of use.

## Project Management

Before coding, I took time to structure the project, brainstorm features, and create a set of tickets/tasks to guide development. This planning phase helped me anticipate the pull requests I would need to create to complete the project efficiently. You can see the project management board and tickets here: [Notion Project Board](https://omniventus.notion.site/Test-technique-TalkSpirit-200b3b26f1e58025b64ecffdf5759ad5?pvs=4)

## AI Usage

AI was used as a tool to support my development process, not as a replacement for my own work or vision:
- **Backend:** I leveraged AI to help structure the backend, learn Python best practices, and build a robust FastAPI/SQLModel API. AI was especially helpful for writing tests and setting up CI/CD with GitHub Actions and Docker.
- **Frontend:** AI was mainly used for generating test cases and improving styling with Tailwind CSS, but all architectural and business logic decisions were my own.

AI accelerated my learning and productivity, but the overall design, structure, and implementation reflect my own planning and understanding.

## Getting Started

1. **Build and start the app:**
   ```sh
   make up 
   or 
   docker-compose up --build
   ```
2. **API:** http://localhost:8000
3. **Frontend:** http://localhost:3000

## Development
- See `api/README.md` and `web/README.md` for service-specific instructions. 

## some choices

Why did i choose nextjs: it's all about starting small but thinking big.
it's easier to start with a good tech than doing a refactor down the road for scalability.
Nextjs offers some included features like file base routing, file base structure (layout, error page ect...) 

