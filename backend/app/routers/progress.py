from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.word import Word
from app.models.progress import UserWordProgress
from app.models.quiz import Quiz
from app.schemas.progress import ProgressSummary, DailyProgress
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/summary", response_model=ProgressSummary)
def get_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_words = db.query(Word).count()

    words_learned = (
        db.query(UserWordProgress)
        .filter(UserWordProgress.user_id == user.id, UserWordProgress.review_count > 0)
        .count()
    )

    words_mastered = (
        db.query(UserWordProgress)
        .filter(UserWordProgress.user_id == user.id, UserWordProgress.familiarity_level >= 4)
        .count()
    )

    total_quizzes = db.query(Quiz).filter(Quiz.user_id == user.id).count()

    avg_score_result = (
        db.query(func.avg(Quiz.score))
        .filter(Quiz.user_id == user.id)
        .scalar()
    )
    average_score = round(avg_score_result or 0, 1)

    # Streak: count consecutive days with at least one review
    today = datetime.now(timezone.utc).date()
    streak = 0
    for i in range(365):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)
        has_review = (
            db.query(UserWordProgress)
            .filter(
                UserWordProgress.user_id == user.id,
                UserWordProgress.last_reviewed >= day_start,
                UserWordProgress.last_reviewed < day_end,
            )
            .first()
        )
        if has_review:
            streak += 1
        else:
            if i == 0:
                continue  # today might not have started yet
            break

    # Reviews today
    today_start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
    reviews_today = (
        db.query(UserWordProgress)
        .filter(
            UserWordProgress.user_id == user.id,
            UserWordProgress.last_reviewed >= today_start,
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
    )


@router.get("/history", response_model=list[DailyProgress])
def get_history(
    days: int = Query(default=30, ge=1, le=365),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = datetime.now(timezone.utc).date()
    result = []

    for i in range(days - 1, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)

        reviews = (
            db.query(UserWordProgress)
            .filter(
                UserWordProgress.user_id == user.id,
                UserWordProgress.last_reviewed >= day_start,
                UserWordProgress.last_reviewed < day_end,
            )
            .count()
        )

        day_quizzes = (
            db.query(Quiz)
            .filter(
                Quiz.user_id == user.id,
                Quiz.created_at >= day_start,
                Quiz.created_at < day_end,
            )
            .all()
        )

        quiz_count = len(day_quizzes)
        if day_quizzes:
            accuracy = round(sum(q.score for q in day_quizzes) / len(day_quizzes), 1)
        else:
            accuracy = 0

        result.append(
            DailyProgress(
                date=day.isoformat(),
                reviews=reviews,
                quizzes=quiz_count,
                accuracy=accuracy,
            )
        )

    return result
