"""Simple in-memory session store."""

from datetime import datetime
from uuid import uuid4

# session_id -> { "keywords": list, "transcript": str | None, "status": str, ... }
_sessions: dict[str, dict] = {}


def create_session(keywords: list) -> str:
    """Create a session with the given keywords. Returns session_id."""
    session_id = str(uuid4())
    now = datetime.utcnow()
    _sessions[session_id] = {
        "keywords": list(keywords),
        "transcript": None,
        "status": "created",
        "created_at": now,
        "updated_at": now,
    }
    return session_id


def get_session(session_id: str) -> dict | None:
    """Return the full session dict, or None if not found."""
    if not session_id or not isinstance(session_id, str):
        return None
    sess = _sessions.get(session_id.strip())
    if sess is None:
        return None
    return {"session_id": session_id.strip(), **sess}


def update_session_transcript(session_id: str, transcript: str) -> None:
    """Update the session with the transcript and set status to transcript_ready."""
    if not session_id or not isinstance(session_id, str):
        return
    sid = session_id.strip()
    if sid in _sessions:
        _sessions[sid]["transcript"] = transcript
        _sessions[sid]["status"] = "transcript_ready"
        _sessions[sid]["updated_at"] = datetime.utcnow()


def session_exists(session_id: str) -> bool:
    """Return True if the session_id exists in the store."""
    if not session_id or not isinstance(session_id, str):
        return False
    return session_id.strip() in _sessions


def get_keywords(session_id: str) -> list:
    """Return keywords for the session, or empty list if not found."""
    if not session_id or not isinstance(session_id, str):
        return []
    session = _sessions.get(session_id.strip())
    if session is None:
        return []
    return list(session.get("keywords", []))  # copy to avoid mutation
