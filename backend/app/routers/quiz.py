import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.word import Word
from app.models.quiz import Quiz, QuizQuestion
from app.schemas.quiz import (
    QuizGenerateRequest,
    QuizSubmitRequest,
    QuizResponse,
    QuizQuestionResponse,
    QuizResultResponse,
    QuizSubmitResponse,
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.post("/generate", response_model=QuizResponse)
def generate_quiz(
    req: QuizGenerateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Word)
    if req.category:
        query = query.filter(Word.category == req.category)

    all_words = query.all()
    if len(all_words) < 4:
        raise HTTPException(status_code=400, detail="Not enough words to generate a quiz")

    count = min(req.count, len(all_words))
    selected_words = random.sample(all_words, count)

    quiz = Quiz(
        user_id=user.id,
        quiz_type=req.quiz_type,
        total_questions=count,
    )
    db.add(quiz)
    db.flush()

    questions_out: list[QuizQuestionResponse] = []

    for word in selected_words:
        # Build 4 options: 1 correct + 3 distractors
        distractors = [w for w in all_words if w.id != word.id]
        distractor_words = random.sample(distractors, min(3, len(distractors)))
        options = [word.chinese] + [d.chinese for d in distractor_words]
        random.shuffle(options)

        qq = QuizQuestion(
            quiz_id=quiz.id,
            word_id=word.id,
            correct_answer=word.chinese,
        )
        db.add(qq)
        db.flush()

        questions_out.append(
            QuizQuestionResponse(
                id=qq.id,
                word_id=word.id,
                english=word.english,
                options=options,
                correct_answer=None,  # Don't reveal answer on generation
            )
        )

    db.commit()

    return QuizResponse(
        id=quiz.id,
        quiz_type=quiz.quiz_type,
        total_questions=quiz.total_questions,
        questions=questions_out,
    )


@router.post("/{quiz_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    quiz_id: int,
    req: QuizSubmitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    correct_count = 0
    results = []

    for ans in req.answers:
        qq = db.query(QuizQuestion).filter(QuizQuestion.id == ans.question_id).first()
        if not qq or qq.quiz_id != quiz_id:
            continue

        is_correct = ans.user_answer.strip().lower() == qq.correct_answer.strip().lower()
        qq.user_answer = ans.user_answer
        qq.is_correct = is_correct

        if is_correct:
            correct_count += 1

        results.append({
            "question_id": qq.id,
            "word_id": qq.word_id,
            "user_answer": ans.user_answer,
            "correct_answer": qq.correct_answer,
            "is_correct": is_correct,
        })

    quiz.correct_answers = correct_count
    quiz.score = (correct_count / quiz.total_questions * 100) if quiz.total_questions > 0 else 0
    db.commit()

    return QuizSubmitResponse(
        quiz_id=quiz.id,
        total_questions=quiz.total_questions,
        correct_answers=correct_count,
        score=quiz.score,
        results=results,
    )


@router.get("/history", response_model=list[QuizResultResponse])
def quiz_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quizzes = (
        db.query(Quiz)
        .filter(Quiz.user_id == user.id)
        .order_by(Quiz.created_at.desc())
        .limit(50)
        .all()
    )
    return quizzes
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.word import Word
from app.models.quiz import Quiz, QuizQuestion
from app.schemas.quiz import (
    QuizGenerateRequest,
    QuizSubmitRequest,
    QuizResponse,
    QuizQuestionResponse,
    QuizResultResponse,
    QuizSubmitResponse,
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.post("/generate", response_model=QuizResponse)
def generate_quiz(
    req: QuizGenerateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Word)
    if req.category:
        query = query.filter(Word.category == req.category)
    if req.difficulty:
        query = query.filter(Word.difficulty_level == req.difficulty)

    all_words = query.all()
    if len(all_words) < 4:
        raise HTTPException(status_code=400, detail="Not enough words to generate a quiz")

    count = min(req.count, len(all_words))
    selected_words = random.sample(all_words, count)

    quiz = Quiz(
        user_id=user.id,
        quiz_type=req.quiz_type,
        total_questions=count,
    )
    db.add(quiz)
    db.flush()

    questions_out: list[QuizQuestionResponse] = []

    for word in selected_words:
        # Build 4 options: 1 correct + 3 distractors
        distractors = [w for w in all_words if w.id != word.id]
        distractor_words = random.sample(distractors, min(3, len(distractors)))
        options = [word.chinese] + [d.chinese for d in distractor_words]
        random.shuffle(options)

        qq = QuizQuestion(
            quiz_id=quiz.id,
            word_id=word.id,
            correct_answer=word.chinese,
        )
        db.add(qq)
        db.flush()

        questions_out.append(
            QuizQuestionResponse(
                id=qq.id,
                word_id=word.id,
                english=word.english,
                options=options,
                correct_answer=None,  # Don't reveal answer on generation
            )
        )

    db.commit()

    return QuizResponse(
        id=quiz.id,
        quiz_type=quiz.quiz_type,
        total_questions=quiz.total_questions,
        questions=questions_out,
    )


@router.post("/{quiz_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    quiz_id: int,
    req: QuizSubmitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    correct_count = 0
    results = []

    for ans in req.answers:
        qq = db.query(QuizQuestion).filter(QuizQuestion.id == ans.question_id).first()
        if not qq or qq.quiz_id != quiz_id:
            continue

        is_correct = ans.user_answer.strip().lower() == qq.correct_answer.strip().lower()
        qq.user_answer = ans.user_answer
        qq.is_correct = is_correct

        if is_correct:
            correct_count += 1

        results.append({
            "question_id": qq.id,
            "word_id": qq.word_id,
            "user_answer": ans.user_answer,
            "correct_answer": qq.correct_answer,
            "is_correct": is_correct,
        })

    quiz.correct_answers = correct_count
    quiz.score = (correct_count / quiz.total_questions * 100) if quiz.total_questions > 0 else 0
    db.commit()

    return QuizSubmitResponse(
        quiz_id=quiz.id,
        total_questions=quiz.total_questions,
        correct_answers=correct_count,
        score=quiz.score,
        results=results,
    )


@router.get("/history", response_model=list[QuizResultResponse])
def quiz_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quizzes = (
        db.query(Quiz)
        .filter(Quiz.user_id == user.id)
        .order_by(Quiz.created_at.desc())
        .limit(50)
        .all()
    )
    return quizzes

