"""WebSocket /listen — Live streaming transcription with Deepgram."""

import asyncio
import json
import logging

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

import config
from deepgram import Deepgram
from services import session_store

router = APIRouter(tags=["listen"])
logger = logging.getLogger(__name__)


@router.websocket("/listen")
async def websocket_listen(
    websocket: WebSocket,
    session_id: str | None = Query(None, description="Session ID for keyword biasing"),
):
    """
    Accept WebSocket connection, stream audio to Deepgram, forward transcripts.
    Client sends binary audio (webm); server sends JSON { is_final, text, confidence }.
    """
    await websocket.accept()
    logger.info("WebSocket /listen accepted")

    if not config.DEEPGRAM_API_KEY:
        logger.error("DEEPGRAM_API_KEY not configured")
        await websocket.close(code=1011, reason="DEEPGRAM_API_KEY not configured")
        return

    keywords = []
    if session_id:
        sess = session_store.get_session(session_id)
        if sess:
            keywords = sess.get("keywords") or []

    opts = {"api_key": config.DEEPGRAM_API_KEY}
    if config.DEEPGRAM_BASE_URL:
        opts["api_url"] = config.DEEPGRAM_BASE_URL.rstrip("/")
    dg = Deepgram(opts)

    live_options = {
        "punctuate": True,
        "interim_results": True,
        "smart_format": True,
        "encoding": "linear16",
        "sample_rate": 48000,
    }
    if keywords:
        live_options["keywords"] = keywords

    dg_socket = None
    bytes_received = 0
    try:
        dg_socket = await dg.transcription.live(live_options)
        logger.info("Connected to Deepgram live API")

        async def on_transcript(data: dict) -> None:
            if "channel" not in data:
                return
            alts = data.get("channel", {}).get("alternatives") or []
            if not alts:
                return
            transcript = (alts[0] or {}).get("transcript", "").strip()
            if not transcript:
                return
            msg = {
                "is_final": data.get("is_final", False),
                "text": transcript,
                "confidence": (alts[0] or {}).get("confidence"),
            }
            try:
                await websocket.send_text(json.dumps(msg))
                logger.debug("Sent transcript: %r", transcript[:50])
            except Exception as e:
                logger.warning("Failed to send transcript: %s", e)

        def handle_transcript(body) -> None:
            if isinstance(body, dict):
                asyncio.create_task(on_transcript(body))

        dg_socket.register_handler(
            dg_socket.event.TRANSCRIPT_RECEIVED,
            handle_transcript,
        )

        def handle_error(body) -> None:
            logger.error("Deepgram error: %s", body)

        dg_socket.register_handler(dg_socket.event.ERROR, handle_error)

        while True:
            msg = await websocket.receive()
            if "bytes" in msg:
                data = msg["bytes"]
                bytes_received += len(data)
                dg_socket.send(data)
            elif "text" in msg:
                logger.warning("Received text instead of bytes, ignoring")
            elif msg.get("type") == "websocket.disconnect":
                break

    except WebSocketDisconnect:
        logger.info("Client disconnected (bytes_received=%d)", bytes_received)
    except Exception as e:
        logger.exception("Listen error: %s", e)
        try:
            await websocket.close(code=1011, reason=str(e)[:123])
        except Exception:
            pass
    finally:
        try:
            if dg_socket is not None:
                await dg_socket.finish()
        except Exception as e:
            logger.warning("Deepgram finish: %s", e)
        try:
            await websocket.close()
        except Exception:
            pass
        logger.info("WebSocket /listen closed (bytes_received=%d)", bytes_received)
