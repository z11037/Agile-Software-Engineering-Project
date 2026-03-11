from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    english = Column(String(100), nullable=False, index=True)
    chinese = Column(String(100), nullable=False)
    part_of_speech = Column(String(20), nullable=False)
    example_sentence = Column(String(500), nullable=True)
    difficulty_level = Column(Integer, nullable=False, default=1)  # 1=easy, 2=medium, 3=hard
    category = Column(String(50), nullable=False, default="general")

    user_progress = relationship("UserWordProgress", back_populates="word")
    quiz_questions = relationship("QuizQuestion", back_populates="word")
