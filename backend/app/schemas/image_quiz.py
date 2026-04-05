from pydantic import BaseModel
from datetime import datetime


class ImageQuizGenerateRequest(BaseModel):
    category: str | None = None
    count: int = 10
    difficulty: int | None = None
    mode: str = "multiple_choice"


class ImagePromptResponse(BaseModel):
    id: int
    image_url: str
    image_type: str
    hint: str | None = None
    options: list[str]
    correct_answer: str | None = None

    model_config = {"from_attributes": True}


class ImageQuizResponse(BaseModel):
    id: int
    total_questions: int
    mode: str
    questions: list[ImagePromptResponse]

    model_config = {"from_attributes": True}


class ImageQuizAnswerItem(BaseModel):
    question_id: int
    user_answer: str


class ImageQuizSubmitRequest(BaseModel):
    answers: list[ImageQuizAnswerItem]


class ImageQuizResultItem(BaseModel):
    question_id: int
    prompt_id: int
    image_url: str
    image_type: str
    user_answer: str
    correct_answer: str
    is_correct: bool


class ImageQuizSubmitResponse(BaseModel):
    quiz_id: int
    total_questions: int
    correct_answers: int
    score: float
    results: list[ImageQuizResultItem]


class ImageQuizHistoryResponse(BaseModel):
    id: int
    total_questions: int
    correct_answers: int
    score: float
    mode: str
    created_at: datetime

    model_config = {"from_attributes": True}
