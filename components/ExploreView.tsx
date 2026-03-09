
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { GroundingChunk } from '../types';

const ExploreView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; chunks: GroundingChunk[] } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geolocation disabled", err)
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);

    try {
      const response = await geminiService.explore(query, location || undefined);
      // Cast to GroundingChunk[] as types.ts now matches the SDK's structure
      setResult({
        text: response.text || "",
        chunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any as GroundingChunk[]) || []
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black gradient-text">Smart Explorer</h2>
          <p className="text-slate-400">Powered by Google Search and Google Maps for real-time grounding.</p>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find top rated cafes nearby or recent news about Mars missions..."
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-5 px-6 pr-16 text-lg focus:outline-none focus:border-blue-500 transition-all shadow-xl group-focus-within:shadow-blue-500/10"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            )}
          </button>
        </form>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass rounded-3xl p-8 space-y-4 border border-slate-700 shadow-2xl">
              <div className="text-slate-200 leading-relaxed text-lg whitespace-pre-wrap">{result.text}</div>
            </div>

            {result.chunks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Sources & Locations</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.chunks.map((chunk, i) => {
                    const data = chunk.web || chunk.maps;
                    // Ensure we have data and a valid URI before rendering the link
                    if (!data || !data.uri) return null;
                    return (
                      <a
                        key={i}
                        href={data.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 glass hover:bg-slate-800/80 transition-all rounded-2xl border border-slate-700/50 group"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          chunk.maps ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'
                        }`}>
                          {chunk.maps ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                            {data.title || 'Referenced Source'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {/* Safely parse URL hostname */}
                            {(() => {
                              try {
                                return new URL(data.uri!).hostname;
                              } catch {
                                return 'external link';
                              }
                            })()}
                          </p>
                        </div>
                        <svg className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreView;
