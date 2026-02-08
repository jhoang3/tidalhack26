"""Phase 2: POST /upload — PDF ingestion pipeline (API contract)."""

import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

import config
from services import pdf_service, session_store
from services.keywords_gemini import extract_keywords_gemini

router = APIRouter(tags=["upload"])


def _get_keywords_from_pdf(tmp_path: Path) -> list:
    """Use Gemini if enabled and key set, else spaCy. Fallback to spaCy if Gemini returns empty."""
    text = pdf_service.extract_text_from_pdf(tmp_path)
    if config.USE_GEMINI_KEYWORDS and config.GEMINI_API_KEY:
        keywords = extract_keywords_gemini(text, max_keywords=config.MAX_KEYWORDS)
        if keywords:
            return keywords
    return pdf_service.extract_keywords(text, top_n=config.MAX_KEYWORDS)


@router.post("/upload")
async def upload(
    file: UploadFile = File(..., description="PDF file (field name: file or pdf)"),
):
    """
    Accept a PDF upload (multipart/form-data), extract text, identify technical
    vocabulary via NLP, store keywords in memory under a new session_id.
    Uses Gemini when USE_GEMINI_KEYWORDS=true and GEMINI_API_KEY is set; otherwise spaCy.
    Returns session_id, keywords, and status per API contract.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, detail="Expected a PDF file")
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)
    try:
        keywords = _get_keywords_from_pdf(tmp_path)
        session_id = session_store.create_session(keywords)
        return {
            "session_id": session_id,
            "keywords": keywords,
            "status": "ready",
        }
    finally:
        tmp_path.unlink(missing_ok=True)
