from pydantic import BaseModel
from datetime import datetime


class WordResponse(BaseModel):
    id: int
    english: str
    chinese: str
    part_of_speech: str
    example_sentence: str | None = None
    difficulty_level: int
    category: str

    model_config = {"from_attributes": True}


class ReviewSubmit(BaseModel):
    knew: bool


class ReviewWordResponse(BaseModel):
    id: int
    english: str
    chinese: str
    part_of_speech: str
    example_sentence: str | None = None
    difficulty_level: int
    category: str
    familiarity_level: int
    review_count: int
    next_review_date: datetime | None = None

    model_config = {"from_attributes": True}
