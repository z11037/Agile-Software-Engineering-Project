from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field


class ListeningMCQQuestion(BaseModel):
    id: str
    type: Literal["mcq"] = "mcq"
    prompt: str
    options: list[str]
    correct: str


class ListeningShortQuestion(BaseModel):
    id: str
    type: Literal["short"] = "short"
    prompt: str
    correct: str


ListeningQuestionItem = Annotated[
    Union[ListeningMCQQuestion, ListeningShortQuestion],
    Field(discriminator="type"),
]


class ListeningSectionSchema(BaseModel):
    id: str
    title: str
    audio_url: str
    questions: list[ListeningQuestionItem]


class ListeningPracticeResponse(BaseModel):
    id: str
    name: str
    difficulty: Literal["easy", "medium", "hard"]
    lecture_title: str
    attribution: str
    license_note: str
    source_url: str
    clip_start_sec: float
    clip_end_sec: float
    clip_note: str
    sections: list[ListeningSectionSchema]


class ListeningLectureMetaResponse(BaseModel):
    lecture_title: str
    attribution: str
    license_note: str
    source_url: str
    audio_url: str
    clip_start_sec: float
    clip_end_sec: float
    clip_note: str
    difficulties: list[Literal["easy", "medium", "hard"]]
