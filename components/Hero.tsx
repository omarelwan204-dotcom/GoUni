
import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

import { Link } from 'react-router-dom';

const Hero: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].hero;
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Use requestAnimationFrame for smoother performance
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax calculations
  const bgTransform = `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0005})`;
  const bgFilter = `blur(${Math.min(10, scrollY * 0.02)}px)`;
  const contentOpacity = Math.max(0, 1 - scrollY / 600);
  const contentTransform = `translateY(${scrollY * 0.1}px)`;

  return (
    <div id="home" className="relative h-[100vh] flex items-center overflow-hidden bg-[#000]">
      {/* Cinematic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop")',
          transform: bgTransform,
          filter: bgFilter,
          opacity: 0.7
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black"></div>
      </div>

      <div 
        className="relative max-w-7xl mx-auto px-6 md:px-12 w-full text-center will-change-transform"
        style={{ 
          opacity: contentOpacity,
          transform: contentTransform
        }}
      >
        <div className="max-w-4xl mx-auto space-y-10">
          <h1 className="text-6xl md:text-9xl font-black text-white leading-[0.9] tracking-tighter animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {t.title} <br />
            <span className="text-blue-500">{t.titleAccent}</span>
          </h1>
          <p className="text-xl md:text-3xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-200">
            {t.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
            <Link 
              to="/universities" 
              className="btn-apple px-14 py-6 rounded-full font-bold text-xl shadow-2xl shadow-blue-600/20"
            >
              {t.explore}
            </Link>
            <Link 
              to="/signup" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/20 px-14 py-6 rounded-full font-bold text-xl transition-all"
            >
              {t.apply}
            </Link>
          </div>
        </div>
      </div>

      {/* Apple-style Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-500">
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white to-transparent"></div>
        <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white">{lang === 'ar' ? 'سكرول' : 'Scroll'}</span>
      </div>
    </div>
  );
};

export default Hero;
