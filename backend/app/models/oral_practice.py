from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class OralPracticeAttempt(Base):
    __tablename__ = "oral_practice_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, nullable=False)
    category = Column(String(32), nullable=False)
    difficulty = Column(String(16), nullable=False)

    # IELTS Speaking four-criterion self-assessment (0-9, nullable = not assessed)
    fluency = Column(Float, nullable=True)    # Fluency & Coherence
    lexical = Column(Float, nullable=True)    # Lexical Resource
    grammar = Column(Float, nullable=True)    # Grammatical Range & Accuracy
    pronunciation = Column(Float, nullable=True)  # Pronunciation
    band = Column(Float, nullable=True)       # overall mean band

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="oral_practice_attempts")
