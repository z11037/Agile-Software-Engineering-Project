from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.oral_practice import OralPracticeAttempt
from app.models.user import User
from app.schemas.oral_practice import OralPracticeAttemptCreate, OralPracticeAttemptOut
from app.services.auth import get_current_user

ALLOWED_CATEGORIES = frozenset(
    {"cs", "mechanical", "civil", "transportation", "math"},
)

router = APIRouter(prefix="/api/oral-practice", tags=["oral-practice"])


@router.post("/attempt", response_model=OralPracticeAttemptOut)
def record_attempt(
    body: OralPracticeAttemptCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    row = OralPracticeAttempt(
        user_id=user.id,
        question_id=body.question_id,
        category=body.category,
        difficulty=body.difficulty,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/history", response_model=list[OralPracticeAttemptOut])
def list_history(
    limit: int = Query(default=50, ge=1, le=200),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(OralPracticeAttempt)
        .filter(OralPracticeAttempt.user_id == user.id)
        .order_by(OralPracticeAttempt.created_at.desc())
        .limit(limit)
        .all()
    )
    return rows
