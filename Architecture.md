# Project Aether Architecture

## Overview

Project Aether follows a modular client-server architecture designed for low-latency conversational AI. The application captures live audio from the user's microphone, streams it to Google's Gemini Live API through a backend relay server, and plays AI-generated speech in real time. A REST-based fallback mechanism ensures continued operation if the primary streaming connection becomes unavailable.

---

## High-Level Architecture

```
                    +----------------------+
                    |     Next.js Client   |
                    |----------------------|
                    | • User Interface     |
                    | • Audio Capture      |
                    | • Audio Playback     |
                    | • Session History    |
                    +----------+-----------+
                               |
                         WebSocket
                               |
                    +----------+-----------+
                    | Node.js + Express    |
                    |----------------------|
                    | • WebSocket Relay    |
                    | • Connection Manager |
                    | • Fallback Manager   |
                    +----------+-----------+
                               |
                 +-------------+--------------+
                 |                            |
                 ▼                            ▼
        Gemini Live API             Gemini 2.5 Flash REST API
      (Primary AI Engine)         (Fallback AI Engine)
```

---

## Real-Time Audio Pipeline

1. The user grants microphone access.
2. Audio is captured using the Web Audio API.
3. Raw Float32 audio samples are converted into 16-bit PCM.
4. PCM audio is Base64 encoded.
5. Audio chunks are streamed to the backend over WebSockets.
6. The backend forwards audio to the Gemini Live API.
7. Gemini streams synthesized speech back to the backend.
8. The frontend decodes and schedules playback using a dedicated AudioContext.

---

## Automatic Fallback Flow

If the persistent Gemini Live WebSocket connection becomes unavailable:

1. Audio chunks are buffered locally on the backend.
2. Buffered audio is combined into a single request.
3. The request is sent to the Gemini 2.5 Flash REST API.
4. The generated response is returned to the frontend.
5. Audio playback resumes without terminating the user session.

---

## Frontend Components

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Web Audio API
- Custom Hooks:
  - useAudioStream
  - useWebSocket

---

## Backend Components

- Node.js
- Express
- WebSocket Server
- Gemini Live API Relay
- REST Fallback Handler

---

## Session Management

Conversation history is stored in client-side React state during the active session. No external database is used in the current implementation.

---

## Playback Interruption

When the user begins speaking while the assistant is still responding:

- Current playback is stopped immediately.
- Audio queues are cleared.
- Playback timers are reset.
- A new recording session begins.

This allows natural conversational turn-taking.

---

## Design Goals

- Low-latency communication
- Modular architecture
- Reliable fallback handling
- Clean separation of frontend and backend
- Responsive user experience