'use client';

import { useAudioStream } from './hooks/useAudioStream';
import { useWebSocket } from './hooks/useWebSocket';

export default function Home() {
  const { isConnected, sendAudioFrame } = useWebSocket('ws://localhost:8080/stream');
  const { isRecording, startRecording, stopRecording } = useAudioStream();

  const handleToggleStream = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording((base64Data: string) => {
        sendAudioFrame(base64Data);
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white select-none">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center backdrop-blur-md shadow-2xl">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Voice AI Interface
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Bidirectional Transport Layer Control Panel
        </p>

        <div className="my-10 flex flex-col items-center justify-center">
          <button
            disabled={!isConnected}
            onClick={handleToggleStream}
            className={`flex h-24 w-24 items-center justify-center rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 shadow-lg ${
              !isConnected
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/20 shadow-red-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 ring-4 ring-indigo-500/20 shadow-indigo-600/30'
            }`}
          >
            {!isConnected ? 'Offline' : isRecording ? 'Stop' : 'Start'}
          </button>

          <div className="mt-6 flex flex-col gap-2 items-center">
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-4 py-1.5 text-xs text-slate-400">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 shadow-sm shadow-green-500' : 'bg-red-500'}`} />
              <span>Server Connection: {isConnected ? 'CONNECTED' : 'OFFLINE'}</span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-4 py-1.5 text-xs text-slate-400">
              <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
              <span>Streaming Mode: {isRecording ? 'ACTIVE' : 'IDLE'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/40 p-4 text-left border border-slate-900">
          <span className="text-2xl font-mono block text-slate-600 mb-1">console</span>
          <p className="font-mono text-[11px] text-slate-500 leading-relaxed">
            {!isConnected
              ? '🔌 Waiting for backend operational node link... Please ensure your server runtime is running on port 8080.'
              : isRecording
              ? '🚀 Live audio pipeline transmission running! Buffers streaming cleanly into backend server engine.'
              : '📡 Connection operational. Standby for input transmission execution hooks...'}
          </p>
        </div>
      </div>
    </main>
  );
}