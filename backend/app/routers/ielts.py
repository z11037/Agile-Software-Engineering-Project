from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ielts_evaluation import IELTSEvaluation
from app.models.user import User
from app.schemas.ielts import (
    IELTSEvaluationListItem,
    SpeakingEvaluateRequest,
    SpeakingEvaluateResponse,
    SpeakingBandBreakdownOut,
    WritingEvaluateRequest,
    WritingEvaluateResponse,
    EssayBandBreakdownOut,
)
from app.services.auth import get_current_user
from app.services.ielts_scoring import evaluate_speaking_transcript, evaluate_writing_task2

router = APIRouter(prefix="/api/ielts", tags=["ielts"])


def _preview_context(ctx: dict | None, max_len: int = 80) -> str | None:
    if not ctx:
        return None
    for key in ("topic", "question_text", "practice_task_id"):
        v = ctx.get(key)
        if isinstance(v, str) and v.strip():
            s = v.strip().replace("\n", " ")
            return s if len(s) <= max_len else s[: max_len - 1] + "…"
    return None


@router.post("/evaluate/writing", response_model=WritingEvaluateResponse)
def evaluate_writing(
    body: WritingEvaluateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = evaluate_writing_task2(body.topic, body.task, body.essay)
    bd = result["breakdown"]
    feedback = {
        "checks": result["checks"],
        "strengths": result["strengths"],
        "improvements": result["improvements"],
        "disclaimer": result["disclaimer"],
    }
    ctx = {
        "topic": body.topic[:500],
        "task": body.task[:500],
        "practice_task_id": body.practice_task_id,
        "word_count": result["word_count"],
    }
    row = IELTSEvaluation(
        user_id=user.id,
        kind="writing_t2",
        overall_band=float(result["band"]),
        subscores_json=IELTSEvaluation.dumps(result["breakdown"]),
        feedback_json=IELTSEvaluation.dumps(feedback),
        context_json=IELTSEvaluation.dumps(ctx),
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return WritingEvaluateResponse(
        score=result["score"],
        band=float(result["band"]),
        word_count=result["word_count"],
        breakdown=EssayBandBreakdownOut(
            task_response=float(bd["task_response"]),
            coherence=float(bd["coherence"]),
            lexical=float(bd["lexical"]),
            grammar=float(bd["grammar"]),
        ),
        checks=result["checks"],
        strengths=result["strengths"],
        improvements=result["improvements"],
        disclaimer=result["disclaimer"],
        evaluation_id=row.id,
    )


@router.post("/evaluate/speaking", response_model=SpeakingEvaluateResponse)
def evaluate_speaking(
    body: SpeakingEvaluateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = evaluate_speaking_transcript(
        body.transcript,
        body.question_text,
        difficulty=body.difficulty,
        duration_seconds=body.duration_seconds,
    )
    bd = result["breakdown"]
    feedback = {
        "strengths": result["strengths"],
        "improvements": result["improvements"],
        "disclaimer": result["disclaimer"],
    }
    ctx = {
        "question_text": body.question_text[:500],
        "question_id": body.question_id,
        "difficulty": body.difficulty,
        "duration_seconds": body.duration_seconds,
        "word_count": result["word_count"],
    }
    row = IELTSEvaluation(
        user_id=user.id,
        kind="speaking",
        overall_band=float(result["band"]),
        subscores_json=IELTSEvaluation.dumps(result["breakdown"]),
        feedback_json=IELTSEvaluation.dumps(feedback),
        context_json=IELTSEvaluation.dumps(ctx),
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return SpeakingEvaluateResponse(
        score=result["score"],
        band=float(result["band"]),
        word_count=result["word_count"],
        duration_seconds=result["duration_seconds"],
        breakdown=SpeakingBandBreakdownOut(
            fluency_coherence=float(bd["fluency_coherence"]),
            lexical=float(bd["lexical"]),
            grammar=float(bd["grammar"]),
            pronunciation_proxy=float(bd["pronunciation_proxy"]),
        ),
        strengths=result["strengths"],
        improvements=result["improvements"],
        disclaimer=result["disclaimer"],
        evaluation_id=row.id,
    )


@router.get("/history", response_model=list[IELTSEvaluationListItem])
def list_history(
    limit: int = 30,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="limit must be 1–100")
    rows = (
        db.query(IELTSEvaluation)
        .filter(IELTSEvaluation.user_id == user.id)
        .order_by(IELTSEvaluation.created_at.desc())
        .limit(limit)
        .all()
    )
    out: list[IELTSEvaluationListItem] = []
    for r in rows:
        ctx = IELTSEvaluation.loads(r.context_json)
        created = r.created_at.isoformat() if r.created_at else ""
        out.append(
            IELTSEvaluationListItem(
                id=r.id,
                kind=r.kind,
                overall_band=r.overall_band,
                created_at=created,
                preview=_preview_context(ctx if isinstance(ctx, dict) else None),
            )
        )
    return out


@router.get("/history/{evaluation_id}")
def get_evaluation_detail(
    evaluation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(IELTSEvaluation)
        .filter(IELTSEvaluation.id == evaluation_id, IELTSEvaluation.user_id == user.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    try:
        sub = IELTSEvaluation.loads(row.subscores_json)
        fb = IELTSEvaluation.loads(row.feedback_json)
        ctx = IELTSEvaluation.loads(row.context_json)
    except Exception:
        raise HTTPException(status_code=500, detail="Corrupt evaluation record")
    return {
        "id": row.id,
        "kind": row.kind,
        "overall_band": row.overall_band,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "subscores": sub,
        "feedback": fb,
        "context": ctx,
    }
