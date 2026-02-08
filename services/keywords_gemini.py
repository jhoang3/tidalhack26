"""
Optional: extract keywords using the Gemini API (google-genai package).
Used when GEMINI_API_KEY is set in api.env.
"""

import json
import re
from typing import Optional

import config

_GEMINI_AVAILABLE: Optional[bool] = None
_LAST_ERROR: Optional[str] = None


def get_last_error() -> Optional[str]:
    """Return the last error message from Gemini extraction (for debugging)."""
    return _LAST_ERROR


def _gemini_available() -> bool:
    global _GEMINI_AVAILABLE
    if _GEMINI_AVAILABLE is not None:
        return _GEMINI_AVAILABLE
    if not config.GEMINI_API_KEY:
        _GEMINI_AVAILABLE = False
        return False
    try:
        from google import genai  # type: ignore
        genai.Client(api_key=config.GEMINI_API_KEY)
        _GEMINI_AVAILABLE = True
    except Exception:
        _GEMINI_AVAILABLE = False
    return _GEMINI_AVAILABLE


def _get_response_text(response) -> Optional[str]:
    """Get generated text from response (handles both .text and candidates[].content.parts)."""
    if response is None:
        return None
    text = getattr(response, "text", None)
    if text is not None and str(text).strip():
        return str(text).strip()
    candidates = getattr(response, "candidates", None) or []
    if not candidates:
        return None
    content = getattr(candidates[0], "content", None)
    if content is None:
        return None
    parts = getattr(content, "parts", None) or []
    for part in parts:
        t = getattr(part, "text", None)
        if t is not None and str(t).strip():
            return str(t).strip()
    return None


def extract_keywords_gemini(
    text: str,
    max_keywords: int = 50,
) -> list[str]:
    """
    Use Gemini to extract technical terms and phrases from text, suitable for
    speech recognition keyword biasing. Returns a list of strings (words and short phrases).
    Returns [] if API key is missing, package not installed, or on error.
    """
    global _LAST_ERROR
    _LAST_ERROR = None
    if not text or not text.strip():
        return []
    if not _gemini_available():
        return []
    try:
        from google import genai  # type: ignore
        from google.genai import types  # type: ignore
    except ImportError as e:
        _LAST_ERROR = f"Import error: {e}. Run: pip install google-genai"
        return []

    prompt = f"""You are helping prepare a keyword list for speech-to-text (ASR) biasing.
Extract from the following syllabus/lecture text the most important technical terms.
You MUST include BOTH:
1. Single-word terms (real words the lecturer will say): e.g. "graph", "neural", "equivariant", "diffusion", "protein", "eigenvalue"
2. Multi-word phrases (2-4 words): e.g. "graph neural networks", "message passing", "radial basis functions"

Include: domain vocabulary, proper nouns, method names, acronyms (e.g. GNN, EGNN).
Exclude: generic words like "introduction", "chapter", "example", "section", "page".

Return ONLY a JSON array of strings, one keyword per element, lowercase. No other text.
Maximum {max_keywords} items. Mix single words and phrases. Example: ["graph", "neural network", "equivariant", "message passing", "diffusion", "node classification"]

Text:
---
{text[:30000]}
---"""

    # Use stable model IDs from https://ai.google.dev/gemini-api/docs/models (gemini-1.5-flash is deprecated/removed)
    for model_name in ("gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"):
        try:
            client = genai.Client(api_key=config.GEMINI_API_KEY)
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=2048,
                ),
            )
            raw = _get_response_text(response)
            if not raw:
                continue
            if raw.startswith("```"):
                raw = re.sub(r"^```(?:json)?\s*", "", raw)
                raw = re.sub(r"\s*```$", "", raw)
            data = json.loads(raw)
            if not isinstance(data, list):
                continue
            result = []
            for item in data:
                if isinstance(item, str) and item.strip():
                    result.append(item.strip().lower())
                if len(result) >= max_keywords:
                    break
            return result
        except json.JSONDecodeError as e:
            _LAST_ERROR = f"Gemini returned invalid JSON ({model_name}): {e}"
        except Exception as e:
            _LAST_ERROR = f"Gemini error ({model_name}): {e}"
            continue
    return []
