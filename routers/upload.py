"""POST /upload-pdf and POST /upload-audio."""

import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

import config
from schemas import UploadAudioResponse, UploadPdfResponse
from services import asr_service, pdf_service, session_store

router = APIRouter(prefix="", tags=["upload"])


@router.post("/upload-pdf", response_model=UploadPdfResponse)
async def upload_pdf(file: UploadFile = File(..., description="PDF file")):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, detail="Expected a PDF file")
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)
    try:
        keywords = pdf_service.process_pdf(tmp_path, top_n=config.KEYWORDS_TOP_N)
        session_id = session_store.create_session(keywords)
        return UploadPdfResponse(session_id=session_id, keywords=keywords)
    finally:
        tmp_path.unlink(missing_ok=True)


@router.post("/upload-audio", response_model=UploadAudioResponse)
async def upload_audio(
    file: UploadFile = File(..., description="Audio file (MP3/WAV)"),
    session_id: str | None = Form(None),
    bias_keywords: str | None = Form(None, description="Comma-separated keywords for biasing"),
):
    if not file.filename:
        raise HTTPException(400, detail="Expected an audio file")
    ext = (Path(file.filename).suffix or "").lower()
    if ext not in (".mp3", ".wav", ".m4a", ".ogg", ".webm"):
        raise HTTPException(400, detail="Unsupported audio format. Use MP3, WAV, etc.")
    # Resolve keywords: explicit bias_keywords > session keywords
    keywords = None
    if bias_keywords:
        keywords = [k.strip() for k in bias_keywords.split(",") if k.strip()]
    if not keywords and session_id:
        sess = session_store.get_session(session_id)
        if sess:
            keywords = sess.get("keywords") or []
    if not keywords:
        keywords = None
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)
    try:
        try:
            transcript = await asr_service.transcribe_audio(tmp_path, keywords=keywords)
        except ValueError as e:
            raise HTTPException(503, detail=str(e))  # e.g. missing DEEPGRAM_API_KEY
        if session_id:
            session_store.update_session_transcript(session_id, transcript)
        else:
            session_id = session_store.create_session([])
            session_store.update_session_transcript(session_id, transcript)
        return UploadAudioResponse(transcript=transcript, session_id=session_id)
    finally:
        tmp_path.unlink(missing_ok=True)
