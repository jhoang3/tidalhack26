"""Speech-to-text via Deepgram (async). Supports keyword biasing for PDF-derived terms."""

import asyncio
from pathlib import Path
from typing import Optional

import config
from deepgram import Deepgram


def _mimetype_for_path(path: Path) -> str:
    ext = (path.suffix or "").lower()
    return {
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".m4a": "audio/mp4",
        ".ogg": "audio/ogg",
        ".webm": "audio/webm",
    }.get(ext, "audio/mpeg")


def _transcribe_sync(audio_path: Path, keywords: Optional[list[str]] = None) -> str:
    """Blocking Deepgram call. Run in executor from async code."""
    if not config.DEEPGRAM_API_KEY:
        raise ValueError("DEEPGRAM_API_KEY is not set. Add it to .env or api.env.")
    opts = {"api_key": config.DEEPGRAM_API_KEY}
    if config.DEEPGRAM_BASE_URL:
        opts["api_url"] = config.DEEPGRAM_BASE_URL.rstrip("/")
    client = Deepgram(opts)

    with open(audio_path, "rb") as f:
        payload_bytes = f.read()
    source = {"buffer": payload_bytes, "mimetype": _mimetype_for_path(audio_path)}

    options: dict = {"model": "nova-2", "smart_format": True}
    if keywords:
        options["keywords"] = keywords

    response = client.transcription.sync_prerecorded(source, options)
    results = (response or {}).get("results")
    if not results:
        return ""
    channels = results.get("channels") or []
    if not channels:
        return ""
    alts = (channels[0] or {}).get("alternatives") or []
    if not alts:
        return ""
    return (alts[0] or {}).get("transcript") or ""


async def transcribe_audio(
    audio_path: Path,
    keywords: Optional[list[str]] = None,
) -> str:
    """
    Transcribe pre-recorded audio with optional keyword biasing.
    Runs blocking Deepgram call in thread pool to keep FastAPI responsive.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        None,
        _transcribe_sync,
        audio_path,
        keywords,
    )
