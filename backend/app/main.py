from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, words, quiz, progress

Base.metadata.create_all(bind=engine)

app = FastAPI(title="English Learning App", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(words.router)
app.include_router(quiz.router)
app.include_router(progress.router)


@app.get("/")
def root():
    return {"message": "English Learning App API"}
