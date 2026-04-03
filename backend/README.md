# Backend — DIICSU English Hub

FastAPI application providing the REST API for authentication, vocabulary, quizzes, progress tracking, and listening practice.

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| FastAPI | ASGI web framework |
| SQLAlchemy | ORM (models + sessions) |
| Pydantic | Request/response schema validation |
| python-jose | JWT token creation and verification |
| bcrypt / passlib | Password hashing |
| uvicorn | ASGI server |
| pytest + httpx | Test runner and async HTTP client |
| SQLite | Development database (file: `english_learning.db`) |

---

## Setup

### Prerequisites

- Python 3.10+ and [Conda](https://docs.conda.io/en/latest/miniconda.html)

### 1. Create the Conda environment

```bash
cd backend
conda env create -f environment.yml
conda activate english-learning
```

To update the environment after changes to `environment.yml`:

```bash
conda env update -f environment.yml --prune
```

<details>
<summary>Alternative: venv + pip</summary>

```bash
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install fastapi "uvicorn[standard]" sqlalchemy "pydantic[email]" \
    "python-jose[cryptography]" bcrypt python-multipart python-dotenv pytest httpx
```

</details>

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in a secret value:

```bash
cp .env.example .env   # Windows: copy .env.example .env
```

Then open `.env` and replace the placeholder with a real secret (e.g. run `python -c "import secrets; print(secrets.token_hex(32))"` to generate one):

```
JWT_SECRET=your-generated-secret-here
```

> The `.env` file is intentionally excluded from version control. Every developer needs their own copy.

### 3. Seed the database

```bash
python seed.py
```

This populates `english_learning.db` with **3,200+ English words** across 23 categories and 3 difficulty levels. See [Database](#database) below for details.

### 4. Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API base URL: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, router registration
│   ├── database.py          # SQLAlchemy engine, SessionLocal, Base
│   ├── models/
│   │   ├── user.py          # User ORM model
│   │   ├── word.py          # Word ORM model
│   │   ├── progress.py      # UserWordProgress ORM model
│   │   └── quiz.py          # Quiz & QuizQuestion ORM models
│   ├── schemas/
│   │   ├── user.py          # UserCreate, UserResponse, Token schemas
│   │   ├── word.py          # Word, ReviewRequest schemas
│   │   ├── quiz.py          # QuizGenerate, QuizSubmit, QuizResult schemas
│   │   └── progress.py      # ProgressSummary, ProgressHistory schemas
│   ├── routers/
│   │   ├── auth.py          # POST /api/auth/register, /api/auth/login
│   │   ├── words.py         # GET /api/words, /review; POST /{id}/review
│   │   ├── quiz.py          # POST /generate, /{id}/submit; GET /history
│   │   ├── progress.py      # GET /api/progress/summary, /history
│   │   └── listening.py     # GET /api/listening/transcript/example
│   └── services/
│       ├── auth.py          # JWT encode/decode, password hash/verify
│       └── review.py        # Spaced repetition scheduling (SM-2 simplified)
├── tests/                   # pytest unit & integration tests
│   ├── conftest.py          # Test client fixture, in-memory SQLite
│   ├── test_auth.py
│   ├── test_quiz.py
│   └── test_words.py
├── seed.py                  # Main database seeder
├── vocabulary_generator.py  # Generates ~511 additional words
├── large_vocabulary.py      # ~1,500 common English words (B–D)
├── check_db.py              # Quick DB stats helper
├── environment.yml          # Conda environment spec
├── reseed_database.bat      # Windows batch script to reseed
└── README_DATABASE.md       # Vocabulary expansion and seeding guide
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Body | Description |
|--------|----------|:----:|------|-------------|
| POST | `/api/auth/register` | No | `{username, email, password}` | Create a new account |
| POST | `/api/auth/login` | No | form: `username, password` | Returns `{access_token, token_type}` |

### Vocabulary

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/words` | No | List words; query params: `category`, `difficulty`, `skip`, `limit` |
| GET | `/api/words/categories` | No | List all available categories |
| GET | `/api/words/review` | Yes | Get words due for review (spaced repetition queue) |
| POST | `/api/words/{word_id}/review` | Yes | Submit review result (`knew_it: bool`) |

### Quiz

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/api/quiz/generate` | Yes | Generate a quiz; body: `{category?, count, quiz_type}` |
| POST | `/api/quiz/{quiz_id}/submit` | Yes | Submit answers; returns score |
| GET | `/api/quiz/history` | Yes | List past quiz results |

### Progress

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/progress/summary` | Yes | Overall stats: words learned, streak, accuracy |
| GET | `/api/progress/history` | Yes | Daily/weekly history array for frontend charts |

### Listening

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/api/listening/transcript/example` | No | Returns an example SRT transcript |

---

## Database

The application uses **SQLite** in development (file: `english_learning.db`, git-ignored). The schema is created automatically by SQLAlchemy on first run.

### Models

| Model | Key Fields |
|-------|-----------|
| `User` | id, username, email, hashed_password, created_at |
| `Word` | id, english, chinese, part_of_speech, example_sentence, difficulty_level (1–3), category |
| `UserWordProgress` | user_id (FK), word_id (FK), familiarity_level, last_reviewed, review_count, next_review_date |
| `Quiz` | user_id (FK), quiz_type, total_questions, correct_answers, score, created_at |
| `QuizQuestion` | quiz_id (FK), word_id (FK), user_answer, correct_answer, is_correct |

### Vocabulary data

| Source | Words |
|--------|-------|
| Base vocabulary (daily life, food, school, …) | ~220 |
| Extended vocabulary by category | ~1,046 |
| Large vocabulary database (B–D alphabetically) | ~1,500 |
| Generated vocabulary | ~511 |
| **Total unique words** | **~3,200** |

23 categories: `daily_life`, `food`, `school`, `business`, `technology`, `travel`, `health`, `nature`, `animals`, `sports`, `arts`, `emotions`, `verbs`, `adjectives`, `science`, `law`, `philosophy`, `geography`, `time`, `clothing`, `colors`, `music`, `academic`

For full details on regenerating or troubleshooting the database see [README_DATABASE.md](README_DATABASE.md).

---

## Running Tests

```bash
cd backend
conda activate english-learning
pytest tests/ -v
```

Tests use an in-memory SQLite database configured in `tests/conftest.py` so they never touch the development database.

---

## Spaced Repetition Algorithm

`app/services/review.py` implements a simplified SM-2 algorithm:

- Each word has a `familiarity_level` (0–5) and a `next_review_date`
- Marking a word as **known** increases familiarity and pushes the next review further out
- Marking a word as **not known** resets or decreases familiarity and schedules an immediate re-review
- The `/api/words/review` endpoint returns only words whose `next_review_date ≤ today`
