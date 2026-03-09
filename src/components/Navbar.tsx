
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import { translations } from '../translations';
import { User } from 'lucide-react';

const Navbar: React.FC<{ lang: Language; toggleLang: () => void }> = ({ lang, toggleLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang].nav;
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        e.preventDefault();
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
    setIsOpen(false);
  };

  const navLinks = [
    { name: t.home, href: '#home' },
    { name: t.about, href: '#about' },
    { name: t.services, href: '#services' },
    { name: t.universities, href: '#universities' },
    { name: t.apply, href: '#apply' },
    { name: t.contact, href: '#contact' },
  ];

  return (
    <nav className={`glass-nav fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'py-2 shadow-sm' : 'py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-12 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-[#1d1d1f] tracking-tighter hover:opacity-70 transition-opacity">GoUni</Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-[13px] font-bold text-[#1d1d1f]/80 hover:text-blue-600 transition-colors nav-underline uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
            
            <div className="flex items-center gap-4 pl-4 border-l border-black/5 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4">
              <button
                onClick={toggleLang}
                className="bg-slate-200/50 hover:bg-slate-200 text-[#1d1d1f] px-3 py-1.5 rounded-full text-[10px] font-black transition-all uppercase"
              >
                {lang === 'en' ? 'AR' : 'EN'}
              </button>

              {token ? (
                <Link 
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                >
                  <User className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              ) : (
                <Link 
                  to="/login"
                  className="text-xs font-bold text-[#1d1d1f] hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
             <button
              onClick={toggleLang}
              className="bg-slate-200/50 hover:bg-slate-200 text-[#1d1d1f] px-2 py-1 rounded-md text-[10px] font-black transition-all"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#1d1d1f]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl h-screen fixed inset-0 top-16 z-[101] flex flex-col p-10 space-y-8 animate-in fade-in slide-in-from-right duration-300">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-2xl font-semibold text-[#1d1d1f] hover:text-blue-600"
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
