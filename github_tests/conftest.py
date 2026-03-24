import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database import Base, get_db
from app.main import app

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_token(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpassword123"},
    )
    return response.json()["access_token"]


@pytest.fixture
def seed_words():
    db = TestingSessionLocal()
    from app.models.word import Word

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
    db.close()

