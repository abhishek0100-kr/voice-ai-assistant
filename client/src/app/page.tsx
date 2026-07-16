'use client';

import { useState, useEffect, useRef } from 'react';
import { useAudioStream } from './hooks/useAudioStream';
import { useWebSocket } from './hooks/useWebSocket';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'USER' | 'AI';
  duration?: string;
}

export default function Home() {
  const { isConnected, sendAudioFrame, sendAudioEnd, interruptPlayback } = useWebSocket('ws://localhost:8080/stream');
  const { isRecording, startRecording, stopRecording } = useAudioStream();
  
  const [aiState, setAiState] = useState<'DISCONNECTED' | 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'>('DISCONNECTED');
  const [devModeOpen, setDevModeOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<LogEntry[]>([]);
  const [turnStartTime, setTurnStartTime] = useState<number | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);
  
  const audioContextAnalysisRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isConnected) {
      setAiState('DISCONNECTED');
      stopVolumeAnalysis();
    } else {
      setAiState('IDLE');
    }
  }, [isConnected]);

  useEffect(() => {
    if (isRecording) {
      setAiState('LISTENING');
      setTurnStartTime(Date.now());
      startVolumeAnalysis();
    } else if (aiState === 'LISTENING') {
      setAiState('THINKING');
      stopVolumeAnalysis();
      if (turnStartTime) {
        const delta = ((Date.now() - turnStartTime) / 1000).toFixed(1);
        setSessionLogs(prev => [
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: 'USER',
            duration: `${delta}s`
          },
          ...prev
        ]);
        setTurnStartTime(null);
      }
    }
  }, [isRecording]);

  const startVolumeAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextAnalysisRef.current = ctx;
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = ctx.createMediaStreamSource(stream);
      micSourceRef.current = source;
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setMicVolume(average / 128);
        
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      
      updateVolume();
    } catch (err) {
      console.error(err);
    }
  };

  const stopVolumeAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }
    if (audioContextAnalysisRef.current) {
      audioContextAnalysisRef.current.close().catch(() => {});
      audioContextAnalysisRef.current = null;
    }
    analyserRef.current = null;
    setMicVolume(0);
  };

  const handleToggleVoiceMode = () => {
    if (isRecording) {
      stopRecording();
      sendAudioEnd();
      setTimeout(() => {
        setAiState(prev => prev === 'THINKING' ? 'SPEAKING' : prev);
      }, 1000);
    } else {
      interruptPlayback();
      startRecording((base64Data: string) => {
        sendAudioFrame(base64Data);
      });
    }
  };

  const getStateHeading = () => {
    switch (aiState) {
      case 'IDLE': return 'Ready when you are.';
      case 'LISTENING': return "I'm listening...";
      case 'THINKING': return 'Let me think...';
      case 'SPEAKING': return "Here's what I found...";
      case 'DISCONNECTED':
      default: return 'Waiting for connection...';
    }
  };

  const showHistoryTrigger = sessionLogs.length > 0;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 py-12 text-slate-100 select-none overflow-hidden">
      
      {showHistoryTrigger && (
        <div className="absolute top-6 left-6 z-30 animate-in fade-in duration-500">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-medium tracking-wide text-slate-400 backdrop-blur-md transition-all hover:bg-slate-800 hover:text-slate-200"
          >
            <span>{historyOpen ? '✕ Close History' : '📁 Review History'}</span>
          </button>
        </div>
      )}

      <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-2">
        <button
          onClick={() => setDevModeOpen(!devModeOpen)}
          className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-medium tracking-wide text-slate-400 backdrop-blur-md transition-all hover:bg-slate-800 hover:text-slate-200"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{devModeOpen ? 'Hide Telemetry' : 'Developer Mode'}</span>
        </button>

        {devModeOpen && (
          <div className="w-64 rounded-xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-[10px] text-slate-400 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="block border-b border-slate-800 pb-1.5 font-bold tracking-wider text-slate-500 uppercase">System Telemetry</span>
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between">
                <span>Transport Node:</span>
                <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>{isConnected ? 'CONNECTED' : 'OFFLINE'}</span>
              </div>
              <div className="flex justify-between">
                <span>Sampling Pipeline:</span>
                <span>16kHz Mono PCM</span>
              </div>
              <div className="flex justify-between">
                <span>Frame Slices:</span>
                <span>2048 Samples</span>
              </div>
              <div className="flex justify-between">
                <span>Active State:</span>
                <span className="text-indigo-400">{aiState}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`absolute top-0 left-0 z-20 h-full w-80 transform border-r border-slate-900 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-lg transition-transform duration-300 ease-in-out ${historyOpen && showHistoryTrigger ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mt-20">
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase block mb-4">Conversation History</span>
          <div className="h-[calc(100vh-180px)] overflow-y-auto space-y-2.5 pr-2">
            {sessionLogs.map(log => (
              <div key={log.id} className="rounded-lg border border-slate-900 bg-slate-900/30 p-3 transition-all hover:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${log.type === 'USER' ? 'bg-indigo-950 text-indigo-400' : 'bg-emerald-950 text-emerald-400'}`}>
                    {log.type}
                  </span>
                  <span className="text-[9px] text-slate-600">{log.timestamp}</span>
                </div>
                {log.duration && (
                  <div className="mt-1.5 text-[11px] text-slate-400">
                    Duration: <span className="font-mono text-slate-300">{log.duration}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-xl z-10 space-y-8">
        <div className="space-y-2 text-center">
          <span className="text-[9px] font-bold tracking-[0.4em] text-indigo-400/70 uppercase">Project Aether</span>
          <h1 className="text-3xl font-light tracking-tight text-slate-200 sm:text-4xl transition-all duration-300">
            {getStateHeading()}
          </h1>
        </div>

        <div 
          onClick={isConnected ? handleToggleVoiceMode : undefined}
          className="relative flex items-center justify-center w-full h-64 cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
        >
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
            {aiState === 'DISCONNECTED' && (
              <line x1="0" y1="50" x2="400" y2="50" stroke="#ef4444" strokeWidth="1" opacity="0.2" />
            )}
            
            {aiState === 'IDLE' && (
              <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="1.5" opacity="0.5" className="transition-all duration-500" />
            )}
            
            {aiState === 'LISTENING' && (
              <path
                d={`M 0 50 Q 50 ${50 - (micVolume * 45)} 100 50 T 200 50 T 300 50 T 400 50`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                style={{ transform: `scaleY(${0.3 + micVolume * 1.5})`, transformOrigin: 'center' }}
                className="transition-all duration-75"
              />
            )}
            
            {aiState === 'THINKING' && (
              <line x1="120" y1="50" x2="280" y2="50" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" className="animate-pulse duration-700" />
            )}
            
            {aiState === 'SPEAKING' && (
              <g className="animate-aether-speaking origin-center transition-all duration-300">
                <path d="M 0 50 Q 40 10 80 50 T 160 50 T 240 50 T 320 50 T 400 50" fill="none" stroke="#10b981" strokeWidth="2.5" opacity="0.8" />
                <path d="M 0 50 Q 50 90 100 50 T 200 50 T 300 50 T 400 50" fill="none" stroke="#34d399" strokeWidth="1.5" opacity="0.3" />
              </g>
            )}
          </svg>
          
          {isConnected && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800/80 px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md">
                <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-rose-500' : 'bg-indigo-500 animate-ping'}`} />
                <span className="text-[10px] font-medium tracking-widest text-slate-300 uppercase">
                  {isRecording ? 'Tap to Stop' : 'Tap to Speak'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500 font-light tracking-wide transition-all duration-300">
            {aiState === 'DISCONNECTED' ? 'Connecting to Aether service layer...' : 'Tap the center to begin.'}
          </p>
        </div>
      </div>
    </main>
  );
}