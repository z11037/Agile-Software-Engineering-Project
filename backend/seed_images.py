# -*- coding: utf-8 -*-
"""
Seed the database with emoji-based image prompts for the Picture Guess quiz.
Each prompt uses one or more emoji as the visual clue; users guess the
English word or phrase that best describes the image.

Categories: emoji, scene, meme, object
Difficulty: 1=easy, 2=medium, 3=hard

Re-seed: delete all rows from image_prompts or drop the table,
         then run: python seed_images.py
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, SessionLocal, Base
from app.models.image_prompt import ImagePrompt

PROMPTS = [
    # ── Emoji / Emotions (category: emoji) ──────────────────────────
    {"url": "😊", "answer": "happy", "hint": "A positive feeling", "cat": "emoji", "diff": 1},
    {"url": "😢", "answer": "sad", "hint": "The opposite of happy", "cat": "emoji", "diff": 1},
    {"url": "😡", "answer": "angry", "hint": "Feeling furious", "cat": "emoji", "diff": 1},
    {"url": "😱", "answer": "scared", "hint": "A feeling of fear", "cat": "emoji", "diff": 1},
    {"url": "😴", "answer": "sleepy", "hint": "Ready for bed", "cat": "emoji", "diff": 1},
    {"url": "🤔", "answer": "thinking", "hint": "Using your brain", "cat": "emoji", "diff": 1},
    {"url": "😂", "answer": "laughing", "hint": "Something very funny", "cat": "emoji", "diff": 1},
    {"url": "🥰", "answer": "love", "hint": "A deep affection", "cat": "emoji", "diff": 1},
    {"url": "😎", "answer": "cool", "hint": "Confident and stylish", "cat": "emoji", "diff": 1},
    {"url": "🤢", "answer": "sick", "hint": "Feeling unwell", "cat": "emoji", "diff": 1},
    {"url": "😤", "answer": "frustrated", "hint": "Annoyed and impatient", "cat": "emoji", "diff": 2},
    {"url": "🥳", "answer": "celebrating", "hint": "Having a party", "cat": "emoji", "diff": 2},

    # ── Objects (category: object) ──────────────────────────────────
    {"url": "🚗", "answer": "car", "hint": "A road vehicle", "cat": "object", "diff": 1},
    {"url": "✈️", "answer": "airplane", "hint": "Flies in the sky", "cat": "object", "diff": 1},
    {"url": "🏠", "answer": "house", "hint": "Where people live", "cat": "object", "diff": 1},
    {"url": "📱", "answer": "phone", "hint": "A communication device", "cat": "object", "diff": 1},
    {"url": "💻", "answer": "computer", "hint": "Used for work and study", "cat": "object", "diff": 1},
    {"url": "📚", "answer": "books", "hint": "You read them", "cat": "object", "diff": 1},
    {"url": "⌚", "answer": "watch", "hint": "Tells you the time", "cat": "object", "diff": 1},
    {"url": "🔑", "answer": "key", "hint": "Opens a lock", "cat": "object", "diff": 1},
    {"url": "🎸", "answer": "guitar", "hint": "A musical instrument", "cat": "object", "diff": 1},
    {"url": "🔧", "answer": "wrench", "hint": "A repair tool", "cat": "object", "diff": 2},
    {"url": "🎒", "answer": "backpack", "hint": "Carry things on your back", "cat": "object", "diff": 1},
    {"url": "🔬", "answer": "microscope", "hint": "See tiny things", "cat": "object", "diff": 2},
    {"url": "💡", "answer": "light bulb", "hint": "Gives off light", "cat": "object", "diff": 1},
    {"url": "🧲", "answer": "magnet", "hint": "Attracts metal", "cat": "object", "diff": 2},

    # ── Scenes (category: scene) ────────────────────────────────────
    {"url": "🏖️", "answer": "beach", "hint": "Sand and ocean", "cat": "scene", "diff": 1},
    {"url": "🌧️", "answer": "rainy", "hint": "Water falls from the sky", "cat": "scene", "diff": 1},
    {"url": "🌅", "answer": "sunset", "hint": "End of the day sky", "cat": "scene", "diff": 1},
    {"url": "⛰️", "answer": "mountain", "hint": "Very high land", "cat": "scene", "diff": 1},
    {"url": "🏙️", "answer": "city", "hint": "Tall buildings everywhere", "cat": "scene", "diff": 1},
    {"url": "🌲", "answer": "forest", "hint": "Full of trees", "cat": "scene", "diff": 1},
    {"url": "🏕️", "answer": "camping", "hint": "Sleeping outdoors in a tent", "cat": "scene", "diff": 1},
    {"url": "🎓", "answer": "graduation", "hint": "Finishing school", "cat": "scene", "diff": 2},
    {"url": "🏋️", "answer": "gym", "hint": "Place to exercise", "cat": "scene", "diff": 1},
    {"url": "🎪", "answer": "circus", "hint": "Acrobats and clowns", "cat": "scene", "diff": 2},
    {"url": "🏥", "answer": "hospital", "hint": "Where doctors work", "cat": "scene", "diff": 1},
    {"url": "🏫", "answer": "school", "hint": "Where students learn", "cat": "scene", "diff": 1},

    # ── Memes / Actions (category: meme) ────────────────────────────
    {"url": "🤝", "answer": "handshake", "hint": "A greeting or agreement", "cat": "meme", "diff": 2},
    {"url": "💪", "answer": "strong", "hint": "Having great power", "cat": "meme", "diff": 1},
    {"url": "🏃", "answer": "running", "hint": "Moving fast on foot", "cat": "meme", "diff": 1},
    {"url": "🍳", "answer": "cooking", "hint": "Preparing food", "cat": "meme", "diff": 1},
    {"url": "🎉", "answer": "party", "hint": "A social celebration", "cat": "meme", "diff": 1},
    {"url": "💤", "answer": "sleeping", "hint": "Eyes closed, in bed", "cat": "meme", "diff": 1},
    {"url": "🛒", "answer": "shopping", "hint": "Buying things at a store", "cat": "meme", "diff": 1},
    {"url": "✍️", "answer": "writing", "hint": "Putting words on paper", "cat": "meme", "diff": 1},
    {"url": "🧹", "answer": "cleaning", "hint": "Making things tidy", "cat": "meme", "diff": 1},
    {"url": "🎭", "answer": "drama", "hint": "Theater and acting", "cat": "meme", "diff": 2},
    {"url": "🤳", "answer": "selfie", "hint": "A photo of yourself", "cat": "meme", "diff": 2},
    {"url": "🧗", "answer": "climbing", "hint": "Going up a wall or rock", "cat": "meme", "diff": 2},
    {"url": "🏄", "answer": "surfing", "hint": "Riding waves on a board", "cat": "meme", "diff": 2},
    {"url": "🧘", "answer": "meditation", "hint": "Calm and mindful practice", "cat": "meme", "diff": 3},
]


def seed_images():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    existing = db.query(ImagePrompt).count()
    if existing > 0:
        print(f"Image prompts table already has {existing} rows. Skipping.")
        print("To re-seed, delete all rows from image_prompts and run again.")
        db.close()
        return

    for p in PROMPTS:
        db.add(
            ImagePrompt(
                image_url=p["url"],
                image_type="emoji",
                correct_answer=p["answer"],
                hint=p["hint"],
                category=p["cat"],
                difficulty_level=p["diff"],
            )
        )

    db.commit()
    final = db.query(ImagePrompt).count()
    print(f"Seeded {final} image prompts.")

    cats: dict[str, int] = {}
    for p in PROMPTS:
        cats[p["cat"]] = cats.get(p["cat"], 0) + 1
    print("Category breakdown:")
    for cat, cnt in sorted(cats.items()):
        print(f"  - {cat}: {cnt}")

    db.close()


if __name__ == "__main__":
    seed_images()
