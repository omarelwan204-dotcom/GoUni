
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const VoiceView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to connect');
  const [transcriptions, setTranscriptions] = useState<{ role: string, text: string }[]>([]);
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const startSession = async () => {
    try {
      // Use process.env.API_KEY directly as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setStatus('Connecting...');
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Listening...');
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves and then call session.sendRealtimeInput
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio processing: handles base64 raw PCM bytes from the model
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Interrupt handling: stop current audio sources immediately
            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }

            // Transcriptions: handle real-time text output from the model
            if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              const input = currentInputTranscriptionRef.current;
              const output = currentOutputTranscriptionRef.current;
              setTranscriptions(prev => [
                ...prev, 
                { role: 'user', text: input },
                { role: 'assistant', text: output }
              ]);
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }
          },
          onerror: (e) => {
            console.error('Session error', e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'You are a helpful and charismatic AI companion. Talk naturally, be supportive, and keep responses concise for voice conversation.'
        }
      });
      
    } catch (error) {
      console.error('Failed to start session:', error);
      setStatus('Failed to connect');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('Session ended');
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
  };

  // Manual base64 decoding helper as per SDK requirements
  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Manual base64 encoding helper to avoid spread operator issues on large data
  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Audio decoding logic for raw PCM data (non-WAV/MP3)
  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  // Helper to create the audio/pcm blob for real-time input
  function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000'
    };
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${
          isActive ? 'border-blue-500 scale-110 shadow-[0_0_50px_rgba(59,130,246,0.5)]' : 'border-slate-800'
        }`}>
          <div className={`w-48 h-48 rounded-full flex flex-col items-center justify-center bg-slate-800 ${
            isActive ? 'animate-pulse' : ''
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={isActive ? 'text-blue-400' : 'text-slate-600'}>
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
            <p className="mt-4 font-semibold text-slate-300 tracking-wide">{isActive ? 'AI IS LISTENING' : 'TAP TO START'}</p>
          </div>
        </div>
        
        <p className="mt-8 text-slate-400">{status}</p>

        <div className="mt-12 w-full max-lg h-32 overflow-y-auto glass rounded-2xl p-4 text-left">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Transcription History</p>
          {transcriptions.map((t, i) => (
            <div key={i} className="mb-2 text-sm">
              <span className={`font-bold uppercase text-[10px] ${t.role === 'user' ? 'text-blue-400' : 'text-purple-400'}`}>{t.role}: </span>
              <span className="text-slate-300">{t.text}</span>
            </div>
          ))}
          {transcriptions.length === 0 && <p className="text-slate-600 italic text-sm">No conversation yet...</p>}
        </div>
      </div>

      <div className="p-8 flex justify-center border-t border-slate-800 glass">
        {!isActive ? (
          <button 
            onClick={startSession}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-blue-500/20 transition-all flex items-center gap-3 active:scale-95"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-ping" />
            Start Voice Conversation
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-red-500/20 transition-all active:scale-95"
          >
            End Session
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceView;
