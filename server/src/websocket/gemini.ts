import WebSocket from 'ws';
import { env } from '../config/env';

export class GeminiLiveManager {
  private geminiWs: WebSocket | null = null;
  private clientWs: WebSocket;
  private isFallbackMode: boolean = false;
  private fallbackAudioBuffers: Buffer[] = [];

  constructor(clientWs: WebSocket) {
    this.clientWs = clientWs;
  }

  public connect() {
    const host = 'generativelanguage.googleapis.com';
    const apiVersion = 'v1beta';
    const url = `wss://${host}/ws/google.ai.generativelanguage.${apiVersion}.GenerativeService.BidiGenerateContent?key=${env.GEMINI_API_KEY}`;

    this.geminiWs = new WebSocket(url);

    this.geminiWs.on('open', () => {
      console.log('✨ Connected directly to Gemini Multimodal Live API stream pipeline.');
      this.isFallbackMode = false;
      this.fallbackAudioBuffers = [];
      this.sendInitialSetup();
    });

    this.geminiWs.on('message', (data: WebSocket.Data) => {
      try {
        const response = JSON.parse(data.toString());
        console.log('🤖 Gemini AI streaming data back down the channel...');
        
        if (this.clientWs.readyState === WebSocket.OPEN) {
          this.clientWs.send(JSON.stringify({
            event: 'ai-response',
            payload: response
          }));
        }
      } catch (error) {
        console.error('⚠️ Error parsing incoming Gemini frame chunk:', error);
      }
    });

    this.geminiWs.on('close', (code, reason) => {
      const errorText = reason ? reason.toString() : 'No explicit textual reason provided';
      console.log(`🔌 Gemini stream channel disconnected. Code: ${code} | Reason: ${errorText}`);
      
      if (code !== 1000) {
        console.log('⚠️ Unexpected disconnect. Activating Phase 5 REST Fallback Engine...');
        this.isFallbackMode = true;
      } else {
        this.disconnect();
      }
    });

    this.geminiWs.on('error', (error) => {
      console.error('⚠️ Gemini network pipeline fault details:', error);
      this.isFallbackMode = true;
    });
  }

  public async sendAudioChunk(base64Data: string) {
    if (this.isFallbackMode) {
      this.fallbackAudioBuffers.push(Buffer.from(base64Data, 'base64'));
      return;
    }

    if (this.geminiWs && this.geminiWs.readyState === WebSocket.OPEN) {
      console.log(`🚀 Forwarding mic audio payload block to Gemini: (${base64Data.length} bytes)`);
      const audioMessage = {
        realtimeInput: {
          mediaChunks: [],
          audio: {
            data: base64Data,
            mimeType: 'audio/pcm;rate=16000'
          }
        }
      };
      this.geminiWs.send(JSON.stringify(audioMessage));
    } else {
      console.log('⚠️ WebSocket not ready. Routing chunk to Fallback buffer...');
      this.isFallbackMode = true;
      this.fallbackAudioBuffers.push(Buffer.from(base64Data, 'base64'));
    }
  }

  public async triggerFallbackExecution() {
    if (this.fallbackAudioBuffers.length === 0) return;

    try {
      console.log('🏽 Processing accumulated audio chunks via REST fallback pipeline...');
      const combinedBuffer = Buffer.concat(this.fallbackAudioBuffers);
      this.fallbackAudioBuffers = [];
      const base64Audio = combinedBuffer.toString('base64');

      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      
      const response = await fetch(restUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Audio
                  }
                },
                {
                  text: 'The user is interacting via voice. Respond concisely.'
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck'
                }
              }
            }
          }
        })
      });

      if (!response.ok) throw new Error(await response.text());

      const jsonResponse = await response.json();
      
      if (this.clientWs.readyState === WebSocket.OPEN) {
        this.clientWs.send(JSON.stringify({
          event: 'ai-response-fallback',
          payload: jsonResponse
        }));
      }
    } catch (err) {
      console.error('❌ Fallback pipeline execution failed:', err);
    } finally {
      this.isFallbackMode = false;
    }
  }

  public disconnect() {
    if (this.geminiWs) {
      if (this.geminiWs.readyState === WebSocket.OPEN || this.geminiWs.readyState === WebSocket.CONNECTING) {
        this.geminiWs.close();
      }
      this.geminiWs = null;
    }
    this.isFallbackMode = false;
    this.fallbackAudioBuffers = [];
  }

  private sendInitialSetup() {
    if (this.geminiWs && this.geminiWs.readyState === WebSocket.OPEN) {
      const setupMessage = {
        setup: {
          model: 'models/gemini-3.1-flash-live-preview',
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck'
                }
              }
            }
          },
          systemInstruction: {
            parts: [
              {
                text: 'You are Aether, a rapid, bright, highly energetic conversational companion. Do not speak quietly, hesitantly, or with a sotto voce tone. Respond with clear, natural, rapid inflection, varied pitch, and high-tempo articulation. Keep responses extremely short and direct.'
              }
            ]
          }
        }
      };
      this.geminiWs.send(JSON.stringify(setupMessage));
    }
  }
}