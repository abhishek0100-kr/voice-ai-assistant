# Project Aether

### Real-Time Conversational Voice AI Assistant

Project Aether is a low-latency, full-duplex conversational voice assistant that enables natural voice interactions using Google's Gemini Live API. The application captures live microphone input, streams audio through a secure WebSocket relay, and delivers real-time AI-generated voice responses with an automatic fallback mechanism for improved reliability.

The project was built with a strong emphasis on responsiveness, modular architecture, and user experience while maintaining a clean separation between the frontend, backend, and AI communication layers.

---

## Features

- 🎤 Real-time microphone audio capture
- 🔊 Streaming AI voice responses
- ⚡ Full-duplex WebSocket communication
- 🔄 Automatic REST fallback on connection failures
- 🎯 Low-latency audio streaming architecture
- 🛑 Instant interruption of AI speech during new user input
- 📜 Session history tracking
- 🎨 Modern responsive user interface
- 🧩 Modular TypeScript architecture
- 🔒 Secure backend API key management

---

## System Architecture

```

                    +----------------------+
                    |     Next.js Client   |
                    |----------------------|
                    | UI                   |
                    | Audio Capture        |
                    | Audio Playback       |
                    | Session History      |
                    +----------+-----------+
                               |
                         WebSocket
                               |
                    +----------+-----------+
                    | Node.js + Express    |
                    |----------------------|
                    | WebSocket Relay      |
                    | Connection Manager   |
                    | Fallback Manager     |
                    +----------+-----------+
                               |
                 +-------------+--------------+
                 |                            |
                 ▼                            ▼
        Gemini Live API             Gemini REST API
      (Primary AI Engine)        (Fallback AI Engine)

```

---

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- Web Audio API

### Backend

- Node.js
- Express
- TypeScript
- WebSocket (ws)
- Zod
- CORS

### AI

- Google Gemini Live API (Primary)
- Google Gemini 2.5 Flash REST API (Fallback)

---

## Project Structure

```

voice-ai-assistant/

├── client/
│ ├── src/
│ │ ├── app/
│ │ ├── hooks/
│ │ └── components/
│ ├── public/
│ └── package.json

├── server/
│ ├── src/
│ │ ├── config/
│ │ ├── websocket/
│ │ └── app.ts
│ └── package.json

```

---

## How It Works

1. User starts a conversation from the frontend.
2. The browser captures live microphone audio using the Web Audio API.
3. Audio is converted into 16-bit PCM chunks.
4. Audio chunks are streamed to the backend over WebSockets.
5. The backend securely relays the stream to the Gemini Live API.
6. Gemini processes the conversation and streams synthesized audio back.
7. The frontend schedules and plays the received audio with low-latency playback.

---

## Automatic Fallback

If the persistent Gemini Live WebSocket connection becomes unavailable:

1. Incoming audio is buffered on the backend.
2. Audio chunks are consolidated into a single request.
3. The request is sent to Gemini 2.5 Flash using the REST API.
4. The generated audio response is streamed back to the frontend.
5. The user continues the conversation without application failure.

---

## Installation

Clone the repository

```bash
git clone https://github.com/abhishek0100-kr/voice-ai-assistant.git
```

Frontend

```bash
cd client
npm install
npm run dev
```

Backend

```bash
cd server
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=8080
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```
## Author

**Abhishek Kumar**

B.Tech Computer Science Engineering (AI & ML)

VIT Vellore

GitHub:
https://github.com/abhishek0100-kr

---

## License

This project is released under the MIT License.