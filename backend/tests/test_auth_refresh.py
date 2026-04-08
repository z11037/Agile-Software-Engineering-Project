"""Tests for the JWT refresh-token mechanism."""
import pytest


# ── helpers ───────────────────────────────────────────────────────────────────

def _register_and_login(client, username="refreshuser", password="Refreshpass1"):
    client.post(
        "/api/auth/register",
        json={"username": username, "email": f"{username}@example.com", "password": password},
    )
    res = client.post("/api/auth/login", json={"username": username, "password": password})
    assert res.status_code == 200
    return res.json()


# ── login response shape ──────────────────────────────────────────────────────

def test_login_returns_refresh_token(client):
    data = _register_and_login(client)
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["refresh_token"]) > 20


# ── /refresh endpoint ─────────────────────────────────────────────────────────

def test_refresh_issues_new_access_token(client):
    tokens = _register_and_login(client)
    res = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert res.status_code == 200
    new_tokens = res.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens
    assert new_tokens["access_token"] != tokens["access_token"]


def test_refresh_rotates_refresh_token(client):
    tokens = _register_and_login(client)
    res = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert res.status_code == 200
    assert res.json()["refresh_token"] != tokens["refresh_token"]


def test_refresh_new_access_token_is_valid(client):
    tokens = _register_and_login(client)
    refresh_res = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    new_access = refresh_res.json()["access_token"]
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {new_access}"})
    assert me_res.status_code == 200


def test_refresh_old_token_rejected_after_rotation(client):
    tokens = _register_and_login(client)
    old_refresh = tokens["refresh_token"]
    client.post("/api/auth/refresh", json={"refresh_token": old_refresh})
    # Replaying the old refresh token must be rejected.
    res = client.post("/api/auth/refresh", json={"refresh_token": old_refresh})
    assert res.status_code == 401


def test_refresh_rejects_invalid_token(client):
    _register_and_login(client)
    res = client.post("/api/auth/refresh", json={"refresh_token": "not-a-real-token"})
    assert res.status_code == 401


def test_refresh_rejects_empty_token(client):
    res = client.post("/api/auth/refresh", json={"refresh_token": ""})
    assert res.status_code == 401


# ── logout revokes refresh token ──────────────────────────────────────────────

def test_logout_revokes_refresh_token(client):
    tokens = _register_and_login(client)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    logout_res = client.post("/api/auth/logout", headers=headers)
    assert logout_res.status_code == 204

    # Refresh token must no longer work after logout.
    refresh_res = client.post("/api/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert refresh_res.status_code == 401


# ── replay-attack detection ───────────────────────────────────────────────────

def test_token_reuse_revokes_all_tokens_for_user(client):
    """
    If a rotated (already-used) refresh token is presented again, the server
    should revoke ALL refresh tokens for that user as a compromise response.
    """
    tokens = _register_and_login(client)
    old_refresh = tokens["refresh_token"]

    # First use — valid rotation.
    res1 = client.post("/api/auth/refresh", json={"refresh_token": old_refresh})
    assert res1.status_code == 200
    new_refresh = res1.json()["refresh_token"]

    # Replay the already-rotated token — triggers compromise detection.
    res2 = client.post("/api/auth/refresh", json={"refresh_token": old_refresh})
    assert res2.status_code == 401

    # The freshly-issued token should also be invalidated now.
    res3 = client.post("/api/auth/refresh", json={"refresh_token": new_refresh})
    assert res3.status_code == 401
