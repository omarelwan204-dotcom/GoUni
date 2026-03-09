import React from 'react';
import PageLayout from '../components/PageLayout';
import { Language } from '../types';
import Contact from '../components/Contact';

const ContactPage: React.FC<{ lang: Language; toggleLang: () => void }> = ({ lang, toggleLang }) => {
  return (
    <PageLayout 
      lang={lang} 
      toggleLang={toggleLang}
      title={lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
      subtitle={lang === 'ar' ? 'نحن هنا للإجابة على جميع استفساراتك ومساعدتك في كل خطوة.' : 'We are here to answer all your inquiries and help you every step of the way.'}
    >
      <Contact lang={lang} />
    </PageLayout>
  );
};

export default ContactPage;
