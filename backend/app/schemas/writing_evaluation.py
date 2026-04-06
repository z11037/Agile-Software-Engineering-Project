from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class WritingEvaluateRequest(BaseModel):
    task_type: Literal["task1", "task2"]
    text: str = Field(..., min_length=10, max_length=4000)
    prompt_id: str | None = None
    task_subtype: str = "opinion"   # e.g. "opinion", "both_views", "advantages_disadvantages"
    topic_keywords: list[str] = []


class BandBreakdownOut(BaseModel):
    task_response: float
    coherence: float
    lexical: float
    grammar: float


class CheckItem(BaseModel):
    label: str
    ok: bool


class WritingEvaluationOut(BaseModel):
    id: int
    task_type: str
    prompt_id: str | None
    word_count: int
    band: float
    score: int
    breakdown: BandBreakdownOut
    checks: list[CheckItem]
    strengths: list[str]
    improvements: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}
