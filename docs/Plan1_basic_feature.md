---
name: English Learning App Plan
overview: Build a full-stack English learning web application using React (frontend) and FastAPI (backend) that helps students learn English through vocabulary review, quizzes, progress tracking, and a learning statistics dashboard.
todos:
  - id: scaffold-project
    content: "Scaffold project: create frontend/ (Vite + React + TS) and backend/ (FastAPI) directories with dependency files"
    status: completed
  - id: backend-db-models
    content: Define SQLAlchemy database models (User, Word, UserWordProgress, Quiz, QuizQuestion) and create database.py
    status: completed
  - id: backend-auth
    content: Implement JWT auth endpoints (register, login) with password hashing
    status: completed
  - id: backend-vocabulary-api
    content: "Build vocabulary API: list words, get review words, submit review result"
    status: completed
  - id: backend-quiz-api
    content: "Build quiz API: generate quiz, submit answers, get quiz history"
    status: completed
  - id: backend-progress-api
    content: "Build progress/dashboard API: summary stats and learning history"
    status: completed
  - id: backend-seed-data
    content: Create seed script with 200+ English words across categories and difficulty levels
    status: completed
  - id: frontend-auth-pages
    content: Build Login and Register pages with form validation and JWT token management
    status: completed
  - id: frontend-dashboard
    content: Build Dashboard page with summary stats, streak display, and quick-start buttons
    status: completed
  - id: frontend-vocab-review
    content: Build Vocabulary Review page with flashcard UI (flip animation, know/don't-know buttons)
    status: completed
  - id: frontend-quiz
    content: Build Quiz page with multiple-choice questions and score display on completion
    status: completed
  - id: frontend-progress
    content: Build Progress page with Recharts charts (learning history, accuracy over time, category breakdown)
    status: completed
  - id: testing
    content: Write backend pytest tests for auth, vocabulary, and quiz endpoints; add basic frontend component tests
    status: completed
isProject: false
---

# English Learning App -- Architecture and Implementation Plan

## Product Summary

An English learning web app for new English learners that provides:

- **Vocabulary review** (flashcard-style daily review)
- **Quiz system** (multiple-choice, fill-in-the-blank)
- **Progress tracking** (scores, streaks, history)
- **Learning statistics dashboard** (charts, completion rates)

---

## Tech Stack

- **Frontend:** React (Vite + TypeScript) with React Router, Axios, and a charting library (Recharts)
- **Backend:** FastAPI (Python) with SQLAlchemy ORM and Pydantic schemas
- **Database:** SQLite (development) / PostgreSQL (production-ready)
- **Auth:** JWT-based authentication (python-jose + passlib)
- **Styling:** Tailwind CSS for a clean, accessible UI

---

## Project Structure

```
Agile-Software-Engineering-Project/
  frontend/               # React app (Vite + TS)
    src/
      components/         # Reusable UI components
      pages/              # Route-level pages
      services/           # API client (Axios)
      hooks/              # Custom React hooks
      types/              # TypeScript interfaces
  backend/                # FastAPI app
    app/
      main.py             # FastAPI entry point
      models/             # SQLAlchemy models
      schemas/            # Pydantic request/response schemas
      routers/            # API route handlers
      services/           # Business logic
      database.py         # DB engine and session
    requirements.txt
    tests/                # pytest test files
```

---

## Database Models

- **User** -- id, username, email, hashed_password, created_at
- **Word** -- id, english, chinese (or translation), part_of_speech, example_sentence, difficulty_level, category
- **UserWordProgress** -- id, user_id (FK), word_id (FK), familiarity_level, last_reviewed, review_count, next_review_date
- **Quiz** -- id, user_id (FK), quiz_type, total_questions, correct_answers, score, created_at
- **QuizQuestion** -- id, quiz_id (FK), word_id (FK), user_answer, correct_answer, is_correct

---

## API Endpoints (FastAPI)

**Auth**

- `POST /api/auth/register` -- create account
- `POST /api/auth/login` -- returns JWT token

**Vocabulary**

- `GET /api/words` -- list words (with filters: category, difficulty)
- `GET /api/words/review` -- get words due for review (spaced repetition)
- `POST /api/words/{word_id}/review` -- submit review result (updates familiarity)

**Quiz**

- `POST /api/quiz/generate` -- generate a new quiz (params: category, count, type)
- `POST /api/quiz/{quiz_id}/submit` -- submit quiz answers, returns score
- `GET /api/quiz/history` -- past quiz results

**Progress / Dashboard**

- `GET /api/progress/summary` -- overall stats (words learned, accuracy, streak)
- `GET /api/progress/history` -- daily/weekly learning history for charts

---

## Frontend Pages (React)

1. **Login / Register** -- simple auth forms
2. **Dashboard (Home)** -- learning streak, words learned today, accuracy chart, quick-start buttons
3. **Vocabulary Review** -- flashcard interface showing word, translation, example; user marks "know" / "don't know"
4. **Quiz Page** -- multiple-choice or fill-in-the-blank questions; shows score on completion
5. **Quiz History** -- table of past quizzes with scores
6. **Progress Page** -- charts (Recharts) showing learning over time, category breakdown

---

## Key Design Decisions

- **Spaced repetition** for vocabulary review: words the user struggles with appear more frequently (SM-2 simplified algorithm in `backend/app/services/review.py`)
- **JWT auth** stored in localStorage; Axios interceptor attaches token to every request
- **Responsive design** via Tailwind CSS so the app works well on mobile (important for students)
- **Seed data**: ship a `seed_words.json` with 200+ common English words so the app is useful immediately

---

## MVP Scope (Sprint 1)

- User registration and login
- Vocabulary list and flashcard review
- Basic multiple-choice quiz (10 questions)
- Simple progress summary (words reviewed, quiz scores)

## Sprint 2 Additions

- Spaced repetition scheduling
- Learning statistics dashboard with charts
- Quiz history page
- Improved quiz types (fill-in-the-blank)
- Category/difficulty filters for words

