"""Router: /transcribe"""

from fastapi import APIRouter

router = APIRouter(tags=["transcribe"])


@router.post("/transcribe")
async def transcribe():
    """Transcribe audio (logic not implemented)."""
    return {"message": "transcribe not implemented"}
