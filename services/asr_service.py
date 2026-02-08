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
) -> tuple[str, Optional[float], list[dict], list[dict]]:
    """
    Blocking Deepgram prerecorded transcription with optional keyword biasing.
    Returns (transcript, confidence or None, words with timestamps).
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

    options: dict = {
        "model": "nova-2",
        "smart_format": True,
        "utterances": True,
        "punctuate": True,
    }
    if keywords:
        options["keywords"] = keywords

    response = client.transcription.sync_prerecorded(source, options)
    results = (response or {}).get("results")
    if not results:
        return ("", None, [], [])

    # Extract transcript and confidence from channels
    channels = results.get("channels") or []
    alts = (channels[0] or {}).get("alternatives") or [] if channels else []
    first = (alts[0] or {}) if alts else {}
    transcript = first.get("transcript") or ""
    confidence = first.get("confidence")
    if confidence is not None and not isinstance(confidence, (int, float)):
        confidence = None

    # Extract utterances as segments (transcript + words with timestamps)
    segments: list[dict] = []
    words: list[dict] = []  # flat list for backward compat
    for utt in results.get("utterances") or []:
        seg_words: list[dict] = []
        for w in utt.get("words") or []:
            raw = w.get("word")
            if not raw:
                continue
            display = w.get("punctuated_word") or raw
            word_data = {
                "word": display,
                "start": float(w.get("start", 0)),
                "end": float(w.get("end", 0)),
            }
            seg_words.append(word_data)
            words.append(word_data)
        utt_transcript = utt.get("transcript") or " ".join(w["word"] for w in seg_words)
        segments.append({"transcript": utt_transcript, "words": seg_words})

    return (transcript, confidence, words, segments)


async def transcribe_audio(
    audio_path: Path,
    keywords: Optional[list[str]] = None,
) -> tuple[str, Optional[float], list[dict], list[dict]]:
    """
    Transcribe pre-recorded audio with optional keyword biasing.
    Offloads blocking Deepgram call via asyncio.to_thread.
    Returns (transcript, confidence or None, words, segments).
    """
    return await asyncio.to_thread(_transcribe_sync, audio_path, keywords)
