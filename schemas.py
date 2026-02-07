"""Pydantic models for API request/response."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# --- Upload PDF ---
class UploadPdfResponse(BaseModel):
    session_id: str
    keywords: list[str] = Field(..., description="Top keywords extracted from PDF for biasing")


# --- Upload Audio ---
class UploadAudioResponse(BaseModel):
    transcript: str
    session_id: str


# --- Session ---
class SessionResponse(BaseModel):
    session_id: str
    keywords: list[str] = Field(default_factory=list)
    transcript: Optional[str] = None
    status: str = Field(..., description="e.g. created, transcript_ready, done")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
