# Project Aether - Setup Guide

This guide explains how to set up and run Project Aether in a local development environment.

---

# Prerequisites

Before running the project, make sure the following software is installed:

- Node.js (v18 or later recommended)
- npm
- Git
- A modern web browser (Google Chrome or Microsoft Edge recommended)

You will also need a Google Gemini API key with access to the Gemini Live API.

---

# Clone the Repository

```bash
git clone https://github.com/abhishek0100-kr/voice-ai-assistant.git

cd voice-ai-assistant
```

---

# Project Structure

```
voice-ai-assistant/

├── client/
└── server/
```

The project consists of:

- **client** – Next.js frontend
- **server** – Express backend and WebSocket relay

---

# Install Dependencies

## Frontend

```bash
cd client

npm install
```

## Backend

Open another terminal.

```bash
cd server

npm install
```

---

# Configure Environment Variables

Inside the **server** directory, create a file named:

```
.env
```

Add the following variables:

```env
PORT=8080
NODE_ENV=development

CLIENT_URL=http://localhost:3000

DATABASE_URL=your_database_url

GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder values with your own configuration.

> **Important:** Never commit your actual `.env` file or API keys to version control.

---

# Start the Backend

Inside the **server** directory:

```bash
npm run dev
```

The backend starts the Express server and the WebSocket relay.

---

# Start the Frontend

Inside the **client** directory:

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:3000
```

---

# Running the Application

1. Open the application in your browser.
2. Allow microphone access when prompted.
3. Click the center control to begin speaking.
4. Speak naturally.
5. Listen to the AI-generated voice response.

---

# Fallback Behaviour

If the Gemini Live WebSocket connection becomes unavailable, the application automatically switches to the Gemini 2.5 Flash REST API.

This transition is handled internally and does not require any user action.

---

# Troubleshooting

## Microphone Permission Denied

- Verify that your browser has microphone permission enabled.
- Refresh the page after granting permission.

---

## Backend Connection Failed

- Ensure the backend server is running.
- Verify the `CLIENT_URL` value inside the `.env` file.

---

## Gemini Authentication Error

- Verify that your `GEMINI_API_KEY` is valid.
- Ensure the API key has access to the required Gemini models.

---

## WebSocket Connection Error

- Confirm that the backend is running.
- Check that no firewall or proxy is blocking local WebSocket connections.

---

# Notes

- The application is designed for local development.
- Conversation history is stored only for the current browser session.
- No database is required for the current implementation.