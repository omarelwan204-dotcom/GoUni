
import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { translations } from '../translations';
import FadeIn from './FadeIn';

const Services: React.FC<{ lang: Language; onLaunchStudio: () => void }> = ({ lang, onLaunchStudio }) => {
  const t = translations[lang].services;
  
  const services = [
    { key: 's1', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1', path: '/university-selection' },
    { key: 's2', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', path: '/application-support' },
    { key: 's3', icon: 'M13 10V3L4 14h7v7l9-11h-7z', path: '/admission-strategy' },
    { key: 's4', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', path: '/universities' }
  ];

  return (
    <section id="services" className="py-32 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <FadeIn className="text-center mb-24">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{t.badge}</span>
          <h2 className="text-4xl md:text-6xl font-black text-[#1d1d1f] mt-4 tracking-tight">{t.title}</h2>
          <button 
            onClick={onLaunchStudio}
            className="mt-10 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-black text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center gap-3 mx-auto"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            {lang === 'ar' ? 'أطلق استوديو الذكاء الاصطناعي' : 'Launch AI Admission Studio'}
          </button>
        </FadeIn>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s, i) => (
            <FadeIn key={s.key} className="h-full">
              <Link to={s.path} className="block h-full">
                <div className="glass-card h-full p-10 rounded-[32px] apple-shadow hover:scale-[1.02] transition-transform duration-500 group">
                  <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-blue-600 transition-colors">
                    <svg className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-[#1d1d1f] mb-4">{(t as any)[s.key].title}</h4>
                  <p className="text-slate-500 leading-relaxed font-medium">{(t as any)[s.key].desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{lang === 'ar' ? 'اقرأ المزيد' : 'Read More'}</span>
                    <svg className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
