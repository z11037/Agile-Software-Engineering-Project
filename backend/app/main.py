import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, or_

from app.database import engine, Base
from app.models import oral_practice, token_blacklist  # noqa: F401 — register models for create_all
from app.database import engine, Base, SessionLocal
from app.models import oral_practice  # noqa: F401 — register OralPracticeAttempt for create_all
from app.models.word import Word
from app.routers import auth, words, quiz, progress, listening, image_quiz, oral_practice as oral_practice_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="English Learning App", version="1.0.0")

_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
_origins_env = os.environ.get("ALLOWED_ORIGINS", _default_origins)
allowed_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(words.router)
app.include_router(quiz.router)
app.include_router(progress.router)
app.include_router(listening.router)
app.include_router(image_quiz.router)
app.include_router(oral_practice_router.router)


def _backfill_missing_french_translations() -> None:
    """Ensure French quiz mode is immediately usable for all words."""
    inspector = inspect(engine)
    columns = {col["name"] for col in inspector.get_columns("words")}
    if "french" not in columns:
        # Older local DBs might not have multilingual columns yet.
        return

    db = SessionLocal()
    try:
        rows = (
            db.query(Word)
            .filter(or_(Word.french.is_(None), Word.french == ""))
            .all()
        )
        for row in rows:
            row.french = row.english
        if rows:
            db.commit()
    finally:
        db.close()


@app.on_event("startup")
def startup_backfill_language_data() -> None:
    _backfill_missing_french_translations()


@app.get("/")
def root():
    return {"message": "English Learning App API"}
