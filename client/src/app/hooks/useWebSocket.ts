'use client';

import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log('📡 Full-duplex WebSocket channel established with architecture server node.');
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log('🔌 WebSocket transport channel disconnected safely.');
    };

    socket.onerror = (error) => {
      console.error('⚠️ WebSocket transport pipe encountered an processing error:', error);
    };

    return () => {
      socket.close();
    };
  }, [url]);

  const sendAudioFrame = (base64Data: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        event: 'audio-stream',
        data: base64Data,
      });
      socketRef.current.send(payload);
    }
  };

  return { isConnected, sendAudioFrame };
};