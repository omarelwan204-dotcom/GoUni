
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import FadeIn from './FadeIn';

const WhyChooseUs: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].why;
  return (
    <section id="why" className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <FadeIn className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {translations[lang].services.title && [0,1,2,3].map((idx) => (
              <div key={idx} className="bg-[#f5f5f7] p-8 rounded-[32px] hover:scale-[1.05] transition-all duration-500">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-black text-[#1d1d1f] mb-2">
                  {lang === 'ar' ? ['خبرة 6+ سنوات', 'توجيه شخصي', 'معلومات دقيقة', 'دعم مستمر'][idx] : ['6+ Years Exp', 'Personal Guidance', 'Accurate Data', 'Constant Support'][idx]}
                </h4>
              </div>
            ))}
          </FadeIn>
          
          <FadeIn className="space-y-10">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{t.badge}</span>
            <h2 className="text-4xl md:text-6xl font-black text-[#1d1d1f] tracking-tight leading-[1.1]">{t.title}</h2>
            <p className="text-2xl text-slate-500 font-medium leading-relaxed">
              {t.p1}
            </p>
            <div className="space-y-6">
              {t.points.map((item, i) => (
                <div key={i} className="flex items-center gap-5 group">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 group-hover:bg-blue-600 transition-colors" />
                  <span className="text-xl font-bold text-[#1d1d1f]/80 group-hover:text-[#1d1d1f] transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
