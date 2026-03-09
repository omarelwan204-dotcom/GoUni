import React from 'react';
import { Language } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FadeIn from '../components/FadeIn';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  lang: Language;
  toggleLang: () => void;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title, subtitle, lang, toggleLang }) => {
  return (
    <div className={`min-h-screen flex flex-col ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
      <Navbar lang={lang} toggleLang={toggleLang} />
      
      <header className="pt-40 pb-20 bg-[#f5f5f7] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn>
            <h1 className="text-4xl md:text-7xl font-black text-[#1d1d1f] tracking-tight mb-6">{title}</h1>
            {subtitle && <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl leading-relaxed">{subtitle}</p>}
          </FadeIn>
        </div>
      </header>

      <main className="flex-grow py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {children}
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
};

export default PageLayout;
