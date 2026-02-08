"""
Phase 3: Speech-to-text via Deepgram (prerecorded).
Keyword biasing from Phase 2 vocabulary. Blocking calls offloaded with asyncio.to_thread.
"""

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


def _transcribe_sync(
    audio_path: Path,
    keywords: Optional[list[str]] = None,
) -> tuple[str, Optional[float]]:
    """
    Blocking Deepgram prerecorded transcription with optional keyword biasing.
    Returns (transcript, confidence or None).
    """
    if not config.DEEPGRAM_API_KEY:
        raise ValueError("DEEPGRAM_API_KEY is not set. Add it to .env or api.env.")
    opts: dict = {"api_key": config.DEEPGRAM_API_KEY}
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
        return ("", None)
    channels = results.get("channels") or []
    if not channels:
        return ("", None)
    alts = (channels[0] or {}).get("alternatives") or []
    if not alts:
        return ("", None)
    first = alts[0] or {}
    transcript = first.get("transcript") or ""
    confidence = first.get("confidence")
    if confidence is not None and not isinstance(confidence, (int, float)):
        confidence = None
    return (transcript, confidence)


async def transcribe_audio(
    audio_path: Path,
    keywords: Optional[list[str]] = None,
) -> tuple[str, Optional[float]]:
    """
    Transcribe pre-recorded audio with optional keyword biasing.
    Offloads blocking Deepgram call via asyncio.to_thread.
    Returns (transcript, confidence or None).
    """
    return await asyncio.to_thread(_transcribe_sync, audio_path, keywords)
