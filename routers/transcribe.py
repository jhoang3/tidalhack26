"""Phase 3: POST /transcribe — Audio transcription with context-aware keyword biasing."""

import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

import config
from services import asr_service, session_service

router = APIRouter(tags=["transcribe"])

MAX_BYTES = config.MAX_AUDIO_MB * 1024 * 1024


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(..., description="MP3 audio file"),
    session_id: str | None = Query(None, description="Session from Phase 2 for keyword biasing"),
):
    """
    Accept an MP3 upload and optional session_id. Session validation and keyword
    resolution are handled by Phase 4; missing or invalid session_id results in
    transcription without context. Returns transcript, confidence, and keywords_used.
    """
    if not file or not file.filename or not file.filename.lower().endswith(".mp3"):
        raise HTTPException(400, detail="Expected an MP3 file (audio/mpeg)")
    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(
            413,
            detail=f"Audio file exceeds maximum size of {config.MAX_AUDIO_MB} MB",
        )
    # Phase 4: single place for session validation and keyword resolution (no context leakage)
    keywords_used: list[str] = session_service.get_keywords_for_transcription(session_id)

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    try:
        try:
            transcript_text, confidence, _, _ = await asr_service.transcribe_audio(
                tmp_path,
                keywords=keywords_used if keywords_used else None,
            )
        except ValueError as e:
            raise HTTPException(503, detail=str(e))
        return {
            "transcript": transcript_text,
            "confidence": confidence,
            "keywords_used": keywords_used,
        }
    finally:
        tmp_path.unlink(missing_ok=True)
