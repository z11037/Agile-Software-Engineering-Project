# CI Integration Tests — DIICSU English Hub

This directory contains the integration test suite used in the CI pipeline (GitHub Actions). Tests cover all major API endpoints end-to-end using a real FastAPI `TestClient` backed by an isolated SQLite database.

---

## How It Works

`conftest.py` wires everything together:

- Adds `backend/` to `sys.path` so the app modules are importable without installation
- Creates a fresh SQLite database (`test.db`) on disk before each test and drops it after
- Overrides the FastAPI `get_db` dependency to use the test database, keeping tests isolated from the development database
- Provides shared pytest fixtures: `client`, `auth_token`, and `seed_words`

---

## Test Files

| File | Covers |
|------|--------|
| `test_auth.py` | User registration, login, duplicate username/email handling, token format |
| `test_auth_protection.py` | Protected endpoints reject unauthenticated requests (401 responses) |
| `test_words.py` | Word listing, category filter, difficulty filter, review queue retrieval |
| `test_quiz.py` | Quiz generation, answer submission, score calculation, history endpoint |
| `test_progress.py` | Progress summary stats and daily history endpoint |
| `test_review_error_cases.py` | Edge cases and error handling for the review submission endpoint |

---

## Running the Tests

### Prerequisites

The backend Conda environment must be activated:

```bash
conda activate english-learning
```

### From the repository root

```bash
cd github_tests
pytest -v
```

### Or from the root directly

```bash
pytest github_tests/ -v
```

### Run a single file

```bash
pytest github_tests/test_auth.py -v
```

---

## Fixtures

| Fixture | Scope | Description |
|---------|-------|-------------|
| `setup_db` (autouse) | function | Creates all tables before each test; drops them after |
| `client` | function | FastAPI `TestClient` instance |
| `auth_token` | function | Registers and logs in a test user; returns the JWT string |
| `seed_words` | function | Inserts 5 sample words (apple, banana, computer, happy, run) into the test DB |

Use `auth_token` in any test that calls a protected endpoint:

```python
def test_protected(client, auth_token):
    response = client.get(
        "/api/words/review",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
```

---

## Difference from `backend/tests/`

| | `backend/tests/` | `github_tests/` |
|-|-----------------|-----------------|
| Purpose | Local developer unit/integration tests | CI pipeline integration tests |
| DB | In-memory SQLite (faster) | File-based SQLite `test.db` |
| Path setup | Runs from inside `backend/` | Runs from repo root; adds `backend/` to path dynamically |
| Fixtures | Same pattern | Shared `auth_token` and `seed_words` fixtures for broader coverage |

Both suites use the same FastAPI app and should pass in the same environment.
