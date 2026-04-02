def test_evaluate_writing_stores_and_returns_band(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = client.post(
        "/api/ielts/evaluate/writing",
        headers=headers,
        json={
            "topic": "Technology topic",
            "task": "Discuss both views and give your own opinion.",
            "essay": " ".join(["word"] * 260)
            + " On the one hand, some people agree. On the other hand, others disagree. In my opinion, I think balance is important. In conclusion, both views matter.",
            "practice_task_id": "t2-test",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "band" in data and 0 <= data["band"] <= 9
    assert "score" in data
    assert data["word_count"] >= 250
    assert any(c.get("label") == ">= 250 words" and c.get("ok") for c in data["checks"])
    assert "evaluation_id" in data
    assert data["breakdown"]["task_response"] >= 0


def test_evaluate_speaking_stores_result(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = client.post(
        "/api/ielts/evaluate/speaking",
        headers=headers,
        json={
            "question_text": "Describe a skill you learned recently.",
            "transcript": " ".join(
                ["Recently", "I", "learned", "Python", "because", "however", "therefore", "for", "example"]
                + ["word"] * 50
            ),
            "difficulty": "medium",
            "duration_seconds": 55.0,
            "question_id": 1,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert 0 <= data["band"] <= 9
    assert data["evaluation_id"] > 0
    assert "pronunciation_proxy" in data["breakdown"]


def test_ielts_history_lists_evaluations(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    client.post(
        "/api/ielts/evaluate/writing",
        headers=headers,
        json={
            "topic": "Short topic",
            "task": "Write an essay.",
            "essay": "hello " * 60,
        },
    )
    hist = client.get("/api/ielts/history?limit=5", headers=headers)
    assert hist.status_code == 200
    items = hist.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    assert items[0]["kind"] in ("writing_t2", "speaking")
    assert "overall_band" in items[0]
