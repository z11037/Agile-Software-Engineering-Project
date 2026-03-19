def test_requires_auth_for_words_review(client):
    resp = client.get("/api/words/review")
    assert resp.status_code == 401


def test_requires_auth_for_quiz_generate(client):
    resp = client.post(
        "/api/quiz/generate",
        json={"count": 2, "quiz_type": "multiple_choice"},
    )
    assert resp.status_code == 401


def test_requires_auth_for_progress_summary(client):
    resp = client.get("/api/progress/summary")
    assert resp.status_code == 401


def test_requires_auth_for_progress_history(client):
    resp = client.get("/api/progress/history?days=7")
    assert resp.status_code == 401

