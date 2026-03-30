"""
Build listening practice payloads from allowlisted public lecture subtitles (SRT).

Lecture: Institute of Physics — Newton Medal winner (2012) Prof. Martin Rees (Wikimedia Commons, CC BY 3.0).
Audio is longer than one practice session; we clip to the first CLIP_END_SEC for 5–8 minute style sessions.
"""

from __future__ import annotations

import html
import re
import shutil
import sys
import subprocess
import tempfile
import wave
from pathlib import Path
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

# Bundled English SRT (same text as Commons TimedText; avoids SSRF fetch / SSL issues on deploy).
_BUNDLE_DIR = Path(__file__).resolve().parent.parent / "data"
BUNDLED_LECTURE_TRANSCRIPT_SRT = _BUNDLE_DIR / "listening_martin_rees.en.srt"


def load_bundled_lecture_transcript_srt() -> str | None:
    if not BUNDLED_LECTURE_TRANSCRIPT_SRT.is_file():
        return None
    text = BUNDLED_LECTURE_TRANSCRIPT_SRT.read_text(encoding="utf-8", errors="replace")
    return text.strip() or None

ListeningDifficulty = Literal["easy", "medium", "hard"]

# Audio: download once and cache locally.
# Transcript stays bundled offline to avoid Wikimedia TLS/SSL issues for SRT fetching.
LECTURE_AUDIO_SOURCE_URL = (
    "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/aa/"
    "Newton_Medal_winner_%282012%29_-_Prof._Martin_Rees.webm/"
    "Newton_Medal_winner_%282012%29_-_Prof._Martin_Rees.webm.480p.vp9.webm"
)
LECTURE_AUDIO_URL_LOCAL = "/api/listening/audio.webm"
LECTURE_AUDIO_CACHE_WEBM_PATH = _BUNDLE_DIR / "listening_martin_rees.webm.480p.webm"
LECTURE_AUDIO_CACHE_MEDIA_TYPE = "audio/webm"
MIN_AUDIO_CACHE_SIZE_BYTES = 1_000_000

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

_TTS_VOICE = "Alex"
_TTS_RATE_WPM = 180
_TTS_SAMPLE_RATE = 44100
_TTS_WAV_PATH = _BUNDLE_DIR / "listening_martin_rees.clip_tts.wav"


def _download_file_allowlisted(url: str, dest_path: Path, *, timeout_s: int = 90) -> None:
    """
    Download URL to dest_path.
    This function only supports allowlisted lecture URLs (we hardcode the URL elsewhere).
    """
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    tmp_path = dest_path.with_suffix(dest_path.suffix + ".part")
    # Stream download in chunks to avoid holding the whole file in memory.
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; EnglishLearningApp/1.0)"})
    try:
        with urlopen(req, timeout=timeout_s) as resp, open(tmp_path, "wb") as f:
            while True:
                chunk = resp.read(1024 * 256)
                if not chunk:
                    break
                f.write(chunk)
        # Atomic-ish rename.
        tmp_path.replace(dest_path)
    except (HTTPError, URLError) as e:
        try:
            if tmp_path.exists():
                tmp_path.unlink()
        except Exception:
            pass
        raise RuntimeError(f"Audio download failed: {e}") from e
    except Exception as e:
        try:
            if tmp_path.exists():
                tmp_path.unlink()
        except Exception:
            pass
        raise RuntimeError(f"Audio download failed: {e}") from e


def get_or_download_lecture_audio_webm() -> Path:
    """
    Return local cached webm path; download on-demand if missing.
    """
    # Only treat it as cached if it's big enough to be a real audio file.
    # This prevents serving truncated/corrupted downloads that cause "duration=0" failures.
    if (
        LECTURE_AUDIO_CACHE_WEBM_PATH.is_file()
        and LECTURE_AUDIO_CACHE_WEBM_PATH.stat().st_size >= MIN_AUDIO_CACHE_SIZE_BYTES
    ):
        return LECTURE_AUDIO_CACHE_WEBM_PATH

    _download_file_allowlisted(
        LECTURE_AUDIO_SOURCE_URL,
        LECTURE_AUDIO_CACHE_WEBM_PATH,
        timeout_s=30,
    )
    return LECTURE_AUDIO_CACHE_WEBM_PATH


def is_lecture_audio_cached() -> bool:
    return (
        LECTURE_AUDIO_CACHE_WEBM_PATH.is_file()
        and LECTURE_AUDIO_CACHE_WEBM_PATH.stat().st_size >= MIN_AUDIO_CACHE_SIZE_BYTES
    )


def get_lecture_audio_url() -> str:
    """
    Use local cached audio when ready; otherwise use remote source URL
    to avoid any playback edge-cases with incomplete local cache.
    """
    return LECTURE_AUDIO_URL_LOCAL if is_lecture_audio_cached() else LECTURE_AUDIO_SOURCE_URL


def _frames_from_wav(path: Path) -> tuple[bytes, int, int, int]:
    """
    Returns (frames_bytes, nframes, nchannels, sampwidth_bytes).
    We assume PCM frames are safe to concatenate/truncate.
    """
    with wave.open(str(path), "rb") as wf:
        nchannels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        nframes = wf.getnframes()
        frames = wf.readframes(nframes)
    return frames, nframes, nchannels, sampwidth


def _write_wav(path: Path, frames: bytes, *, nchannels: int, sampwidth: int, framerate: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(nchannels)
        wf.setsampwidth(sampwidth)
        wf.setframerate(framerate)
        wf.writeframes(frames)


def _generate_say_wav(text: str, out_wav: Path) -> Path:
    """
    Offline TTS: use macOS `say` to generate an AIFF, then `afconvert` to WAV.
    """
    out_wav.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        td_path = Path(td)
        in_txt = td_path / "tts.txt"
        aiff_path = td_path / "tts.aiff"
        tmp_wav = td_path / "tts.wav"

        in_txt.write_text(text, encoding="utf-8")

        # `say -o` chooses output; `-f` reads the message from a file.
        subprocess.run(
            [
                "say",
                "-v",
                _TTS_VOICE,
                "-r",
                str(_TTS_RATE_WPM),
                "-o",
                str(aiff_path),
                "-f",
                str(in_txt),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # Convert AIFF -> WAV with explicit PCM format for predictable concatenation.
        subprocess.run(
            ["afconvert", str(aiff_path), "-o", str(tmp_wav), "-d", f"LEI16@{_TTS_SAMPLE_RATE}"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # Move into place (atomic-ish).
        out_wav.write_bytes(tmp_wav.read_bytes())
    return out_wav


def get_or_generate_offline_lecture_audio_wav() -> Path:
    """
    Get cached offline audio; if missing, generate it from the bundled SRT with TTS.
    """
    if _TTS_WAV_PATH.is_file():
        return _TTS_WAV_PATH

    # Cross-platform behavior:
    # - If the offline wav isn't present, only generate on macOS where `say` + `afconvert` exist.
    # - On Windows/Linux, fail fast with a clear message (so offline use doesn't depend on TTS).
    if sys.platform != "darwin" or shutil.which("say") is None or shutil.which("afconvert") is None:
        raise FileNotFoundError(
            "Missing offline audio WAV. "
            f"Expected: {_TTS_WAV_PATH}. "
            "For cross-platform offline use, you must provide this WAV as a static file "
            "(e.g., include it in your deployment package / repo)."
        )

    srt = load_bundled_lecture_transcript_srt()
    if not srt:
        raise FileNotFoundError(f"Missing bundled SRT: {_BUNDLE_DIR / 'listening_martin_rees.en.srt'}")

    timed = parse_srt_to_timed_segments(srt, CLIP_END_SEC)
    if not timed:
        raise ValueError("Bundled SRT produced no transcript cues.")

    # Build a WAV timeline aligned to SRT cue start/end (approximate speech duration).
    combined_frames = bytearray()
    current_time = 0.0
    nchannels = 1
    sampwidth = 2  # LEI16 -> 16-bit PCM

    for start, end, seg_text in timed:
        if end <= start:
            continue

        # Ensure the generated audio timeline never exceeds the practice window.
        seg_end = min(end, CLIP_END_SEC)

        # Pad silence until this cue's original start.
        if start > current_time:
            silence_frames = int(round((start - current_time) * _TTS_SAMPLE_RATE))
            combined_frames.extend(b"\x00\x00" * silence_frames * nchannels)
            current_time = start

        cue_duration = seg_end - start
        target_frames = int(round(cue_duration * _TTS_SAMPLE_RATE))

        # Render this cue's text, then pad/truncate to match cue duration.
        with tempfile.TemporaryDirectory() as td:
            td_path = Path(td)
            tmp_wav = td_path / "cue.wav"
            _generate_say_wav(seg_text, tmp_wav)
            cue_frames_bytes, _, cue_channels, cue_sampwidth = _frames_from_wav(tmp_wav)

        if cue_channels != nchannels or cue_sampwidth != sampwidth:
            # Defensive: if platform output differs, abort rather than corrupt audio.
            raise RuntimeError("Unexpected TTS WAV format; cannot reliably concatenate.")

        actual_frames = len(cue_frames_bytes) // (sampwidth * nchannels)
        if actual_frames >= target_frames:
            cut_bytes = target_frames * sampwidth * nchannels
            combined_frames.extend(cue_frames_bytes[:cut_bytes])
        else:
            combined_frames.extend(cue_frames_bytes)
            pad_frames = target_frames - actual_frames
            combined_frames.extend(b"\x00\x00" * pad_frames * nchannels)

        current_time = seg_end

    _write_wav(_TTS_WAV_PATH, bytes(combined_frames), nchannels=nchannels, sampwidth=sampwidth, framerate=_TTS_SAMPLE_RATE)
    return _TTS_WAV_PATH

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
                "audio_url": get_lecture_audio_url(),
                "questions": out_q,
            }
        )
    return sections
