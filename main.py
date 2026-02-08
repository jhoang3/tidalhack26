"""
FastAPI app. Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import listen, upload, upload_pdf, transcribe

app = FastAPI(
    title="Audio-ASR + PDF Pipeline",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev
        "http://localhost:5174",
        "http://localhost:5175",  # Vite fallback when 5173/5174 in use
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(upload_pdf.router)
app.include_router(upload.router)
app.include_router(transcribe.router)
app.include_router(listen.router)


@app.get("/")
async def root():
    return {"service": "audio-asr-pdf-pipeline", "docs": "/docs"}
