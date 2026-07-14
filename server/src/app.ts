import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { env } from './config/env';
import { initWebSocketServer } from './websocket';

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: env.CLIENT_URL,
  methods: ['GET', 'POST'],
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

initWebSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Architecture Control Plane operational on port ${env.PORT} [Mode: ${env.NODE_ENV}]`);
});