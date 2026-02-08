"""Load settings from environment using python-dotenv."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env (and optionally api.env) from project root
_root = Path(__file__).resolve().parent
load_dotenv(dotenv_path=_root / ".env")
load_dotenv(dotenv_path=_root / "api.env")

# API
DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "").strip()
DEEPGRAM_BASE_URL: str | None = os.getenv("DEEPGRAM_BASE_URL", "").strip() or None

# Optional: Gemini for keyword extraction
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
# Use Gemini for keywords when key is set (set to "false" or "0" to use spaCy instead)
USE_GEMINI_KEYWORDS: bool = os.getenv("USE_GEMINI_KEYWORDS", "true").strip().lower() not in ("false", "0", "no")

# Limits (defaults)
MAX_AUDIO_MB: int = int(os.getenv("MAX_AUDIO_MB", "25"))
MAX_KEYWORDS: int = int(os.getenv("MAX_KEYWORDS", "20"))
