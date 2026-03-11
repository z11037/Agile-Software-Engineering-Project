"""Simplified SM-2 spaced repetition scheduling."""

from datetime import datetime, timedelta, timezone


def calculate_next_review(familiarity_level: int, knew: bool) -> tuple[int, datetime]:
    """Return (new_familiarity, next_review_date) based on whether the user knew the word."""
    now = datetime.now(timezone.utc)

    if knew:
        new_level = min(familiarity_level + 1, 5)
    else:
        new_level = max(familiarity_level - 1, 0)

    intervals = {
        0: timedelta(minutes=1),
        1: timedelta(hours=1),
        2: timedelta(days=1),
        3: timedelta(days=3),
        4: timedelta(days=7),
        5: timedelta(days=14),
    }

    next_date = now + intervals.get(new_level, timedelta(days=1))
    return new_level, next_date
