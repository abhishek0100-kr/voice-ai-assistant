'use client';

import { useAudioStream } from './hooks/useAudioStream';

export default function Home() {
  const { isRecording, startRecording, stopRecording } = useAudioStream();

  const handleToggleStream = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording((base64Data: string) => {
        console.log('🎙️ Packaged dynamic audio frame data chunk:', base64Data.slice(0, 30) + '...');
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
            onClick={handleToggleStream}
            className={`flex h-24 w-24 items-center justify-center rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 shadow-lg ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/20 shadow-red-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 ring-4 ring-indigo-500/20 shadow-indigo-600/30'
            }`}
          >
            {isRecording ? 'Stop' : 'Start'}
          </button>

          <div className="mt-6 flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-4 py-1.5 text-xs text-slate-400">
            <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
            <span>Streaming Mode: {isRecording ? 'ACTIVE' : 'IDLE'}</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/40 p-4 text-left border border-slate-900">
          <span className="text-2xl font-mono block text-slate-600 mb-1">console</span>
          <p className="font-mono text-[11px] text-slate-500 leading-relaxed">
            {isRecording 
              ? '🎤 Open browser Developer Tools (F12) to view streaming PCM base64 frame data chunks...'
              : '💤 Systems stable. Standby for input transmission execution hooks...'}
          </p>
        </div>
      </div>
    </main>
  );
}