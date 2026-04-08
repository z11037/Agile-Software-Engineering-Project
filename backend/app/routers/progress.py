from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, inspect
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.word import Word
from app.models.progress import UserWordProgress
from app.models.quiz import Quiz
from app.models.oral_practice import OralPracticeAttempt
from app.schemas.progress import ProgressSummary, DailyProgress
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])
MAX_HISTORY_DAYS = 90


def _validate_history_days(days: int) -> int:
    if days < 1:
        raise HTTPException(status_code=400, detail="days must be at least 1")
    if days > MAX_HISTORY_DAYS:
        raise HTTPException(
            status_code=400,
            detail=f"days must not exceed {MAX_HISTORY_DAYS}",
        )
    return days


def _table_columns(db: Session, table_name: str) -> set[str]:
    try:
        inspector = inspect(db.bind)
        if not inspector.has_table(table_name):
            return set()
        return {c["name"] for c in inspector.get_columns(table_name)}
    except Exception:
        return set()


@router.get("/summary", response_model=ProgressSummary)
def get_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    word_cols = _table_columns(db, "words")
    uwp_cols = _table_columns(db, "user_word_progress")
    quiz_cols = _table_columns(db, "quizzes")
    oral_cols = _table_columns(db, "oral_practice_attempts")

    has_uwp_review_count = {"user_id", "review_count"}.issubset(uwp_cols)
    has_uwp_mastery = {"user_id", "familiarity_level"}.issubset(uwp_cols)
    has_uwp_last_reviewed = {"user_id", "last_reviewed"}.issubset(uwp_cols)
    has_quiz_user = "user_id" in quiz_cols
    has_quiz_score = has_quiz_user and "score" in quiz_cols
    has_quiz_created_at = has_quiz_user and "created_at" in quiz_cols
    has_oral = {
        "id",
        "user_id",
        "question_id",
        "category",
        "difficulty",
        "fluency",
        "lexical",
        "grammar",
        "pronunciation",
        "band",
        "created_at",
    }.issubset(oral_cols)

    total_words = db.query(Word).count() if word_cols else 0

    words_learned = 0
    if has_uwp_review_count:
        words_learned = (
            db.query(UserWordProgress)
            .filter(UserWordProgress.user_id == user.id, UserWordProgress.review_count > 0)
            .count()
        )

    words_mastered = 0
    if has_uwp_mastery:
        words_mastered = (
            db.query(UserWordProgress)
            .filter(UserWordProgress.user_id == user.id, UserWordProgress.familiarity_level >= 4)
            .count()
        )

    total_quizzes = db.query(Quiz).filter(Quiz.user_id == user.id).count() if has_quiz_user else 0

    total_oral_attempts = (
        db.query(OralPracticeAttempt).filter(OralPracticeAttempt.user_id == user.id).count()
        if has_oral
        else 0
    )

    avg_score_result = (
        db.query(func.avg(Quiz.score)).filter(Quiz.user_id == user.id).scalar()
        if has_quiz_score
        else 0
    )
    average_score = round(avg_score_result or 0, 1)

    # Streak: consecutive days with at least one review, quiz, or oral practice attempt
    today = datetime.now(timezone.utc).date()
    streak = 0
    for i in range(365):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)
        has_review_day = None
        if has_uwp_last_reviewed:
            has_review_day = (
                db.query(UserWordProgress)
                .filter(
                    UserWordProgress.user_id == user.id,
                    UserWordProgress.last_reviewed >= day_start,
                    UserWordProgress.last_reviewed < day_end,
                )
                .first()
            )
        has_quiz_day = None
        if has_quiz_created_at:
            has_quiz_day = (
                db.query(Quiz)
                .filter(
                    Quiz.user_id == user.id,
                    Quiz.created_at >= day_start,
                    Quiz.created_at < day_end,
                )
                .first()
            )
        has_oral_day = None
        if has_oral:
            has_oral_day = (
                db.query(OralPracticeAttempt)
                .filter(
                    OralPracticeAttempt.user_id == user.id,
                    OralPracticeAttempt.created_at >= day_start,
                    OralPracticeAttempt.created_at < day_end,
                )
                .first()
            )
        if has_review_day or has_quiz_day or has_oral_day:
            streak += 1
        else:
            if i == 0:
                continue  # today might not have started yet
            break

    # Reviews today
    today_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
    reviews_today = 0
    if has_uwp_last_reviewed:
        reviews_today = (
            db.query(UserWordProgress)
            .filter(
                UserWordProgress.user_id == user.id,
                UserWordProgress.last_reviewed >= today_start,
            )
            .count()
        )

    oral_attempts_today = 0
    if has_oral:
        oral_attempts_today = (
            db.query(OralPracticeAttempt)
            .filter(
                OralPracticeAttempt.user_id == user.id,
                OralPracticeAttempt.created_at >= today_start,
            )
            .count()
        )

    return ProgressSummary(
        total_words=total_words,
        words_learned=words_learned,
        words_mastered=words_mastered,
        total_quizzes=total_quizzes,
        average_score=average_score,
        current_streak=streak,
        reviews_today=reviews_today,
        total_oral_attempts=total_oral_attempts,
        oral_attempts_today=oral_attempts_today,
    )


@router.get("/history", response_model=list[DailyProgress])
def get_history(
    days: int = Query(default=30),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    uwp_cols = _table_columns(db, "user_word_progress")
    quiz_cols = _table_columns(db, "quizzes")
    oral_cols = _table_columns(db, "oral_practice_attempts")
    has_uwp_last_reviewed = {"user_id", "last_reviewed"}.issubset(uwp_cols)
    has_quiz_created_at = {"user_id", "created_at"}.issubset(quiz_cols)
    has_quiz_score = has_quiz_created_at and "score" in quiz_cols
    has_oral = {
        "id",
        "user_id",
        "question_id",
        "category",
        "difficulty",
        "fluency",
        "lexical",
        "grammar",
        "pronunciation",
        "band",
        "created_at",
    }.issubset(oral_cols)

    days = _validate_history_days(days)
    today = datetime.now(timezone.utc).date()
    result = []

    for i in range(days - 1, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)

        reviews = 0
        if has_uwp_last_reviewed:
            reviews = (
                db.query(UserWordProgress)
                .filter(
                    UserWordProgress.user_id == user.id,
                    UserWordProgress.last_reviewed >= day_start,
                    UserWordProgress.last_reviewed < day_end,
                )
                .count()
            )

        day_quizzes = []
        if has_quiz_created_at:
            day_quizzes = (
                db.query(Quiz)
                .filter(
                    Quiz.user_id == user.id,
                    Quiz.created_at >= day_start,
                    Quiz.created_at < day_end,
                )
                .all()
            )

        oral_count = 0
        if has_oral:
            oral_count = (
                db.query(OralPracticeAttempt)
                .filter(
                    OralPracticeAttempt.user_id == user.id,
                    OralPracticeAttempt.created_at >= day_start,
                    OralPracticeAttempt.created_at < day_end,
                )
                .count()
            )

        quiz_count = len(day_quizzes)
        if day_quizzes and has_quiz_score:
            accuracy = round(sum(q.score for q in day_quizzes) / len(day_quizzes), 1)
        else:
            accuracy = 0

        result.append(
            DailyProgress(
                date=day.isoformat(),
                reviews=reviews,
                quizzes=quiz_count,
                accuracy=accuracy,
                oral_practice=oral_count,
            )
        )

    return result
