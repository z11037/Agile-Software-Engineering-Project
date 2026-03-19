from datetime import datetime, timezone

from sqlalchemy.orm import Session

from conftest import TestingSessionLocal

from app.models.word import Word
from app.models.quiz import QuizQuestion


def _seed_words_for_quiz_and_review(db: Session) -> int:
    # Quiz generation requires at least 4 words.
    words = [
        Word(
            english="apple",
            chinese="cn_apple",
            part_of_speech="noun",
            example_sentence="I eat an apple.",
            difficulty_level=1,
            category="food",
        ),
        Word(
            english="banana",
            chinese="cn_banana",
            part_of_speech="noun",
            example_sentence="Bananas are yellow.",
            difficulty_level=1,
            category="food",
        ),
        Word(
            english="computer",
            chinese="cn_computer",
            part_of_speech="noun",
            example_sentence="I use a computer.",
            difficulty_level=2,
            category="technology",
        ),
        Word(
            english="happy",
            chinese="cn_happy",
            part_of_speech="adjective",
            example_sentence="She is happy.",
            difficulty_level=1,
            category="adjectives",
        ),
        Word(
            english="run",
            chinese="cn_run",
            part_of_speech="verb",
            example_sentence="He can run fast.",
            difficulty_level=1,
            category="verbs",
        ),
    ]
    db.add_all(words)
    db.commit()

    apple = db.query(Word).filter(Word.english == "apple").first()
    assert apple is not None
    return int(apple.id)


def _submit_quiz_with_correct_answers(client, auth_token: str, quiz_id: int) -> None:
    headers = {"Authorization": f"Bearer {auth_token}"}

    db = TestingSessionLocal()
    try:
        questions = (
            db.query(QuizQuestion)
            .filter(QuizQuestion.quiz_id == quiz_id)
            .all()
        )
        assert len(questions) > 0

        answers = [
            {"question_id": q.id, "user_answer": q.correct_answer}
            for q in questions
        ]
    finally:
        db.close()

    resp = client.post(
        f"/api/quiz/{quiz_id}/submit",
        json={"answers": answers},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["total_questions"] == len(questions)


def test_progress_summary_and_history(client, auth_token):
    # Ensure there's at least one review and one quiz.
    db = TestingSessionLocal()
    try:
        # Seed enough words to allow quiz generation.
        word_id = _seed_words_for_quiz_and_review(db)
    finally:
        db.close()

    headers = {"Authorization": f"Bearer {auth_token}"}

    # Submit 4 "knew=True" reviews so familiarity_level reaches 4.
    for _ in range(4):
        resp = client.post(
            f"/api/words/{word_id}/review",
            json={"knew": True},
            headers=headers,
        )
        assert resp.status_code == 200

    resp = client.post(
        "/api/quiz/generate",
        json={"count": 2, "quiz_type": "multiple_choice"},
        headers=headers,
    )
    assert resp.status_code == 200
    quiz_id = resp.json()["id"]

    _submit_quiz_with_correct_answers(client, auth_token, quiz_id)

    summary = client.get("/api/progress/summary", headers=headers)
    assert summary.status_code == 200
    data = summary.json()

    assert data["total_words"] >= 1
    assert data["words_learned"] >= 1
    assert data["words_mastered"] >= 1
    assert data["total_quizzes"] >= 1
    assert data["average_score"] >= 0.0
    assert data["reviews_today"] >= 1
    assert data["current_streak"] >= 1

    days = 7
    history = client.get(f"/api/progress/history?days={days}", headers=headers)
    assert history.status_code == 200
    items = history.json()
    assert isinstance(items, list)
    assert len(items) == days

    today = datetime.now(timezone.utc).date().isoformat()
    assert items[-1]["date"] == today

    for item in items:
        assert set(item.keys()) == {"date", "reviews", "quizzes", "accuracy"}
        assert isinstance(item["date"], str)
        assert isinstance(item["reviews"], int)
        assert isinstance(item["quizzes"], int)
        assert isinstance(item["accuracy"], (int, float))

