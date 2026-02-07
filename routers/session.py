"""GET /session/{session_id}."""

from fastapi import APIRouter, HTTPException

from schemas import SessionResponse
from services import session_store

router = APIRouter(prefix="", tags=["session"])


@router.get("/session/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    sess = session_store.get_session(session_id)
    if not sess:
        raise HTTPException(404, detail="Session not found")
    return SessionResponse(
        session_id=sess["session_id"],
        keywords=sess.get("keywords") or [],
        transcript=sess.get("transcript"),
        status=sess.get("status", "unknown"),
        created_at=sess.get("created_at"),
        updated_at=sess.get("updated_at"),
    )
