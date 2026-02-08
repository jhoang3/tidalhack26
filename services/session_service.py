"""
Phase 4: Session management and validation.
Central place to resolve session_id → keywords for transcription.
No PDF or ASR logic; prevents context leakage between sessions.
"""

from services import session_store


def get_keywords_for_transcription(session_id: str | None) -> list[str]:
    """
    Resolve session_id to the keyword list for that session only.
    Use this when starting a transcription so context is applied only when valid.

    - Missing or blank session_id → [] (transcribe without context).
    - Invalid (unknown) session_id → [] (transcribe without context).
    - Valid session_id → that session's keywords (never another session's).
    - Empty keyword list for a valid session → [] (vanilla transcription).

    Never raises; safe for any input.
    """
    if session_id is None:
        return []
    if not isinstance(session_id, str):
        return []
    normalized = session_id.strip()
    if not normalized:
        return []
    return session_store.get_keywords(normalized)


def session_valid(session_id: str | None) -> bool:
    """Return True if session_id exists in the store. For logging or responses only."""
    if session_id is None or not isinstance(session_id, str):
        return False
    return session_store.session_exists(session_id.strip())
