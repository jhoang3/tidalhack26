"""
Phase 2: PDF ingestion pipeline.
Extract text with PyMuPDF; use spaCy to identify high-signal technical vocabulary.
No OCR, no persistence, no embeddings.
"""

from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF
import spacy
from collections import Counter

# Generic academic filler terms to exclude (lowercase)
FILLER_TERMS: frozenset[str] = frozenset({
    "introduction", "chapter", "figure", "example", "section", "page",
    "content", "course", "syllabus", "lecture", "week", "assignment",
    "reading", "exam", "quiz", "homework", "class", "professor",
    "instructor", "student", "reference", "appendix", "index",
    "table", "notes", "summary", "overview", "objectives", "outline",
    "schedule", "policy", "grading", "textbook", "materials",
})

_nlp: Optional[spacy.Language] = None


def _get_nlp() -> spacy.Language:
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract all readable text from the PDF (no OCR). Assumes slides/syllabi."""
    doc = fitz.open(pdf_path)
    try:
        return " ".join(page.get_text() for page in doc)
    finally:
        doc.close()


def extract_keywords(
    text: str,
    top_n: int = 50,
    min_length: int = 5,
    filler_terms: Optional[frozenset[str]] = None,
) -> list[str]:
    """
    Lightweight NLP: NOUN and PROPN only, lowercase, length and alphabetic filters,
    remove filler terms, rank by frequency, return top N.
    """
    if not text.strip():
        return []
    filler = filler_terms or FILLER_TERMS
    nlp = _get_nlp()
    doc = nlp(text)
    counts: Counter[str] = Counter()

    for token in doc:
        if token.pos_ not in ("NOUN", "PROPN"):
            continue
        word = token.text.strip().lower()
        if len(word) < min_length:
            continue
        if not word.isalpha():
            continue
        if word in filler:
            continue
        counts[word] += 1

    return [term for term, _ in counts.most_common(top_n)]


def process_pdf(pdf_path: Path, top_n: int = 50) -> list[str]:
    """Full pipeline: extract text, then return top technical keywords."""
    text = extract_text_from_pdf(pdf_path)
    return extract_keywords(text, top_n=top_n)
