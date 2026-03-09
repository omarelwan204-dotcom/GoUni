
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { geminiService } from '../services/gemini';

const GeminiAssistant: React.FC<{ lang: Language }> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ 
      role: 'assistant', 
      text: lang === 'ar' 
        ? 'مرحباً! أنا مساعد GoUni الذكي. كيف يمكنني مساعدتك اليوم في أسئلة القبول بالجامعة؟' 
        : 'Hi! I am the GoUni Smart Assistant. How can I help you today with your university admission questions?' 
    }]);
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await geminiService.getAdmissionAdvice(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: response || "..." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Error connecting to AI." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed bottom-8 ${lang === 'ar' ? 'left-8' : 'right-8'} z-[100]`}>
      {isOpen ? (
        <div className="w-[350px] sm:w-[420px] h-[600px] bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl flex flex-col border border-white overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
          <header className="bg-[#1d1d1f] p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1d1d1f] font-black">G</div>
              <div>
                <p className="font-black text-sm tracking-tight">GoUni Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Active</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3 rounded-[24px] text-[15px] font-medium leading-relaxed ${
                  m.role === 'user' ? 'bg-blue-600 text-white apple-shadow' : 'bg-white border border-slate-100 text-[#1d1d1f] apple-shadow'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 px-4 py-2 rounded-full flex gap-1 animate-pulse">
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={lang === 'ar' ? 'اسأل سؤالاً...' : 'Ask a question...'}
                className="flex-1 bg-[#f5f5f7] border-none rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button className="bg-blue-600 text-white p-3 rounded-2xl apple-shadow hover:scale-110 active:scale-95 transition-all">
                <svg className={`w-6 h-6 ${lang === 'ar' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#1d1d1f] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95 apple-shadow group"
        >
          <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default GeminiAssistant;
