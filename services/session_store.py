"""Simple in-memory session store."""

from uuid import uuid4

# session_id -> { "keywords": list }
_sessions: dict[str, dict] = {}


def create_session(keywords: list) -> str:
    """Create a session with the given keywords. Returns session_id."""
    session_id = str(uuid4())
    _sessions[session_id] = {"keywords": list(keywords)}
    return session_id


def get_keywords(session_id: str) -> list:
    """Return keywords for the session, or empty list if not found."""
    session = _sessions.get(session_id)
    if session is None:
        return []
    return session.get("keywords", [])
