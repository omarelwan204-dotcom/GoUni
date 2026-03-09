import React from 'react';
import PageLayout from '../components/PageLayout';
import { Language } from '../types';

const ApplicationSupport: React.FC<{ lang: Language; toggleLang: () => void }> = ({ lang, toggleLang }) => {
  return (
    <PageLayout 
      lang={lang} 
      toggleLang={toggleLang}
      title={lang === 'ar' ? 'دعم التقديم' : 'Application Support'}
      subtitle={lang === 'ar' ? 'نتولى عنك عناء الأوراق والإجراءات لضمان تقديم ملف مكتمل واحترافي.' : 'We handle the paperwork and procedures to ensure a complete and professional submission.'}
    >
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-[#f5f5f7] rounded-[40px] p-10 flex items-center justify-center order-2 md:order-1">
          <img 
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop" 
            alt="Application" 
            className="rounded-3xl shadow-xl object-cover w-full h-full"
          />
        </div>
        <div className="space-y-6 text-lg text-slate-600 leading-relaxed order-1 md:order-2">
          <p>
            {lang === 'ar' 
              ? 'عملية التقديم قد تكون مرهقة، لكن فريقنا الخبير يضمن لك سلاسة الإجراءات وتجنب الأخطاء الشائعة.' 
              : 'The application process can be stressful, but our expert team ensures smooth procedures and avoids common mistakes.'}
          </p>
          <div className="grid gap-6">
            {[
              { t: lang === 'ar' ? 'مراجعة المستندات' : 'Document Review', d: lang === 'ar' ? 'التأكد من صحة واكتمال جميع الأوراق المطلوبة.' : 'Ensuring all required papers are correct and complete.' },
              { t: lang === 'ar' ? 'متابعة الطلبات' : 'Application Tracking', d: lang === 'ar' ? 'التواصل المستمر مع مكاتب القبول لمتابعة حالة طلبك.' : 'Constant communication with admission offices to track your status.' },
              { t: lang === 'ar' ? 'كتابة البيانات الشخصية' : 'Personal Statement Guidance', d: lang === 'ar' ? 'مساعدة في صياغة خطاب الغرض من الدراسة بشكل احترافي.' : 'Assistance in drafting a professional statement of purpose.' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-[#1d1d1f] mb-2">{item.t}</h4>
                <p className="text-sm">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ApplicationSupport;
