import React from 'react';
import PageLayout from '../components/PageLayout';
import { Language } from '../types';
import UniversitiesTable from '../components/UniversitiesTable';

const UniversitiesPage: React.FC<{ lang: Language; toggleLang: () => void }> = ({ lang, toggleLang }) => {
  return (
    <PageLayout 
      lang={lang} 
      toggleLang={toggleLang}
      title={lang === 'ar' ? 'دليل الجامعات' : 'Universities Directory'}
      subtitle={lang === 'ar' ? 'قاعدة بيانات شاملة للجامعات الخاصة والأهلية والدولية في مصر.' : 'Comprehensive database of private, national, and international universities in Egypt.'}
    >
      <UniversitiesTable lang={lang} />
    </PageLayout>
  );
};

export default UniversitiesPage;
