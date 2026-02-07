# LectureBridge

**Context-Aware Live Captioning for Accessible Education**

*Hackathon Track: Accessibility / Education / AI*

---

## Overview

LectureBridge is a real-time web application that delivers hyper-accurate, context-aware captions for university lectures. By "studying" course material before the lecture begins, the system overcomes the limitations of standard captioning tools—which often misrecognize technical jargon and heavy accents—making education more accessible for non-native speakers and Hard-of-Hearing students.

---

## The Problem

University lectures are often inaccessible for:

- **Non-native speakers** struggling with rapid speech and unfamiliar terminology
- **Hard-of-Hearing students** relying on captioning that fails in technical contexts

Standard captioning tools lack context. Terms like "Navier-Stokes" become "Navy Stock," and heavy accents cause cascading errors. Generic Speech-to-Text models simply don't know the vocabulary of your course.

---

## The Solution

LectureBridge learns **before** the lecture begins. Upload a syllabus or slide deck (PDF), and the system:

1. **Extracts** technical terms and proper nouns using NLP
2. **Biases** the Speech-to-Text model (Deepgram) with these keywords
3. **Delivers** context-aware captions in a high-contrast, accessibility-focused UI

---

## Key Features

| Feature | Description |
|--------|-------------|
| **Syllabus Injection** | Drag-and-drop a PDF to instantly extract technical terms and proper nouns using NLP |
| **Context-Aware Transcription** | Uses Deepgram's "Keywords" feature to bias the model towards the extracted vocabulary |
| **"Flicker-Fix" UI** | Interim results (gray, low latency) snap to Final results (black, high accuracy) with smooth animations to reduce cognitive load |
| **Visual Confidence** | Keywords found in the syllabus are highlighted (Gold/Bold) to confirm the AI is working |
| **Accessibility First** | Dark-mode, high-contrast interface designed for readability |

---

## Tech Stack

### Frontend (Client)

- **Framework:** React (Vite) + TypeScript
- **Styling:** Tailwind CSS + Lucide React (Icons)
- **State Management:** Zustand (for high-frequency WebSocket updates without re-renders)
- **Animations:** Framer Motion (for the "Flicker-Fix" text stabilization)
- **Audio Capture:** Native MediaRecorder API (Timeslice: 250ms, MimeType: audio/webm)
- **Networking:** Native WebSocket API + fetch for file upload

### Backend (Server)

- **Language:** Python 3.10+
- **API Framework:** FastAPI (Async) + Uvicorn
- **Speech-to-Text:** Deepgram SDK (Nova-2 Model)
- **PDF Processing:** PyMuPDF (fitz) for text extraction
- **NLP:** spaCy (en_core_web_sm) for keyword/entity extraction
- **Session Storage:** In-memory Python dictionary (maps session_id → keywords)

---

## Architecture & Data Flow

### 1. Injection Phase (REST)

```
Client uploads PDF → POST /upload
Server extracts text → runs NLP → saves keywords to sessions[id]
Server returns { session_id: "xyz", status: "ready" }
```

### 2. Streaming Phase (WebSocket)

```
Client connects → ws://api/listen?session_id=xyz
Server initializes Deepgram with stored keywords for that session
Client records audio chunks → sends blobs over socket
Server proxies audio → Deepgram → receives text → sends JSON back to Client
```

### 3. Rendering Phase (Client)

```
Client receives { is_final: boolean, text: string }
  ├─ is_final=false → Update "Gray" interim text buffer
  └─ is_final=true  → Append to "Black" transcript history, clear buffer
```

---

## UI/UX Design Specifications

**Theme:** Dark Mode (Background: `#0f172a`, Text: `#f8fafc`)

**Layout:**

- **Sidebar:** PDF Upload Zone (Dropzone), List of "Detected Keywords"
- **Main Stage:** Large, scrolling transcript area
- **Control Bar:** Start/Stop Recording button (Red pulse animation), Audio Waveform visualizer

**Visual Polish:**

- AnimatePresence (Framer Motion) when text changes state to prevent jarring jumps
- Keywords highlighted in Yellow/Gold (`text-yellow-400`) to show "Context Awareness"

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.10+
- [Deepgram API Key](https://deepgram.com/)

### Backend Setup

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn deepgram-sdk pymupdf spacy python-dotenv

# Download spaCy language model
python -m spacy download en_core_web_sm

# Create .env file with your API key
echo DEEPGRAM_API_KEY=your_api_key_here > .env

# Run the server
uvicorn main:app --reload
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DEEPGRAM_API_KEY` | Your Deepgram API key for Speech-to-Text |

---

## License

MIT

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
