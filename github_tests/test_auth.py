def test_register(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "Password123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "new@example.com"
    assert "id" in data


def test_register_duplicate_username(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "dup",
            "email": "dup1@example.com",
            "password": "Password123",
        },
    )
    response = client.post(
        "/api/auth/register",
        json={
            "username": "dup",
            "email": "dup2@example.com",
            "password": "Password123",
        },
    )
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]


def test_login_success(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "Password123",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"username": "loginuser", "password": "Password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "user2",
            "email": "user2@example.com",
            "password": "Password123",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"username": "user2", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_register_password_too_short(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "shortpw",
            "email": "shortpw@example.com",
            "password": "Pass1",
        },
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any("at least 8 characters long" in item["msg"] for item in detail)


def test_register_password_missing_uppercase(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "weakpw",
            "email": "weakpw@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any("Missing: an uppercase letter" in item["msg"] for item in detail)


def test_change_password_rejects_weak_password(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post(
        "/api/auth/change-password",
        json={"old_password": "Testpassword123", "new_password": "password123"},
        headers=headers,
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any("Missing: an uppercase letter" in item["msg"] for item in detail)


def test_change_password_success(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post(
        "/api/auth/change-password",
        json={"old_password": "Testpassword123", "new_password": "Newpassword123"},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["detail"] == "Password updated"

