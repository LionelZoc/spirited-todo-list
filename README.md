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