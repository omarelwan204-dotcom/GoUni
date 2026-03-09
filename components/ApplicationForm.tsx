
import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { translations } from '../translations';
import FadeIn from './FadeIn';
import { ArrowRight, Sparkles } from 'lucide-react';

const ApplicationForm: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].apply;

  return (
    <section id="apply" className="py-40 bg-[#000] text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_70%)]"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="bg-white/[0.03] border border-white/10 rounded-[64px] p-12 md:p-24 backdrop-blur-3xl text-center space-y-12">
          <FadeIn className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-500 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-600/20">
              <Sparkles className="w-4 h-4" />
              {lang === 'ar' ? 'ابدأ رحلتك الآن' : 'Start Your Journey Now'}
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-4xl mx-auto">
              {lang === 'ar' ? 'جاهز للانضمام إلى أفضل الجامعات؟' : 'Ready to join the world\'s top universities?'}
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
              {lang === 'ar' 
                ? 'انضم إلى آلاف الطلاب الذين حققوا أحلامهم مع GoUni. نظامنا المتطور يساعدك في كل خطوة.' 
                : 'Join thousands of students who achieved their dreams with GoUni. Our advanced platform guides you through every step.'}
            </p>
          </FadeIn>

          <FadeIn className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link 
              to="/signup" 
              className="btn-apple px-14 py-6 rounded-full font-bold text-xl shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 group"
            >
              {lang === 'ar' ? 'أنشئ حسابك مجاناً' : 'Create Free Account'}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-14 py-6 rounded-full font-bold text-xl transition-all flex items-center justify-center"
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In to Dashboard'}
            </Link>
          </FadeIn>

          <FadeIn className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50">
            {[
              { label: lang === 'ar' ? 'تتبع الطلب' : 'Status Tracking', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: lang === 'ar' ? 'إدارة المدفوعات' : 'Payment Management', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
              { label: lang === 'ar' ? 'دعم مباشر' : 'Live Support', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
              { label: lang === 'ar' ? 'قبول مضمون' : 'Guaranteed Admission', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default ApplicationForm;
