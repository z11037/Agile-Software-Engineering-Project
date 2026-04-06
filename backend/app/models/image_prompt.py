from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ImagePrompt(Base):
    __tablename__ = "image_prompts"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(500), nullable=False)
    image_type = Column(String(20), nullable=False, default="emoji")
    correct_answer = Column(String(100), nullable=False)
    hint = Column(String(200), nullable=True)
    category = Column(String(50), nullable=False, default="general")
    difficulty_level = Column(Integer, nullable=False, default=1)


class ImageQuiz(Base):
    __tablename__ = "image_quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False, default=0)
    score = Column(Float, nullable=False, default=0.0)
    mode = Column(String(30), nullable=False, default="multiple_choice")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    questions = relationship("ImageQuizQuestion", back_populates="quiz")


class ImageQuizQuestion(Base):
    __tablename__ = "image_quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("image_quizzes.id"), nullable=False)
    prompt_id = Column(Integer, ForeignKey("image_prompts.id"), nullable=False)
    correct_answer = Column(String(200), nullable=False)
    user_answer = Column(String(200), nullable=True)
    is_correct = Column(Boolean, default=False)

    quiz = relationship("ImageQuiz", back_populates="questions")
    prompt = relationship("ImagePrompt")
