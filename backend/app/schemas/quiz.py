from pydantic import BaseModel
from datetime import datetime


class QuizGenerateRequest(BaseModel):
    category: str | None = None
    count: int = 10
    quiz_type: str = "multiple_choice"
    difficulty: int | None = None


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


class QuizResultItem(BaseModel):
    question_id: int
    word_id: int
    user_answer: str
    correct_answer: str
    is_correct: bool


class QuizSubmitResponse(BaseModel):
    quiz_id: int
    total_questions: int
    correct_answers: int
    score: float
    results: list[QuizResultItem]
