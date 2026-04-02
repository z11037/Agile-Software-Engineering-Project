import json
from typing import Any

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class IELTSEvaluation(Base):
    """Persisted IELTS-style practice evaluations (writing / speaking)."""

    __tablename__ = "ielts_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(String(32), nullable=False, index=True)  # writing_t2 | speaking
    overall_band = Column(Float, nullable=False)
    subscores_json = Column(Text, nullable=False)
    feedback_json = Column(Text, nullable=False)
    context_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="ielts_evaluations")

    @staticmethod
    def dumps(obj: Any) -> str:
        return json.dumps(obj, ensure_ascii=False)

    @staticmethod
    def loads(s: str | None) -> Any:
        if not s:
            return None
        return json.loads(s)
