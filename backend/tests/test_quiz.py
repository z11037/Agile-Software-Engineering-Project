def test_generate_quiz(client, seed_words, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post(
        "/api/quiz/generate",
        json={"count": 3, "quiz_type": "multiple_choice"},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_questions"] == 3
    assert len(data["questions"]) == 3
    for q in data["questions"]:
        assert len(q["options"]) == 4
        assert q["correct_answer"] is None  # answer hidden during generation


def test_submit_quiz(client, seed_words, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}

    gen_resp = client.post(
        "/api/quiz/generate",
        json={"count": 2, "quiz_type": "multiple_choice"},
        headers=headers,
    )
    quiz_data = gen_resp.json()
    quiz_id = quiz_data["id"]

    # Look up actual correct answers from DB for testing
    from tests.conftest import TestingSessionLocal
    from app.models.quiz import QuizQuestion
    db = TestingSessionLocal()
    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()

    answers = [
        {"question_id": q.id, "user_answer": q.correct_answer}
        for q in questions
    ]
    db.close()

    response = client.post(
        f"/api/quiz/{quiz_id}/submit",
        json={"answers": answers},
        headers=headers,
    )
    assert response.status_code == 200
    result = response.json()
    assert result["correct_answers"] == 2
    assert result["score"] == 100.0


def test_quiz_history(client, seed_words, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}

    client.post(
        "/api/quiz/generate",
        json={"count": 2},
        headers=headers,
    )

    response = client.get("/api/quiz/history", headers=headers)
    assert response.status_code == 200
    history = response.json()
    assert len(history) >= 1
