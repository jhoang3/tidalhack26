#!/usr/bin/env python3
"""
Compare keyword extraction: spaCy vs Gemini on the same PDF.
Run from project root:  python scripts/compare_keywords.py path/to/syllabus.pdf

Requires:
  - GEMINI_API_KEY in .env or api.env (optional; if missing, only spaCy is run)
  - pip install google-genai  (only if using Gemini)
"""

import sys
from pathlib import Path

# Run from project root so imports work
_project_root = Path(__file__).resolve().parent.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

import config
from services import pdf_service
from services.keywords_gemini import extract_keywords_gemini, get_last_error


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python scripts/compare_keywords.py <path_to.pdf>")
        print("  Set GEMINI_API_KEY in .env or api.env to compare with Gemini.")
        sys.exit(1)
    pdf_path = Path(sys.argv[1])
    if not pdf_path.is_file():
        print(f"File not found: {pdf_path}")
        sys.exit(1)

    print("Extracting text from PDF...")
    text = pdf_service.extract_text_from_pdf(pdf_path)
    if not text.strip():
        print("No text extracted.")
        sys.exit(1)
    print(f"  Text length: {len(text)} chars\n")

    # spaCy (current pipeline)
    print("--- spaCy (current) ---")
    spacy_keywords = pdf_service.process_pdf(pdf_path, top_n=config.MAX_KEYWORDS)
    print(f"  Count: {len(spacy_keywords)}")
    print("  Keywords:", spacy_keywords[:30])
    if len(spacy_keywords) > 30:
        print(f"  ... and {len(spacy_keywords) - 30} more")
    print()

    # Gemini (optional)
    if config.GEMINI_API_KEY:
        print("--- Gemini ---")
        gemini_keywords = extract_keywords_gemini(text, max_keywords=config.MAX_KEYWORDS)
        if gemini_keywords:
            print(f"  Count: {len(gemini_keywords)}")
            print("  Keywords:", gemini_keywords[:30])
            if len(gemini_keywords) > 30:
                print(f"  ... and {len(gemini_keywords) - 30} more")
            # Simple overlap
            spacy_set = set(spacy_keywords)
            gemini_set = set(gemini_keywords)
            overlap = spacy_set & gemini_set
            only_spacy = spacy_set - gemini_set
            only_gemini = gemini_set - spacy_set
            print(f"\n  Overlap: {len(overlap)}")
            print(f"  Only in spaCy: {len(only_spacy)}")
            print(f"  Only in Gemini: {len(only_gemini)}")
        else:
            err = get_last_error()
            if err:
                print(f"  (No keywords returned: {err})")
            else:
                print("  (No keywords returned; check API key and pip install google-genai)")
    else:
        print("--- Gemini ---")
        print("  Skipped (GEMINI_API_KEY not set). Add it to .env or api.env to compare.")


if __name__ == "__main__":
    main()
