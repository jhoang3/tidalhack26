# LectureBridge API Contract

**Purpose:** This document defines the interface between the LectureBridge frontend and backend. Share this with the backend developer to ensure consistency.

---

## Base URL

- **Development:** Frontend expects backend at `http://localhost:8000` (configurable via `VITE_API_URL`)
- **WebSocket:** Derived from HTTP base — `http://localhost:8000` → `ws://localhost:8000`

---

## 1. PDF Upload (REST)

### Endpoint

```
POST /upload
```

### Request

- **Content-Type:** `multipart/form-data`
- **Body:** Single file field containing a PDF
  - Field name: `file` (or `pdf` — frontend can use either)
  - Accept: `application/pdf`

### Response (Success)

**Status:** `200 OK`

**Content-Type:** `application/json`

```json
{
  "session_id": "string",
  "keywords": ["string"],
  "status": "ready"
}
```

| Field       | Type     | Required | Description                          |
|------------|----------|----------|--------------------------------------|
| `session_id` | string   | Yes      | Unique identifier for this session   |
| `keywords` | string[] | Yes      | Extracted technical terms for biasing |
| `status`   | string   | No       | e.g. `"ready"`                       |

### Response (Error)

**Status:** `4xx` or `5xx`

**Content-Type:** `application/json`

```json
{
  "detail": "Error message"
}
```

### CORS

- Allow origin: `http://localhost:5173` (Vite dev) and `http://localhost:5174`
- Allow methods: `POST`, `OPTIONS`
- Allow headers: `Content-Type` (or omit for multipart — browser sends automatically)

---

## 2. Live Transcription (WebSocket)

### Endpoint

```
GET /listen?session_id={session_id}
```

- **Protocol:** `ws` (or `wss` in production)
- **Example:** `ws://localhost:8000/listen?session_id=abc123`

### Client → Server (Audio Stream)

- **Format:** Binary `Blob` (audio data)
- **Encoding:** `audio/webm` (Opus codec preferred)
- **Chunk size:** ~250ms of audio per message
- **Behavior:** Client sends chunks continuously while recording

### Server → Client (Transcript)

- **Format:** UTF-8 JSON text messages
- **Shape:** One JSON object per message

```json
{
  "is_final": false,
  "text": "partial transcribed text"
}
```

```json
{
  "is_final": true,
  "text": "final transcribed sentence",
  "confidence": 0.95
}
```

| Field        | Type    | Required | Description                                      |
|-------------|---------|----------|--------------------------------------------------|
| `is_final`  | boolean | Yes      | `false` = interim (may change), `true` = final   |
| `text`      | string  | Yes      | Transcribed text                                 |
| `confidence`| number  | No       | 0–1, used if provided                            |

### Connection Lifecycle

- Client connects when user clicks "Start"
- Client sends audio blobs as they become available
- Server sends transcript messages as Deepgram returns them
- Client disconnects when user clicks "Stop"

### Error Handling

- If `session_id` is invalid: close with code 4xxx and optional reason
- If audio format is unsupported: close with appropriate code

---

## 3. Session Semantics

- Each `session_id` from `POST /upload` maps to a set of keywords stored server-side
- When the client connects to `/listen?session_id=X`, the server uses those keywords to bias the speech-to-text model (e.g. Deepgram "keywords" feature)
- Session can be ephemeral (in-memory) for MVP

---

## 4. Summary Checklist for Backend

- [ ] `POST /upload` accepts `multipart/form-data` with PDF
- [ ] Response includes `session_id` and `keywords`
- [ ] `GET /listen?session_id=X` upgrades to WebSocket
- [ ] Server accepts binary audio blobs from client
- [ ] Server sends JSON `{ is_final, text }` (and optionally `confidence`) to client
- [ ] CORS enabled for frontend origin(s)
- [ ] WebSocket URL: `ws://{host}/listen?session_id={id}`

---

## 5. Testing Without Backend

The frontend has a **Fake Mode** toggle that simulates transcript messages. Use it to test the UI without a running backend.
