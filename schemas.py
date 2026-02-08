"""Pydantic models for API request/response."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# --- Upload PDF ---
class UploadPdfResponse(BaseModel):
    session_id: str
    keywords: list[str] = Field(..., description="Top keywords extracted from PDF for biasing")


# --- Upload Audio ---
class TimedWord(BaseModel):
    word: str
    start: float
    end: float


class TimedSegment(BaseModel):
    transcript: str
    words: list[TimedWord] = Field(default_factory=list)


class UploadAudioResponse(BaseModel):
    transcript: str
    session_id: str
    words: list[TimedWord] = Field(default_factory=list, description="Word-level timestamps for sync-with-playback")
    segments: list[TimedSegment] = Field(default_factory=list, description="Utterance segments with punctuation")


# --- Session ---
class SessionResponse(BaseModel):
    session_id: str
    keywords: list[str] = Field(default_factory=list)
    transcript: Optional[str] = None
    status: str = Field(..., description="e.g. created, transcript_ready, done")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
