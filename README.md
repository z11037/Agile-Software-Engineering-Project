# DIICSU English Hub

A full-stack English learning web application for students, featuring vocabulary flashcard review with spaced repetition, multiple-choice quizzes, progress analytics, listening practice, and oral practice exercises.

---

## Features

- **Vocabulary Review** — Flashcard-style daily review with a simplified SM-2 spaced repetition algorithm; words you struggle with appear more frequently
- **Quiz System** — Auto-generated multiple-choice quizzes by category and difficulty, with full history
- **Progress Dashboard** — Learning streak, accuracy over time, and per-category breakdowns powered by Recharts
- **Listening Practice** — Transcript-based listening exercises
- **Oral & Practice Tests** — Additional self-study modes
- **JWT Authentication** — Secure registration and login; token stored in `localStorage` with Axios auto-attachment

---

## Tech Stack

| Layer    | Technologies |
|----------|-------------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, React Router 7, Axios, Recharts |
| Backend  | FastAPI, SQLAlchemy, Pydantic, python-jose (JWT), bcrypt, uvicorn |
| Database | SQLite (development) — PostgreSQL-ready for production |
| Testing  | pytest + httpx (backend), TypeScript build check (frontend) |

---

## Project Structure

```
Agile-Software-Engineering-Project/
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── main.py        # FastAPI entry point & CORS
│   │   ├── database.py    # SQLAlchemy engine & session
│   │   ├── models/        # ORM models (User, Word, Progress, Quiz)
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── routers/       # API route handlers
│   │   └── services/      # Business logic (JWT auth, spaced repetition)
│   ├── tests/             # Backend unit & integration tests (pytest)
│   ├── seed.py            # Database seeder — 3,200+ vocabulary words
│   ├── environment.yml    # Conda environment definition
│   └── README.md          # Backend setup & API reference
│
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── App.tsx        # Router & route definitions
│   │   ├── components/    # Shared UI components (Layout, ProtectedRoute)
│   │   ├── hooks/         # useAuth context hook
│   │   ├── pages/         # Route-level pages
│   │   ├── services/      # Axios API client
│   │   └── types/         # TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts     # Dev proxy: /api → localhost:8000
│   └── README.md          # Frontend setup & page reference
│
├── github_tests/          # CI integration tests (pytest)
│   └── README.md          # Test suite documentation
│
└── docs/
    ├── SETUP.md           # Detailed local environment setup guide
    ├── Plan.md            # Agile sprint plan & team roles
    ├── Plan1_basic_feature.md   # Architecture & completed MVP checklist
    ├── Plan2_extend_features.md # Roadmap: reminders & recommendations
    └── requirements.md    # Course rubrics
```

---

## Quick Start

### Prerequisites

- Python 3.10+ and [Conda](https://docs.conda.io/en/latest/miniconda.html) (or venv)
- Node.js 18+ and npm

### 1 — Backend

```bash
cd backend
conda env create -f environment.yml
conda activate english-learning
python seed.py                                          # seed 3,200+ vocabulary words
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173` (Vite proxies `/api` to the backend automatically)

For full details see [docs/SETUP.md](docs/SETUP.md).

---

## API Endpoints

| Method | Endpoint                  | Auth | Description                           |
|--------|---------------------------|------|---------------------------------------|
| POST   | /api/auth/register        | No   | Create a new account                  |
| POST   | /api/auth/login           | No   | Login — returns JWT token             |
| GET    | /api/words                | No   | List words (filter by category/level) |
| GET    | /api/words/categories     | No   | List all word categories              |
| GET    | /api/words/review         | Yes  | Get words due for review today        |
| POST   | /api/words/{id}/review    | Yes  | Submit review result                  |
| POST   | /api/quiz/generate        | Yes  | Generate a quiz                       |
| POST   | /api/quiz/{id}/submit     | Yes  | Submit quiz answers                   |
| GET    | /api/quiz/history         | Yes  | Past quiz results                     |
| GET    | /api/progress/summary     | Yes  | Overall learning stats                |
| GET    | /api/progress/history     | Yes  | Daily history for charts              |
| GET    | /api/listening/transcript/example | No | Example listening transcript    |

---

## Running Tests

```bash
# Backend unit tests
cd backend && conda activate english-learning && pytest tests/ -v

# CI integration tests
cd github_tests && pytest -v

# Frontend build check
cd frontend && npm run build
```

---

## Documentation

| File | Description |
|------|-------------|
| [docs/SETUP.md](docs/SETUP.md) | Full local environment setup guide |
| [docs/Plan.md](docs/Plan.md) | Sprint plan and team roles |
| [docs/Plan1_basic_feature.md](docs/Plan1_basic_feature.md) | Architecture and completed feature checklist |
| [docs/Plan2_extend_features.md](docs/Plan2_extend_features.md) | Extended features roadmap |
| [backend/README.md](backend/README.md) | Backend API and database reference |
| [frontend/README.md](frontend/README.md) | Frontend pages and component guide |
| [github_tests/README.md](github_tests/README.md) | CI test suite documentation |
