import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

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

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Malformed frame transmission dropped' }));
      }
    });

    ws.on('close', () => {
      console.log('❌ Client closed transport stream connection channel');
    });

    ws.on('error', (error) => {
      console.error('⚠️ Stream internal network fault:', error.message);
    });
  });

  return wss;
};