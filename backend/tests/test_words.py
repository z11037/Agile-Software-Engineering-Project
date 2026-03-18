def test_list_words(client, seed_words):
    response = client.get("/api/words")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5


def test_list_words_filter_category(client, seed_words):
    response = client.get("/api/words?category=food")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(w["category"] == "food" for w in data)


def test_list_words_filter_difficulty(client, seed_words):
    response = client.get("/api/words?difficulty=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["english"] == "computer"


def test_get_categories(client, seed_words):
    response = client.get("/api/words/categories")
    assert response.status_code == 200
    categories = response.json()
    assert "food" in categories
    assert "technology" in categories


def test_review_words(client, seed_words, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/words/review?limit=3", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 3


def test_submit_review(client, seed_words, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/api/words/1/review", json={"knew": True}, headers=headers)
    assert response.status_code == 200
    assert response.json()["familiarity_level"] == 1
