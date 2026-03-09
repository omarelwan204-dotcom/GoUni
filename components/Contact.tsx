
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import FadeIn from './FadeIn';

const Contact: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].contact;
  return (
    <section id="contact" className="py-32 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-20">
          <FadeIn className="space-y-12">
            <div>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{t.badge}</span>
              <h2 className="text-4xl md:text-7xl font-black text-[#1d1d1f] mt-4 tracking-tight">{t.title}</h2>
              <p className="text-2xl text-slate-500 mt-6 font-medium leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 apple-shadow">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'الهاتف / واتساب' : 'Phone / WhatsApp'}</p>
                  <p className="text-2xl font-black text-[#1d1d1f]">01004564067</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 apple-shadow">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                  <p className="text-2xl font-black text-[#1d1d1f]">workoe2023@gmail.com</p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="glass-card p-12 rounded-[40px] apple-shadow">
              <h4 className="text-3xl font-black text-[#1d1d1f] mb-10">{t.formTitle}</h4>
              <form className="space-y-6">
                <input 
                  type="text" 
                  placeholder={lang === 'ar' ? 'الاسم' : 'Your Name'} 
                  className="w-full bg-white/50 border-none rounded-2xl px-6 py-5 text-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <input 
                  type="tel" 
                  placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'} 
                  className="w-full bg-white/50 border-none rounded-2xl px-6 py-5 text-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <textarea 
                  rows={4} 
                  placeholder={lang === 'ar' ? 'رسالتك' : 'Your Message'} 
                  className="w-full bg-white/50 border-none rounded-2xl px-6 py-5 text-lg outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                ></textarea>
                <button className="w-full btn-apple py-5 rounded-[20px] font-black text-xl">
                  {t.btn}
                </button>
              </form>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/201004564067" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 z-[50] w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03a11.777 11.777 0 001.617 6.027L0 24l6.115-1.606a11.757 11.757 0 005.932 1.605h.005c6.637 0 12.032-5.394 12.035-12.032a11.764 11.764 0 00-3.535-8.503l-.001-.001z"/></svg>
      </a>
    </section>
  );
};

export default Contact;
