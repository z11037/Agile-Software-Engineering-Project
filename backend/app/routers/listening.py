from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, PlainTextResponse

from app.schemas.listening import (
    ListeningLectureMetaResponse,
    ListeningPracticeResponse,
)
from app.services.listening_practice import (
    CLIP_END_SEC,
    CLIP_START_SEC,
    LECTURE_ATTRIBUTION,
    LECTURE_AUDIO_URL,
    LECTURE_SOURCE_PAGE,
    LECTURE_TITLE,
    LECTURE_TRANSCRIPT_RAW_URL,
    build_practice_sections,
    load_bundled_lecture_transcript_srt,
)

router = APIRouter(prefix="/api/listening", tags=["listening"])

# Allowlisted upstream subtitle URLs only (SSRF-safe).
ALLOWED_TRANSCRIPT_URLS: frozenset[str] = frozenset(
    {
        LECTURE_TRANSCRIPT_RAW_URL,
        # Legacy alias (short OSA clip) — kept for backwards compatibility.
        "https://commons.wikimedia.org/wiki/TimedText:CAM_Video-_2018_Nobel_Laureate_Donna_Strickland.webm.en.srt"
        "?action=raw",
    }
)

LICENSE_NOTE = (
    "Subtitles are from Wikimedia Commons under CC BY 3.0 (see `attribution` / `source_url`). "
    "For offline use, the practice audio is generated locally from these bundled subtitles via "
    "the system TTS engine."
)
CLIP_NOTE_EN = (
    "This practice uses the first ~7 minutes of the lecture audio (0:00–7:00) "
    "to match a 5–8 minute listening session; the full recording is longer."
)


def fetch_url_text(url: str) -> str:
    if url not in ALLOWED_TRANSCRIPT_URLS:
        raise HTTPException(status_code=400, detail="Transcript URL is not allowlisted.")
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; EnglishLearningApp/1.0)"})
        with urlopen(req, timeout=90) as resp:
            data = resp.read()
        return data.decode("utf-8", errors="replace")
    except HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Upstream HTTP error: {e.code}") from e
    except URLError as e:
        raise HTTPException(status_code=502, detail=f"Upstream URL error: {e.reason}") from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream fetch failed: {e}") from e


def get_lecture_transcript_srt_text() -> str:
    """Prefer bundled SRT so practice works without reaching Wikimedia (SSL / firewall safe)."""
    bundled = load_bundled_lecture_transcript_srt()
    if bundled is not None:
        return bundled
    return fetch_url_text(LECTURE_TRANSCRIPT_RAW_URL)


@router.get("/lecture", response_model=ListeningLectureMetaResponse)
def get_lecture_meta():
    """Public lecture metadata (no question generation)."""
    return ListeningLectureMetaResponse(
        lecture_title=LECTURE_TITLE,
        attribution=LECTURE_ATTRIBUTION,
        license_note=LICENSE_NOTE,
        source_url=LECTURE_SOURCE_PAGE,
        audio_url=LECTURE_AUDIO_URL,
        clip_start_sec=CLIP_START_SEC,
        clip_end_sec=CLIP_END_SEC,
        clip_note=CLIP_NOTE_EN,
        difficulties=["easy", "medium", "hard"],
    )


@router.get("/practice", response_model=ListeningPracticeResponse)
def get_listening_practice(
    difficulty: Literal["easy", "medium", "hard"] = Query(
        ...,
        description="Question set difficulty: easy, medium, or hard.",
    ),
):
    """
    Return one full practice (4 sections × 10 questions) for the chosen difficulty,
    generated from allowlisted public lecture subtitles.
    """
    srt = get_lecture_transcript_srt_text()
    sections_raw = build_practice_sections(srt, difficulty)

    diff_label = {"easy": "Easy", "medium": "Medium", "hard": "Hard"}[difficulty]
    return ListeningPracticeResponse(
        id=f"martin-rees-newton-2012-{difficulty}",
        name=f"Public lecture listening — {diff_label}",
        difficulty=difficulty,
        lecture_title=LECTURE_TITLE,
        attribution=LECTURE_ATTRIBUTION,
        license_note=LICENSE_NOTE,
        source_url=LECTURE_SOURCE_PAGE,
        clip_start_sec=CLIP_START_SEC,
        clip_end_sec=CLIP_END_SEC,
        clip_note=CLIP_NOTE_EN,
        sections=sections_raw,
    )


@router.get("/transcript/example", response_class=PlainTextResponse)
def get_example_transcript():
    """Raw English SRT for the default practice lecture (Martin Rees / IoP)."""
    return get_lecture_transcript_srt_text()


@router.get("/audio.wav")
def get_lecture_audio_wav():
    """
    Offline-first audio endpoint.
    If the bundled offline WAV doesn't exist yet, the backend generates it from the bundled SRT.
    """
    try:
        from app.services.listening_practice import get_or_generate_offline_lecture_audio_wav

        audio_path = get_or_generate_offline_lecture_audio_wav()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Offline audio generation failed: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Offline audio generation failed: {e}") from e

    return FileResponse(str(audio_path), media_type="audio/wav", filename="listening.wav")
