def test_register(client):
    response = client.post("/api/auth/register", json={
        "username": "newuser",
        "email": "new@example.com",
        "password": "Password123",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "new@example.com"
    assert "id" in data


def test_register_duplicate_username(client):
    client.post("/api/auth/register", json={
        "username": "dup",
        "email": "dup1@example.com",
        "password": "Password123",
    })
    response = client.post("/api/auth/register", json={
        "username": "dup",
        "email": "dup2@example.com",
        "password": "Password123",
    })
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]


def test_login_success(client):
    client.post("/api/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "Password123",
    })
    response = client.post("/api/auth/login", json={
        "username": "loginuser",
        "password": "Password123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "username": "user2",
        "email": "user2@example.com",
        "password": "Password123",
    })
    response = client.post("/api/auth/login", json={
        "username": "user2",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


def test_logout_invalidates_token(client):
    client.post("/api/auth/register", json={
        "username": "logoutuser",
        "email": "logout@example.com",
        "password": "Password123",
    })
    login_resp = client.post("/api/auth/login", json={
        "username": "logoutuser",
        "password": "Password123",
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_before = client.get("/api/auth/me", headers=headers)
    assert me_before.status_code == 200

    logout_resp = client.post("/api/auth/logout", headers=headers)
    assert logout_resp.status_code == 200

    me_after = client.get("/api/auth/me", headers=headers)
    assert me_after.status_code == 401
