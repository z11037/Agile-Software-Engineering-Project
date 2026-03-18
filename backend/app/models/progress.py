from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class UserWordProgress(Base):
    __tablename__ = "user_word_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=False)
    familiarity_level = Column(Integer, default=0)  # 0-5, SM-2 inspired
    review_count = Column(Integer, default=0)
    last_reviewed = Column(DateTime(timezone=True), server_default=func.now())
    next_review_date = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="word_progress")
    word = relationship("Word", back_populates="user_progress")
