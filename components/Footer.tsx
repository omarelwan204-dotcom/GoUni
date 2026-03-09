
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';

const Footer: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  return (
    <footer className="bg-white py-24 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-16 mb-20">
          <div className="md:col-span-2 space-y-6">
            <span className="text-3xl font-black text-[#1d1d1f] tracking-tighter block">GoUni</span>
            <p className="max-w-md text-lg text-slate-500 font-medium leading-relaxed">
              {lang === 'ar' ? 'استشارات جامعية احترافية لطلاب المدارس الثانوية. تبسيط الجسر بين المدرسة الثانوية والتعليم العالي.' : 'Professional University Consulting for high school students. Simplifying the bridge between high school and higher education.'}
            </p>
          </div>
          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8">{lang === 'ar' ? 'التنقل' : 'Navigation'}</h5>
            <ul className="space-y-4">
              {['home', 'about', 'services', 'universities'].map(key => (
                <li key={key}><a href={`#${key}`} className="text-[#1d1d1f] font-bold hover:text-blue-600 transition-colors">{(t.nav as any)[key]}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8">{lang === 'ar' ? 'اتصل بنا' : 'Contact'}</h5>
            <ul className="space-y-4 font-bold text-[#1d1d1f]">
              <li>workoe2023@gmail.com</li>
              <li>01004564067</li>
            </ul>
          </div>
        </div>
        <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm font-medium">&copy; 2025 GoUni Consulting. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://www.facebook.com/share/16GpShyy48/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-[#1d1d1f] hover:bg-blue-600 hover:text-white transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/gouni._?igsh=bjl5a3l2M3p6eTk4&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-[#1d1d1f] hover:bg-pink-600 hover:text-white transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@gouni._?_t=ZS-8y6B8JI0Zsm&_r=1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-[#1d1d1f] hover:bg-black hover:text-white transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.14 1.01.23 2.08.94 2.79.68.68 1.61 1.07 2.59 1.03 1.42-.01 2.73-.95 3.17-2.3.14-.44.21-.91.21-1.37.01-3.33-.01-6.66.01-10z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
