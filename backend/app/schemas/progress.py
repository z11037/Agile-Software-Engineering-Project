from pydantic import BaseModel


class ProgressSummary(BaseModel):
    total_words: int
    words_learned: int
    words_mastered: int
    total_quizzes: int
    average_score: float
    current_streak: int
    reviews_today: int
    total_oral_attempts: int
    oral_attempts_today: int


class DailyProgress(BaseModel):
    date: str
    reviews: int
    quizzes: int
    accuracy: float
    oral_practice: int
