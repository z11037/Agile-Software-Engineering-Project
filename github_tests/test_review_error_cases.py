def test_submit_review_nonexistent_word_returns_404(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = client.post(
        "/api/words/999999/review",
        json={"knew": True},
        headers=headers,
    )
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Word not found"


def test_get_review_words_limit_validation(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    resp = client.get("/api/words/review?limit=100", headers=headers)
    assert resp.status_code == 422

