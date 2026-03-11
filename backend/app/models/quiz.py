from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_type = Column(String(30), nullable=False, default="multiple_choice")
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False, default=0)
    score = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=False)
    user_answer = Column(String(200), nullable=True)
    correct_answer = Column(String(200), nullable=False)
    is_correct = Column(Boolean, default=False)

    quiz = relationship("Quiz", back_populates="questions")
    word = relationship("Word", back_populates="quiz_questions")
