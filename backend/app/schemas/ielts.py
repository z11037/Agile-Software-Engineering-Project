from typing import Literal

from pydantic import BaseModel, Field


class WritingEvaluateRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    task: str = Field(..., min_length=1)
    essay: str = Field(..., min_length=1)
    practice_task_id: str | None = None


class SpeakingEvaluateRequest(BaseModel):
    question_text: str = Field(..., min_length=1)
    transcript: str = Field(..., min_length=1)
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    duration_seconds: float | None = Field(default=None, ge=0, le=3600)
    question_id: int | None = None


class EssayBandBreakdownOut(BaseModel):
    task_response: float
    coherence: float
    lexical: float
    grammar: float


class WritingCheckItem(BaseModel):
    label: str
    ok: bool


class SpeakingBandBreakdownOut(BaseModel):
    fluency_coherence: float
    lexical: float
    grammar: float
    pronunciation_proxy: float


class WritingEvaluateResponse(BaseModel):
    score: int
    band: float
    word_count: int
    breakdown: EssayBandBreakdownOut
    checks: list[WritingCheckItem]
    strengths: list[str]
    improvements: list[str]
    disclaimer: str
    evaluation_id: int


class SpeakingEvaluateResponse(BaseModel):
    score: int
    band: float
    word_count: int
    duration_seconds: float | None
    breakdown: SpeakingBandBreakdownOut
    strengths: list[str]
    improvements: list[str]
    disclaimer: str
    evaluation_id: int


class IELTSEvaluationListItem(BaseModel):
    id: int
    kind: str
    overall_band: float
    created_at: str
    preview: str | None = None

    model_config = {"from_attributes": True}
