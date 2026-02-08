"""Simple in-memory session store."""

from uuid import uuid4

# session_id -> { "keywords": list }
_sessions: dict[str, dict] = {}


def create_session(keywords: list) -> str:
    """Create a session with the given keywords. Returns session_id."""
    session_id = str(uuid4())
    _sessions[session_id] = {"keywords": list(keywords)}
    return session_id


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
