'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
      nextPlaybackTimeRef.current = audioContextRef.current.currentTime;
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const clearAudioQueue = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    nextPlaybackTimeRef.current = 0;
  }, []);

  const playPCMChunk = useCallback((base64Data: string) => {
    initAudioContext();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Buffer = new Int16Array(bytes.buffer);
    const float32Buffer = new Float32Array(int16Buffer.length);
    for (let i = 0; i < int16Buffer.length; i++) {
      float32Buffer[i] = int16Buffer[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32Buffer.length, 24000);
    audioBuffer.copyToChannel(float32Buffer, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const lookAheadWindow = 0.015;
    const currentTime = ctx.currentTime;

    if (nextPlaybackTimeRef.current < currentTime) {
      nextPlaybackTimeRef.current = currentTime + lookAheadWindow;
    }

    source.start(nextPlaybackTimeRef.current);
    nextPlaybackTimeRef.current += audioBuffer.duration;
  }, [initAudioContext]);

  const handleIncomingMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.event === 'ai-response') {
        const parts = data.payload?.serverContent?.modelTurn?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              playPCMChunk(part.inlineData.data);
            }
          }
        }
      } else if (data.event === 'ai-response-fallback') {
        const parts = data.payload?.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              playPCMChunk(part.inlineData.data);
            }
          }
        }
      }
    } catch (error) {
      console.error('⚠️ Error processing downstream socket event payload:', error);
    }
  }, [playPCMChunk]);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log('📡 Full-duplex WebSocket channel established with architecture server node.');
    };

    socket.onmessage = handleIncomingMessage;

    socket.onclose = () => {
      setIsConnected(false);
      clearAudioQueue();
      console.log('🔌 WebSocket transport channel disconnected safely.');
    };

    socket.onerror = (error) => {
      console.error('⚠️ WebSocket transport pipe encountered an processing error:', error);
    };

    return () => {
      socket.close();
      clearAudioQueue();
    };
  }, [url, handleIncomingMessage, clearAudioQueue]);

  const sendAudioFrame = (base64Data: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        event: 'audio-stream',
        data: base64Data,
      });
      socketRef.current.send(payload);
    }
  };

  const sendAudioEnd = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        event: 'audio-end'
      });
      socketRef.current.send(payload);
    }
  };

  const interruptPlayback = () => {
    clearAudioQueue();
  };

  return { isConnected, sendAudioFrame, sendAudioEnd, interruptPlayback };
};