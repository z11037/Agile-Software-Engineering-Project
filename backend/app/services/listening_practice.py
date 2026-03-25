"""
Build listening practice payloads from allowlisted public lecture subtitles (SRT).

Lecture: Institute of Physics — Newton Medal winner (2012) Prof. Martin Rees (Wikimedia Commons, CC BY 3.0).
Audio is longer than one practice session; we clip to the first CLIP_END_SEC for 5–8 minute style sessions.
"""

from __future__ import annotations

import html
import re
from typing import Literal

ListeningDifficulty = Literal["easy", "medium", "hard"]

# Public sources (fixed — do not pass arbitrary URLs into fetchers).
LECTURE_AUDIO_URL = (
    "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/aa/"
    "Newton_Medal_winner_%282012%29_-_Prof._Martin_Rees.webm/"
    "Newton_Medal_winner_%282012%29_-_Prof._Martin_Rees.webm.480p.vp9.webm"
)
LECTURE_TRANSCRIPT_RAW_URL = (
    "https://commons.wikimedia.org/wiki/"
    "TimedText:Newton_Medal_winner_(2012)_-_Prof._Martin_Rees.webm.en.srt"
    "?action=raw"
)
LECTURE_TITLE = "Newton Medal (2012): Professor Martin Rees — public interview (Institute of Physics)"
LECTURE_ATTRIBUTION = "Institute of Physics (via Wikimedia Commons, CC BY 3.0)"
LECTURE_SOURCE_PAGE = (
    "https://commons.wikimedia.org/wiki/File:Newton_Medal_winner_(2012)_-_Prof._Martin_Rees.webm"
)
# Practice window: ~7 minutes (within requested 5–8 minute range).
CLIP_START_SEC = 0.0
CLIP_END_SEC = 420.0

STOPWORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "at",
    "for",
    "with",
    "as",
    "by",
    "from",
    "that",
    "this",
    "it",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "but",
    "so",
    "because",
    "just",
    "not",
    "we",
    "i",
    "you",
    "they",
    "she",
    "he",
    "their",
    "my",
    "our",
    "your",
    "me",
    "him",
    "her",
    "them",
    "will",
    "would",
    "can",
    "could",
    "should",
    "may",
    "might",
    "there",
    "here",
    "up",
    "down",
    "into",
    "out",
    "about",
    "over",
    "under",
    "only",
    "also",
    "like",
    "when",
    "then",
    "than",
    "myself",
    "some",
    "any",
    "all",
    "more",
    "most",
    "very",
    "such",
    "no",
    "yes",
    "if",
    "how",
    "what",
    "which",
    "who",
    "whom",
    "whose",
    "where",
    "why",
    "had",
    "have",
    "has",
    "having",
    "do",
    "does",
    "did",
    "doing",
    "done",
    "get",
    "got",
    "going",
    "go",
    "come",
    "came",
    "one",
    "two",
    "first",
    "new",
    "now",
    "still",
    "well",
    "even",
    "back",
    "way",
    "things",
    "thing",
    "something",
    "really",
    "think",
    "thought",
}


def _srt_time_to_seconds(ts: str) -> float:
    # "00:01:23,500"
    ts = ts.strip()
    m = re.match(r"^(\d{2}):(\d{2}):(\d{2})[.,](\d{3})$", ts)
    if not m:
        return 0.0
    h, mi, s, ms = map(int, m.groups())
    return h * 3600 + mi * 60 + s + ms / 1000.0


def parse_srt_to_timed_segments(srt_text: str, clip_end_sec: float) -> list[tuple[float, float, str]]:
    """Return (start, end, text) cues that start before clip_end_sec."""
    normalized = srt_text.replace("\r", "")
    blocks = re.split(r"\n\s*\n", normalized)
    out: list[tuple[float, float, str]] = []

    for block in blocks:
        lines = [ln.strip() for ln in block.split("\n") if ln.strip()]
        if not lines:
            continue
        idx = 0
        if re.fullmatch(r"\d+", lines[0]):
            idx = 1
        if idx >= len(lines):
            continue
        time_line = lines[idx]
        if "-->" not in time_line:
            continue
        left, right = [p.strip() for p in time_line.split("-->", 1)]
        start = _srt_time_to_seconds(left.replace(".", ","))
        end = _srt_time_to_seconds(right.replace(".", ","))
        if start >= clip_end_sec:
            continue
        text_lines = lines[idx + 1 :]
        joined = " ".join(text_lines)
        cleaned = html.unescape(re.sub(r"<[^>]*>", "", joined)).replace("\xa0", " ")
        cleaned = re.sub(r"\[[^\]]*\]", "", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        if cleaned:
            out.append((start, end, cleaned))
    out.sort(key=lambda x: x[0])
    return out


def _segment_window(
    timed: list[tuple[float, float, str]], difficulty: ListeningDifficulty
) -> list[str]:
    """Pick transcript slice by difficulty (earlier / full / later within clip)."""
    if not timed:
        return []
    n = len(timed)
    if difficulty == "easy":
        hi = max(1, int(n * 0.72))
        return [t[2] for t in timed[:hi]]
    if difficulty == "hard":
        lo = int(n * 0.28)
        return [t[2] for t in timed[lo:]] if lo < n else [t[2] for t in timed]
    return [t[2] for t in timed]


def extract_keyword_candidates(text: str) -> list[str]:
    lower = text.lower()
    matches = re.findall(r"[a-z]{3,}(?:'[a-z]+)?", lower)
    seen: set[str] = set()
    out: list[str] = []
    for m in matches:
        w = re.sub(r"'+", "", m)
        if w in STOPWORDS or w in seen:
            continue
        seen.add(w)
        out.append(w)
    return out


def _pick_keyword_pool(
    full_text: str, segments: list[str], difficulty: ListeningDifficulty
) -> list[str]:
    kws = extract_keyword_candidates(full_text)
    if difficulty == "easy":
        longish = [k for k in kws if len(k) >= 6]
        return longish if len(longish) >= 12 else kws
    if difficulty == "hard":
        mid = [k for k in kws if 4 <= len(k) <= 7]
        return mid if len(mid) >= 12 else kws
    return kws if kws else ["science"]


def _is_mcq(i: int, difficulty: ListeningDifficulty) -> bool:
    """Deterministic MCQ vs short-answer mix (~easy more MCQ, hard more typing)."""
    if difficulty == "easy":
        return (i % 10) < 8
    if difficulty == "hard":
        return (i % 10) < 3
    return (i % 10) < 5


def make_blank_sentence(segment: str, keyword: str) -> str:
    return re.sub(re.escape(keyword), "____", segment, count=1, flags=re.IGNORECASE)


def generate_questions(
    timed: list[tuple[float, float, str]],
    difficulty: ListeningDifficulty,
    *,
    total_questions: int = 40,
) -> list[dict]:
    windowed = _segment_window(timed, difficulty)
    if not windowed:
        return []

    full_text = " ".join(windowed)
    safe_keywords = _pick_keyword_pool(full_text, windowed, difficulty)

    q_list: list[dict] = []
    for i in range(total_questions):
        keyword = safe_keywords[i % len(safe_keywords)] if safe_keywords else ""
        segment = ""
        for s in windowed:
            if keyword and re.search(re.escape(keyword), s, re.IGNORECASE):
                segment = s
                break
        if not segment:
            segment = windowed[i % len(windowed)]

        blanked = make_blank_sentence(segment, keyword) if keyword else segment
        is_mcq = _is_mcq(i, difficulty)

        if not keyword:
            q_list.append(
                {
                    "id": f"q-{i}",
                    "type": "short",
                    "prompt": "Listen and type a key term you heard in this part of the lecture.",
                    "correct": "",
                }
            )
            continue

        if is_mcq:
            # Distractors: difficulty affects how "close" distractors are in the pool
            if difficulty == "hard":
                off_a, off_b, off_c = 1, 2, 3
            elif difficulty == "easy":
                off_a, off_b, off_c = 5, 11, 17
            else:
                off_a, off_b, off_c = 2, 5, 9
            d1 = safe_keywords[(i + off_a) % len(safe_keywords)]
            d2 = safe_keywords[(i + off_b) % len(safe_keywords)]
            d3 = safe_keywords[(i + off_c) % len(safe_keywords)]
            options_raw = [keyword, d1, d2, d3]
            options: list[str] = []
            for o in options_raw:
                if o and o not in options:
                    options.append(o)
            while len(options) < 4 and safe_keywords:
                cand = safe_keywords[len(options) + i]
                if cand not in options:
                    options.append(cand)
            options = options[:4]
            q_list.append(
                {
                    "id": f"q-{i}",
                    "type": "mcq",
                    "prompt": f'Choose the missing word: "{blanked}"',
                    "options": options,
                    "correct": keyword,
                }
            )
        else:
            q_list.append(
                {
                    "id": f"q-{i}",
                    "type": "short",
                    "prompt": f'Type the missing word: "{blanked}"',
                    "correct": keyword,
                }
            )
    return q_list


def build_practice_sections(
    srt_text: str,
    difficulty: ListeningDifficulty,
    *,
    questions_per_section: int = 10,
    num_sections: int = 4,
) -> list[dict]:
    timed = parse_srt_to_timed_segments(srt_text, CLIP_END_SEC)
    total = questions_per_section * num_sections
    q_all = generate_questions(timed, difficulty, total_questions=total)

    section_titles = [
        "Section 1 — Early life & curiosity",
        "Section 2 — Education & choosing astrophysics",
        "Section 3 — Career, collaboration & dark matter",
        "Section 4 — Public engagement & future science",
    ]
    sections: list[dict] = []
    for sec_idx in range(num_sections):
        slice_q = q_all[sec_idx * questions_per_section : (sec_idx + 1) * questions_per_section]
        sid = f"s{sec_idx + 1}-{difficulty}"
        out_q = []
        for j, q in enumerate(slice_q):
            item = dict(q)
            item["id"] = f"{sid}-q{j + 1}"
            out_q.append(item)
        sections.append(
            {
                "id": sid,
                "title": section_titles[sec_idx],
                "audio_url": LECTURE_AUDIO_URL,
                "questions": out_q,
            }
        )
    return sections
