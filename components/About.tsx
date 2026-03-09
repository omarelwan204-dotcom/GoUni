
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import FadeIn from './FadeIn';

const About: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].about;
  return (
    <section id="about" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <FadeIn>
            <div className="space-y-8">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{t.badge}</span>
              <h2 className="text-4xl md:text-6xl font-black text-[#1d1d1f] tracking-tight">{t.title}</h2>
              <div className="space-y-6 text-xl text-slate-500 leading-relaxed font-medium">
                <p>{t.p1}</p>
                <p>{t.p2}</p>
              </div>
              <div className="flex gap-12 pt-6">
                <div className="space-y-1">
                  <p className="text-5xl font-black text-[#1d1d1f]">6+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.years}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-5xl font-black text-[#1d1d1f]">1k+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.students}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-5xl font-black text-[#1d1d1f]">80+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.unis}</p>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-100/50 rounded-[40px] blur-3xl -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop" 
                alt="University campus" 
                className="rounded-[40px] shadow-2xl object-cover h-[600px] w-full"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default About;
