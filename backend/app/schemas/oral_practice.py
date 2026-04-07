from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class SpeakingSelfAssessment(BaseModel):
    """IELTS Speaking four-criterion self-assessment (each 0-9)."""
    fluency: float = Field(..., ge=0, le=9)
    lexical: float = Field(..., ge=0, le=9)
    grammar: float = Field(..., ge=0, le=9)
    pronunciation: float = Field(..., ge=0, le=9)


class OralPracticeAttemptCreate(BaseModel):
    question_id: int = Field(..., ge=1)
    category: str = Field(..., min_length=1, max_length=32)
    difficulty: str = Field(..., min_length=4, max_length=8)
    self_assessment: SpeakingSelfAssessment | None = None

    @field_validator("difficulty")
    @classmethod
    def difficulty_allowed(cls, v: str) -> str:
        allowed = frozenset({"easy", "medium", "hard"})
        if v not in allowed:
            raise ValueError("difficulty must be easy, medium, or hard")
        return v


class OralPracticeAttemptOut(BaseModel):
    id: int
    question_id: int
    category: str
    difficulty: str
    fluency: float | None = None
    lexical: float | None = None
    grammar: float | None = None
    pronunciation: float | None = None
    band: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
