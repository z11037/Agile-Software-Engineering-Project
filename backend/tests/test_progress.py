def test_progress_history_default_window(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/progress/history", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 30


def test_progress_history_rejects_days_above_max(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/progress/history?days=91", headers=headers)
    assert response.status_code == 400
    assert response.json()["detail"] == "days must not exceed 90"


def test_progress_history_rejects_days_below_min(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/progress/history?days=0", headers=headers)
    assert response.status_code == 400
    assert response.json()["detail"] == "days must be at least 1"
def test_progress_history_default(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/progress/history", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 30


def test_progress_history_rejects_days_above_max(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/progress/history?days=91", headers=headers)
    assert response.status_code == 400
    assert response.json()["detail"] == "days must not exceed 90"


def test_progress_history_rejects_days_below_min(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/progress/history?days=0", headers=headers)
    assert response.status_code == 400
    assert response.json()["detail"] == "days must be at least 1"
