from typing import Literal

from pydantic import BaseModel, Field
from datetime import datetime


class QuizGenerateRequest(BaseModel):
    category: str | None = None
<<<<<<< Updated upstream
    count: int = Field(default=10, ge=1, le=50)
    quiz_type: Literal["multiple_choice"] = "multiple_choice"
    difficulty: int | None = Field(default=None, ge=1, le=5)
=======
    count: int = 10
    quiz_type: str = "multiple_choice"
    difficulty: int | None = None
>>>>>>> Stashed changes


class QuizAnswerItem(BaseModel):
    question_id: int
    user_answer: str


class QuizSubmitRequest(BaseModel):
    answers: list[QuizAnswerItem]


class QuizQuestionResponse(BaseModel):
    id: int
    word_id: int
    english: str
    options: list[str]
    correct_answer: str | None = None

    model_config = {"from_attributes": True}


class QuizResponse(BaseModel):
    id: int
    quiz_type: str
    total_questions: int
    questions: list[QuizQuestionResponse]

    model_config = {"from_attributes": True}


class QuizResultResponse(BaseModel):
    id: int
    quiz_type: str
    total_questions: int
    correct_answers: int
    score: float
    created_at: datetime

    model_config = {"from_attributes": True}


class QuizSubmitResponse(BaseModel):
    quiz_id: int
    total_questions: int
    correct_answers: int
    score: float
    results: list[dict]
