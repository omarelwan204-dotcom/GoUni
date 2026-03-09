import React from 'react';
import PageLayout from '../components/PageLayout';
import { Language } from '../types';

const AdmissionStrategy: React.FC<{ lang: Language; toggleLang: () => void }> = ({ lang, toggleLang }) => {
  return (
    <PageLayout 
      lang={lang} 
      toggleLang={toggleLang}
      title={lang === 'ar' ? 'استراتيجية القبول' : 'Admission Strategy'}
      subtitle={lang === 'ar' ? 'نضع لك خطة ذكية لزيادة فرص قبولك في أفضل الجامعات التي تناسب طموحك.' : 'We create a smart plan to maximize your acceptance chances at the best universities.'}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-black text-[#1d1d1f]">
            {lang === 'ar' ? 'كيف نخطط لنجاحك؟' : 'How we plan for your success?'}
          </h3>
          <p className="text-slate-500 font-medium">
            {lang === 'ar' ? 'القبول ليس مجرد أرقام، بل هو استراتيجية متكاملة.' : 'Admission is not just about numbers; it is an integrated strategy.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: '01', t: lang === 'ar' ? 'التقييم' : 'Assessment', d: lang === 'ar' ? 'تقييم شامل لملفك الأكاديمي.' : 'Comprehensive assessment of your academic profile.' },
            { n: '02', t: lang === 'ar' ? 'الاستهداف' : 'Targeting', d: lang === 'ar' ? 'تحديد الجامعات ذات أعلى فرص قبول.' : 'Identifying universities with the highest acceptance chances.' },
            { n: '03', t: lang === 'ar' ? 'التنفيذ' : 'Execution', d: lang === 'ar' ? 'تنفيذ التقديم في التوقيت المثالي.' : 'Executing the application at the perfect timing.' }
          ].map((item, i) => (
            <div key={i} className="relative p-8 glass-card rounded-3xl border border-slate-100">
              <span className="text-6xl font-black text-blue-600/10 absolute top-4 right-4">{item.n}</span>
              <h4 className="text-xl font-bold text-[#1d1d1f] mb-4 relative z-10">{item.t}</h4>
              <p className="text-slate-500 text-sm relative z-10 leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-600 rounded-[40px] p-12 text-white text-center space-y-6">
          <h3 className="text-3xl font-black">{lang === 'ar' ? 'ابدأ رحلتك اليوم' : 'Start Your Journey Today'}</h3>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {lang === 'ar' ? 'انضم إلى أكثر من 1000 طالب نجحوا في الوصول إلى جامعات أحلامهم معنا.' : 'Join over 1000 students who successfully reached their dream universities with us.'}
          </p>
          <button className="bg-white text-blue-600 px-10 py-4 rounded-full font-black hover:scale-105 transition-transform">
            {lang === 'ar' ? 'احجز استشارة مجانية' : 'Book Free Consultation'}
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdmissionStrategy;
