import React from 'react';
import PageLayout from '../components/PageLayout';
import { Language } from '../types';

const UniversitySelection: React.FC<{ lang: Language; toggleLang: () => void }> = ({ lang, toggleLang }) => {
  return (
    <PageLayout 
      lang={lang} 
      toggleLang={toggleLang}
      title={lang === 'ar' ? 'اختيار الجامعة' : 'University Selection'}
      subtitle={lang === 'ar' ? 'نساعدك في العثور على التطابق المثالي بناءً على اهتماماتك وأدائك الأكاديمي.' : 'Finding the perfect match based on your interests and academic performance.'}
    >
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
          <p>
            {lang === 'ar' 
              ? 'تعد عملية اختيار الجامعة من أهم القرارات في حياة الطالب. نحن في GoUni نقدم لك تحليلاً شاملاً لجميع الخيارات المتاحة.' 
              : 'Choosing a university is one of the most significant decisions in a student\'s life. At GoUni, we provide a comprehensive analysis of all available options.'}
          </p>
          <ul className="space-y-4">
            {[
              lang === 'ar' ? 'تحليل الميول والقدرات' : 'Aptitude and interest analysis',
              lang === 'ar' ? 'مقارنة بين البرامج الدراسية' : 'Comparison between study programs',
              lang === 'ar' ? 'تقييم فرص العمل المستقبلية' : 'Future job market evaluation',
              lang === 'ar' ? 'مراجعة متطلبات القبول الخاصة' : 'Review of specific admission requirements'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#f5f5f7] rounded-[40px] p-10 flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1523050337458-5ebbb6630532?q=80&w=2070&auto=format&fit=crop" 
            alt="University" 
            className="rounded-3xl shadow-xl object-cover w-full h-full"
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default UniversitySelection;
