# Project Aether

## Real-Time Conversational Voice AI Assistant

---

# Project Report

**Author:** Abhishek Kumar

**Project:** Project Aether

**Technology Stack:**
- Next.js
- React
- TypeScript
- Tailwind CSS
- Node.js
- Express
- WebSocket
- Google Gemini Live API
- Google Gemini 2.5 Flash

---

# Abstract

Project Aether is a real-time conversational voice assistant that enables users to interact with an AI system using natural speech. The application captures live microphone input, streams audio to Google's Gemini Live API through a WebSocket relay server, and plays AI-generated speech responses with minimal latency.

To improve reliability, the application includes an automatic fallback mechanism that switches to the Gemini 2.5 Flash REST API whenever the primary streaming connection becomes unavailable. The system emphasizes modular software architecture, responsive user interaction, and robust communication between the frontend, backend, and AI services.

---

# Problem Statement

Traditional AI chat interfaces rely primarily on text-based interaction, which can feel less natural during conversations. Building a voice-first conversational assistant requires solving several engineering challenges, including low-latency audio streaming, real-time communication, audio synchronization, and graceful recovery from network failures.

The objective of Project Aether is to provide a seamless voice interaction experience while maintaining reliability through an automatic fallback mechanism.

---

# Objectives

The primary objectives of Project Aether are:

- Build a real-time voice conversational assistant.
- Enable full-duplex audio communication.
- Maintain low-latency voice interactions.
- Implement automatic fallback for improved reliability.
- Design a modular and maintainable software architecture.
- Deliver an intuitive and responsive user interface.

---

# System Architecture

Project Aether follows a client-server architecture.

The frontend is responsible for capturing microphone audio, rendering the user interface, maintaining session history, and playing AI-generated responses.

The backend acts as a secure relay between the frontend and Google's Gemini services. It manages WebSocket communication with the Gemini Live API and automatically switches to the Gemini REST API whenever the streaming connection becomes unavailable.

---

# Workflow

The application workflow is summarized below:

1. User grants microphone permission.
2. Audio is captured using the Web Audio API.
3. Audio samples are converted into 16-bit PCM.
4. PCM chunks are Base64 encoded.
5. Audio is streamed to the backend over WebSockets.
6. The backend forwards audio to Gemini Live API.
7. Gemini processes the conversation.
8. AI-generated audio is streamed back.
9. The frontend decodes and schedules playback.
10. If the Live API becomes unavailable, the backend switches to the Gemini REST API.

---

# Technologies Used

## Frontend

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Web Audio API

## Backend

- Node.js
- Express
- WebSocket (ws)
- Zod
- CORS

## AI Services

- Google Gemini Live API
- Google Gemini 2.5 Flash REST API

---

# Key Features

- Real-time microphone streaming
- Streaming AI voice responses
- Persistent WebSocket communication
- Automatic REST fallback
- Instant playback interruption
- Session history
- Modular architecture
- Responsive user interface
- Secure backend API key management

---

# Fallback Mechanism

Reliability is an important aspect of Project Aether.

If the persistent WebSocket connection to Gemini Live API becomes unavailable, the backend temporarily buffers incoming audio, combines the captured audio into a single request, forwards it to Gemini 2.5 Flash through the REST API, and returns the generated response to the frontend.

This allows conversations to continue without terminating the user session.

---

# Challenges Faced

During development several engineering challenges were encountered, including:

- Streaming audio with minimal latency.
- Synchronizing incoming audio playback.
- Managing bidirectional WebSocket communication.
- Handling playback interruption gracefully.
- Implementing seamless fallback between streaming and REST APIs.
- Designing a modular frontend and backend architecture.

---

# Future Improvements

Potential future enhancements include:

- Multi-language conversations.
- Speaker identification.
- Persistent conversation storage.
- Emotion-aware voice responses.
- Conversation analytics dashboard.
- Production cloud deployment.
- Authentication and user profiles.

---

# Conclusion

Project Aether demonstrates how modern web technologies and generative AI services can be combined to build a responsive, voice-first conversational assistant.

The project emphasizes modular engineering practices, reliable communication through WebSockets, graceful fallback handling, and an intuitive user experience. It also provides a solid foundation for future expansion into production-scale conversational AI systems.

---

# References

- Google Gemini API Documentation
- Next.js Documentation
- React Documentation
- Node.js Documentation
- Express Documentation
- MDN Web Docs (Web Audio API)
- WebSocket Protocol Documentation