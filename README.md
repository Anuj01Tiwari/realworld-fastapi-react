# Conduit — RealWorld Full-Stack Implementation

A spec-compliant implementation of the [RealWorld](https://github.com/gothinkster/realworld) 
(Conduit) application — a Medium.com-style blogging platform — built with **React**, 
**FastAPI**, and **PostgreSQL**.

This project follows the official RealWorld API specification and was verified against 
the official Playwright end-to-end test suite, in addition to a custom backend test suite.

## Live Demo
> _Add your deployed link here once hosted (e.g. Vercel + Render)._

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios |
| Backend | FastAPI (Python), SQLAlchemy ORM, Alembic migrations |
| Database | PostgreSQL |
| Auth | JWT (`Authorization: Token <jwt>`) |
| Testing | Pytest (backend), Vitest (frontend), Playwright (e2e) |
| Infra | Docker & Docker Compose |

## Features

- User registration, login, and profile management (JWT-based auth)
- Follow / unfollow other users
- Create, edit, delete articles with tags
- Comment on articles
- Favorite / unfavorite articles
- Global feed, personal feed (followed authors), and tag-based filtering
- Pagination on article listings

## Architecture & Key Decisions

- **FastAPI over Django/Flask**: async-first, automatic OpenAPI docs, and Pydantic-based 
  validation reduce boilerplate for a spec-driven API like this one.
- **PostgreSQL over MongoDB**: the data model is inherently relational (users ↔ articles 
  ↔ comments ↔ tags ↔ follows), so a relational database with proper foreign-key 
  constraints was a better fit than a document store.
- **JWT auth**: stateless auth matching the RealWorld spec's expected 
  `Authorization: Token <jwt>` header format.

## Testing

- **Backend**: 14 automated Pytest test cases covering auth, articles, comments, 
  favorites, profiles, and tags — **84% code coverage**.
- **End-to-End**: Verified against the official RealWorld Playwright test suite — 
  **73/74 applicable tests passing (~98.6%)**.

## Getting Started

### Prerequisites
- Docker & Docker Compose

### Run with Docker (recommended)
```bash
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs (Swagger): http://localhost:8000/docs

### Run backend tests
```bash
cd backend
pip install -r requirements.txt
pytest --cov=app --cov-report=term
```

### Run e2e tests
```bash
npm install
npx playwright test
```

## Project Structure
```
├── backend/          FastAPI application, models, tests
├── frontend/          React application
├── specs/             Official RealWorld API & e2e specs (reference, unmodified)
├── docker-compose.yml
└── playwright.config.ts
```

## Acknowledgements
Built against the [RealWorld](https://github.com/gothinkster/realworld) spec by 
Thinkster — an open-source project for comparing full-stack implementations across 
frameworks.
