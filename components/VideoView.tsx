
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const VideoView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // Check for API key selection (required for Veo models)
    if (typeof (window as any).aistudio !== 'undefined') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Proceeding after triggering openSelectKey to handle race conditions as per instructions
      }
    }

    setIsGenerating(true);
    setVideoUrl(null);
    setLoadingStep('Initializing Neural Engine...');

    const steps = [
      'Initializing Neural Engine...',
      'Simulating Physical Dynamics...',
      'Rendering Light Frames...',
      'Assembling Temporal Consistency...',
      'Almost there! Polishing pixels...'
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setLoadingStep(steps[i++]);
      }
    }, 4000);

    try {
      const url = await geminiService.generateVideo(prompt);
      setVideoUrl(url);
    } catch (error: any) {
      console.error(error);
      
      // If the request fails due to missing project/key permissions, prompt user to select a key again
      if (error?.message?.includes("Requested entity was not found.") && typeof (window as any).aistudio !== 'undefined') {
        setLoadingStep('API Key not found or invalid. Please select a valid paid key.');
        await (window as any).aistudio.openSelectKey();
      } else {
        setLoadingStep('Generation failed. Please try again.');
      }
    } finally {
      setIsGenerating(false);
      clearInterval(interval);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-black gradient-text">Veo Cinema</h2>
              <p className="text-slate-400">Cinematic video generation with temporal consistency.</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-600/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/20 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              Veo 3.1 Fast
            </div>
          </div>

          <div className="glass rounded-3xl p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-400 uppercase tracking-widest">The Scenario</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A neon-lit cyberpunk market at midnight, cinematic panning shot, 4k, hyper-detailed textures..."
                className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-600/20 transition-all transform active:scale-[0.98]"
            >
              {isGenerating ? 'GENERATING CINEMATIC SEQUENCE...' : 'CREATE VIDEO'}
            </button>
          </div>

          <div className="aspect-video glass rounded-3xl overflow-hidden relative flex items-center justify-center border border-slate-700/50">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-cover"
              />
            ) : isGenerating ? (
              <div className="text-center space-y-6 max-w-sm px-6">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin [animation-duration:1s] mx-auto" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-200 mb-2">{loadingStep}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed italic">
                    This can take up to 2 minutes. We are synthesizing a new reality based on your prompt.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-600 px-6">
                <svg className="mx-auto mb-4 opacity-10" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>
                <p className="font-medium text-slate-500">Your cinematic masterpiece will appear here.</p>
                <p className="text-xs text-slate-600 mt-2">Requires an API key from a paid GCP project.</p>
                <div className="mt-4">
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:text-blue-400 text-xs underline font-medium"
                  >
                    View Billing Documentation
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoView;
