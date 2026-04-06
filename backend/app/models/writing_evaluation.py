from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class WritingEvaluation(Base):
    __tablename__ = "writing_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    task_type = Column(String(16), nullable=False)   # "task1" | "task2"
    prompt_id = Column(String(64), nullable=True)    # e.g. "line-1", "t2-1"
    text = Column(Text, nullable=False)
    word_count = Column(Integer, nullable=False)

    # Overall
    band = Column(Float, nullable=False)
    score = Column(Integer, nullable=False)

    # Sub-bands (0-9)
    task_response = Column(Float, nullable=False)
    coherence = Column(Float, nullable=False)
    lexical = Column(Float, nullable=False)
    grammar = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="writing_evaluations")
