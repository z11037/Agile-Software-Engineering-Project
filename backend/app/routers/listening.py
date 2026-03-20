from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

router = APIRouter(prefix="/api/listening", tags=["listening"])

# Open academic source (Wikimedia Commons). These URLs are fixed to avoid SSRF.
EXAMPLE_TRANSCRIPT_URL = (
    "https://commons.wikimedia.org/wiki/TimedText:CAM_Video-_2018_Nobel_Laureate_Donna_Strickland.webm.en.srt"
    "?action=raw"
)


def fetch_url_text(url: str) -> str:
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req, timeout=30) as resp:
            data = resp.read()
        return data.decode("utf-8", errors="replace")
    except HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Upstream HTTP error: {e.code}")
    except URLError as e:
        raise HTTPException(status_code=502, detail=f"Upstream URL error: {e.reason}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream fetch failed: {e}")


@router.get("/transcript/example", response_class=PlainTextResponse)
def get_example_transcript():
    # Return raw SRT text; the frontend parses it.
    return fetch_url_text(EXAMPLE_TRANSCRIPT_URL)

