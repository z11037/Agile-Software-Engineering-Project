from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.writing_evaluation import WritingEvaluation
from app.models.user import User
from app.schemas.writing_evaluation import (
    WritingEvaluateRequest,
    WritingEvaluationOut,
    BandBreakdownOut,
    CheckItem,
)
from app.services.auth import get_current_user
from app.services.writing_scorer import score_task1, score_task2

router = APIRouter(prefix="/api/writing", tags=["writing"])


@router.post("/evaluate", response_model=WritingEvaluationOut)
def evaluate_writing(
    body: WritingEvaluateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.task_type == "task1":
        result = score_task1(body.text)
    else:
        result = score_task2(
            body.text,
            task_type=body.task_subtype,
            topic_keywords=body.topic_keywords,
        )

    row = WritingEvaluation(
        user_id=user.id,
        task_type=body.task_type,
        prompt_id=body.prompt_id,
        text=body.text,
        word_count=result.word_count,
        band=result.band,
        score=result.score,
        task_response=result.breakdown.task_response,
        coherence=result.breakdown.coherence,
        lexical=result.breakdown.lexical,
        grammar=result.breakdown.grammar,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return WritingEvaluationOut(
        id=row.id,
        task_type=row.task_type,
        prompt_id=row.prompt_id,
        word_count=row.word_count,
        band=row.band,
        score=row.score,
        breakdown=BandBreakdownOut(
            task_response=row.task_response,
            coherence=row.coherence,
            lexical=row.lexical,
            grammar=row.grammar,
        ),
        checks=[CheckItem(**c) for c in result.checks],
        strengths=result.strengths,
        improvements=result.improvements,
        created_at=row.created_at,
    )


@router.get("/history", response_model=list[WritingEvaluationOut])
def writing_history(
    limit: int = Query(default=20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(WritingEvaluation)
        .filter(WritingEvaluation.user_id == user.id)
        .order_by(WritingEvaluation.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        WritingEvaluationOut(
            id=r.id,
            task_type=r.task_type,
            prompt_id=r.prompt_id,
            word_count=r.word_count,
            band=r.band,
            score=r.score,
            breakdown=BandBreakdownOut(
                task_response=r.task_response,
                coherence=r.coherence,
                lexical=r.lexical,
                grammar=r.grammar,
            ),
            checks=[],
            strengths=[],
            improvements=[],
            created_at=r.created_at,
        )
        for r in rows
    ]
