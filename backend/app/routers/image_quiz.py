import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.image_prompt import ImagePrompt, ImageQuiz, ImageQuizQuestion
from app.schemas.image_quiz import (
    ImageQuizGenerateRequest,
    ImageQuizResponse,
    ImagePromptResponse,
    ImageQuizSubmitRequest,
    ImageQuizSubmitResponse,
    ImageQuizHistoryResponse,
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/image-quiz", tags=["image-quiz"])


@router.get("/categories")
def get_image_categories(db: Session = Depends(get_db)):
    rows = db.query(ImagePrompt.category).distinct().all()
    return [r[0] for r in rows]


@router.post("/generate", response_model=ImageQuizResponse)
def generate_image_quiz(
    req: ImageQuizGenerateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(ImagePrompt)
    if req.category:
        query = query.filter(ImagePrompt.category == req.category)
    if req.difficulty:
        query = query.filter(ImagePrompt.difficulty_level == req.difficulty)

    all_prompts = query.all()
    if len(all_prompts) < 4:
        raise HTTPException(
            status_code=400,
            detail="Not enough image prompts to generate a quiz",
        )

    count = min(req.count, len(all_prompts))
    selected = random.sample(all_prompts, count)

    quiz = ImageQuiz(
        user_id=user.id,
        total_questions=count,
        mode=req.mode,
    )
    db.add(quiz)
    db.flush()

    questions_out: list[ImagePromptResponse] = []

    for prompt in selected:
        distractors = [p for p in all_prompts if p.id != prompt.id]
        distractor_prompts = random.sample(distractors, min(3, len(distractors)))

        options: list[str] = []
        if req.mode == "multiple_choice":
            options = [prompt.correct_answer] + [
                d.correct_answer for d in distractor_prompts
            ]
            random.shuffle(options)

        qq = ImageQuizQuestion(
            quiz_id=quiz.id,
            prompt_id=prompt.id,
            correct_answer=prompt.correct_answer,
        )
        db.add(qq)
        db.flush()

        questions_out.append(
            ImagePromptResponse(
                id=qq.id,
                image_url=prompt.image_url,
                image_type=prompt.image_type,
                hint=prompt.hint,
                options=options,
                correct_answer=None,
            )
        )

    db.commit()

    return ImageQuizResponse(
        id=quiz.id,
        total_questions=quiz.total_questions,
        mode=quiz.mode,
        questions=questions_out,
    )


@router.post("/{quiz_id}/submit", response_model=ImageQuizSubmitResponse)
def submit_image_quiz(
    quiz_id: int,
    req: ImageQuizSubmitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = (
        db.query(ImageQuiz)
        .filter(ImageQuiz.id == quiz_id, ImageQuiz.user_id == user.id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    correct_count = 0
    results = []

    for ans in req.answers:
        qq = (
            db.query(ImageQuizQuestion)
            .filter(ImageQuizQuestion.id == ans.question_id)
            .first()
        )
        if not qq or qq.quiz_id != quiz_id:
            continue

        is_correct = ans.user_answer.strip().lower() == qq.correct_answer.strip().lower()
        qq.user_answer = ans.user_answer
        qq.is_correct = is_correct

        if is_correct:
            correct_count += 1

        prompt = db.query(ImagePrompt).filter(ImagePrompt.id == qq.prompt_id).first()

        results.append(
            {
                "question_id": qq.id,
                "prompt_id": qq.prompt_id,
                "image_url": prompt.image_url if prompt else "",
                "image_type": prompt.image_type if prompt else "emoji",
                "user_answer": ans.user_answer,
                "correct_answer": qq.correct_answer,
                "is_correct": is_correct,
            }
        )

    quiz.correct_answers = correct_count
    quiz.score = (
        (correct_count / quiz.total_questions * 100) if quiz.total_questions > 0 else 0
    )
    db.commit()

    return ImageQuizSubmitResponse(
        quiz_id=quiz.id,
        total_questions=quiz.total_questions,
        correct_answers=correct_count,
        score=quiz.score,
        results=results,
    )


@router.get("/history", response_model=list[ImageQuizHistoryResponse])
def image_quiz_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quizzes = (
        db.query(ImageQuiz)
        .filter(ImageQuiz.user_id == user.id)
        .order_by(ImageQuiz.created_at.desc())
        .limit(50)
        .all()
    )
    return quizzes
