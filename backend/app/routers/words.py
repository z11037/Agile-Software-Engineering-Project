from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.word import Word
from app.models.progress import UserWordProgress
from app.schemas.word import WordResponse, ReviewSubmit, ReviewWordResponse
from app.services.auth import get_current_user
from app.services.review import calculate_next_review

router = APIRouter(prefix="/api/words", tags=["words"])


@router.get("", response_model=list[WordResponse])
def list_words(
    category: str | None = Query(None),
    difficulty: int | None = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Word)
    if category:
        query = query.filter(Word.category == category)
    if difficulty:
        query = query.filter(Word.difficulty_level == difficulty)
    return query.offset(skip).limit(limit).all()


@router.get("/categories", response_model=list[str])
def list_categories(db: Session = Depends(get_db)):
    rows = db.query(Word.category).distinct().all()
    return [r[0] for r in rows]


@router.get("/review", response_model=list[ReviewWordResponse])
def get_review_words(
    limit: int = Query(10, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    # Words due for review
    due_progress = (
        db.query(UserWordProgress)
        .filter(
            UserWordProgress.user_id == user.id,
            UserWordProgress.next_review_date <= now,
        )
        .order_by(UserWordProgress.next_review_date)
        .limit(limit)
        .all()
    )

    results = []
    for p in due_progress:
        word = p.word
        results.append(
            ReviewWordResponse(
                id=word.id,
                english=word.english,
                chinese=word.chinese,
                part_of_speech=word.part_of_speech,
                example_sentence=word.example_sentence,
                difficulty_level=word.difficulty_level,
                category=word.category,
                familiarity_level=p.familiarity_level,
                review_count=p.review_count,
                next_review_date=p.next_review_date,
            )
        )

    # If not enough due words, add new unseen words
    if len(results) < limit:
        reviewed_word_ids = (
            db.query(UserWordProgress.word_id)
            .filter(UserWordProgress.user_id == user.id)
            .subquery()
        )
        new_words = (
            db.query(Word)
            .filter(Word.id.notin_(reviewed_word_ids))
            .limit(limit - len(results))
            .all()
        )
        for word in new_words:
            results.append(
                ReviewWordResponse(
                    id=word.id,
                    english=word.english,
                    chinese=word.chinese,
                    part_of_speech=word.part_of_speech,
                    example_sentence=word.example_sentence,
                    difficulty_level=word.difficulty_level,
                    category=word.category,
                    familiarity_level=0,
                    review_count=0,
                    next_review_date=None,
                )
            )

    return results


@router.post("/{word_id}/review")
def submit_review(
    word_id: int,
    review: ReviewSubmit,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    word = db.query(Word).filter(Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    progress = (
        db.query(UserWordProgress)
        .filter(
            UserWordProgress.user_id == user.id,
            UserWordProgress.word_id == word_id,
        )
        .first()
    )

    if not progress:
        progress = UserWordProgress(user_id=user.id, word_id=word_id)
        db.add(progress)

    new_level, next_date = calculate_next_review(progress.familiarity_level, review.knew)
    progress.familiarity_level = new_level
    progress.review_count += 1
    progress.last_reviewed = datetime.now(timezone.utc)
    progress.next_review_date = next_date

    db.commit()
    return {"message": "Review recorded", "familiarity_level": new_level}
