# Environment Setup Guide

This document explains how to set up and run the English Learning App locally.

## Prerequisites

- **Python 3.10+** (tested with 3.12)
- **Conda** (Miniconda or Anaconda) — [install guide](https://docs.conda.io/en/latest/miniconda.html)
- **Node.js 18+** (tested with 25.x)
- **npm** (comes with Node.js)

---

## Backend Setup (FastAPI)

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create and activate the conda environment

This creates a conda environment called `english-learning` with Python 3.12 and all required dependencies:

```bash
conda env create -f environment.yml
conda activate english-learning
```

To update the environment after changes to `environment.yml`:

```bash
conda env update -f environment.yml --prune
```

<details>
<summary>Alternative: using venv + pip instead of conda</summary>

```bash
python3 -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

</details>

### 3. Install Python dependencies

Dependencies are installed automatically by `conda env create`. If you need to add a new package, add it to `environment.yml` and run the update command above.

### 5. Seed the database with vocabulary words

This populates the SQLite database with 200+ English words across 10 categories:

```bash
python seed.py
```

### 6. Start the backend server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. You can view the auto-generated API docs at `http://localhost:8000/docs`.

---

## Frontend Setup (React + Vite)

### 1. Navigate to the frontend directory

```bash
cd frontend
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`. The Vite dev server proxies all `/api` requests to the backend at `http://localhost:8000`.

---

## Running Both Together

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
conda activate english-learning
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Running Tests

### Backend tests (pytest)

```bash
cd backend
conda activate english-learning
pytest tests/ -v
```

### Frontend build check

```bash
cd frontend
npm run build
```

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── database.py          # SQLAlchemy engine & session
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py          # User model
│   │   │   ├── word.py          # Word model
│   │   │   ├── progress.py      # UserWordProgress model
│   │   │   └── quiz.py          # Quiz & QuizQuestion models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   │   ├── user.py
│   │   │   ├── word.py
│   │   │   ├── quiz.py
│   │   │   └── progress.py
│   │   ├── routers/             # API route handlers
│   │   │   ├── auth.py          # POST /api/auth/register, /api/auth/login
│   │   │   ├── words.py         # GET/POST /api/words/*
│   │   │   ├── quiz.py          # POST /api/quiz/generate, submit; GET history
│   │   │   └── progress.py      # GET /api/progress/summary, /history
│   │   └── services/            # Business logic
│   │       ├── auth.py          # JWT & password hashing
│   │       └── review.py        # Spaced repetition algorithm
│   ├── tests/                   # pytest test suite
│   ├── seed.py                  # Database seed script (200+ words)
│   ├── environment.yml          # Conda environment definition
│   └── requirements.txt         # Python dependencies (pip fallback)
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx             # React entry point
│   │   ├── App.tsx              # Router & route definitions
│   │   ├── index.css            # Tailwind CSS import
│   │   ├── types/index.ts       # TypeScript interfaces
│   │   ├── services/api.ts      # Axios API client
│   │   ├── hooks/useAuth.tsx    # Auth context & hook
│   │   ├── components/
│   │   │   ├── Layout.tsx       # Navigation bar & layout
│   │   │   └── ProtectedRoute.tsx
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── RegisterPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── ReviewPage.tsx   # Flashcard vocabulary review
│   │       ├── QuizPage.tsx     # Multiple-choice quiz
│   │       └── ProgressPage.tsx # Charts & analytics
│   ├── package.json
│   └── vite.config.ts
│
└── docs/
    ├── requirements.md          # Client & lecturer rubrics
    ├── Plan.md                  # Sprint plan
    └── SETUP.md                 # This file
```

---

## Tech Stack Summary

| Layer    | Technology                           |
|----------|--------------------------------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Recharts, React Router, Axios |
| Backend  | FastAPI, SQLAlchemy, Pydantic, python-jose (JWT), passlib (bcrypt) |
| Database | SQLite (dev) — swap to PostgreSQL for production |
| Testing  | pytest + httpx (backend), TypeScript build check (frontend) |

---

## API Endpoints Quick Reference

| Method | Endpoint                    | Auth | Description                    |
|--------|-----------------------------|------|--------------------------------|
| POST   | /api/auth/register          | No   | Create a new account           |
| POST   | /api/auth/login             | No   | Login, returns JWT token       |
| GET    | /api/words                  | No   | List words (filter by category/difficulty) |
| GET    | /api/words/categories       | No   | List all word categories       |
| GET    | /api/words/review           | Yes  | Get words due for review       |
| POST   | /api/words/{id}/review      | Yes  | Submit review result           |
| POST   | /api/quiz/generate          | Yes  | Generate a new quiz            |
| POST   | /api/quiz/{id}/submit       | Yes  | Submit quiz answers            |
| GET    | /api/quiz/history           | Yes  | Get past quiz results          |
| GET    | /api/progress/summary       | Yes  | Overall learning stats         |
| GET    | /api/progress/history       | Yes  | Daily progress for charts      |
