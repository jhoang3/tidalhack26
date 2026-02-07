"""Phase 2: POST /upload — PDF ingestion pipeline (API contract)."""

import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

import config
from services import pdf_service, session_store

router = APIRouter(tags=["upload"])


@router.post("/upload")
async def upload(
    file: UploadFile = File(..., description="PDF file (field name: file or pdf)"),
):
    """
    Accept a PDF upload (multipart/form-data), extract text, identify technical
    vocabulary via NLP, store keywords in memory under a new session_id.
    Returns session_id, keywords, and status per API contract.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, detail="Expected a PDF file")
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)
    try:
        keywords = pdf_service.process_pdf(tmp_path, top_n=config.MAX_KEYWORDS)
        session_id = session_store.create_session(keywords)
        return {
            "session_id": session_id,
            "keywords": keywords,
            "status": "ready",
        }
    finally:
        tmp_path.unlink(missing_ok=True)
