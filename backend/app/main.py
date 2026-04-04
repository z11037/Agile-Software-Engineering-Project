import os

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, words, quiz, progress, listening, image_quiz

Base.metadata.create_all(bind=engine)

app = FastAPI(title="English Learning App", version="1.0.0")

_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
_origins_env = os.environ.get("ALLOWED_ORIGINS", _default_origins)
allowed_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(words.router)
app.include_router(quiz.router)
app.include_router(progress.router)
app.include_router(listening.router)
app.include_router(image_quiz.router)


@app.get("/")
def root():
    return {"message": "English Learning App API"}
