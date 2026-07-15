import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GeminiLiveManager } from './gemini';

export const initWebSocketServer = (httpServer: HttpServer): WebSocketServer => {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;

    if (pathname === '/stream') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 Client established a stateful transport stream handshake');

    const geminiManager = new GeminiLiveManager(ws);
    geminiManager.connect();

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.event === 'audio-stream') {
          geminiManager.sendAudioChunk(data.data);
        } else if (data.event === 'audio-end') {
          geminiManager.triggerFallbackExecution();
        } else if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Malformed frame transmission dropped' }));
      }
    });

    ws.on('close', () => {
      console.log('❌ Client closed transport stream connection channel');
      geminiManager.disconnect();
    });

    ws.on('error', (error) => {
      console.error('⚠️ Stream internal network fault:', error.message);
      geminiManager.disconnect();
    });
  });

  return wss;
};