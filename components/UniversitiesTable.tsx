
import React, { useState, useMemo } from 'react';
import { Language, University } from '../types';
import { translations } from '../translations';
import FadeIn from './FadeIn';

// Extensive mock data from the PDF OCR results
const universitiesData: University[] = [
  { id: '1', nameEn: 'University of Hertfordshire – Egypt', nameAr: 'جامعة هيرتفوردشاير - مصر', typeEn: 'International Branch', typeAr: 'فرع أجنبي', locationEn: 'New Administrative Capital', locationAr: 'العاصمة الإدارية الجديدة' },
  { id: '2', nameEn: 'Galala University', nameAr: 'جامعة الجلالة', typeEn: 'National', typeAr: 'أهلية', locationEn: 'Galala City', locationAr: 'هضبة الجلالة' },
  { id: '3', nameEn: 'King Salman International University', nameAr: 'جامعة الملك سلمان الدولية', typeEn: 'National', typeAr: 'أهلية', locationEn: 'Sinai', locationAr: 'سيناء' },
  { id: '4', nameEn: 'New Alamein International University', nameAr: 'جامعة العلمين الدولية', typeEn: 'National', typeAr: 'أهلية', locationEn: 'New Alamein', locationAr: 'العلمين الجديدة' },
  { id: '5', nameEn: 'Delta University for Science and Technology', nameAr: 'جامعة الدلتا للعلوم والتكنولوجيا', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Gamasa', locationAr: 'جمصة' },
  { id: '6', nameEn: 'Al Salam University', nameAr: 'جامعة السلام', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Gharbia', locationAr: 'الغربية' },
  { id: '7', nameEn: 'Sphinx University', nameAr: 'جامعة سفنكس', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Assiut', locationAr: 'أسيوط' },
  { id: '8', nameEn: 'Egyptian Chinese University', nameAr: 'الجامعة المصرية الصينية', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Cairo', locationAr: 'القاهرة' },
  { id: '9', nameEn: '6th of October University', nameAr: 'جامعة ٦ أكتوبر', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'October', locationAr: 'أكتوبر' },
  { id: '10', nameEn: 'MSA University', nameAr: 'جامعة أكتوبر للعلوم والآداب', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'October', locationAr: 'أكتوبر' },
  { id: '11', nameEn: 'MUST', nameAr: 'جامعة مصر للعلوم والتكنولوجيا', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'October', locationAr: 'أكتوبر' },
  { id: '12', nameEn: 'MIU', nameAr: 'جامعة مصر الدولية', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Obour', locationAr: 'العبور' },
  { id: '13', nameEn: 'GUC', nameAr: 'الجامعة الألمانية بالقاهرة', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'New Cairo', locationAr: 'القاهرة الجديدة' },
  { id: '14', nameEn: 'Ahram Canadian University (ACU)', nameAr: 'جامعة الأهرام الكندية', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'October', locationAr: 'أكتوبر' },
  { id: '15', nameEn: 'British University in Egypt (BUE)', nameAr: 'الجامعة البريطانية في مصر', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Shorouk', locationAr: 'الشروق' },
  { id: '16', nameEn: 'Modern University (MTI)', nameAr: 'الجامعة الحديثة للتكنولوجيا والمعلومات', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Mokattam', locationAr: 'المقطم' },
  { id: '17', nameEn: 'Sinai University', nameAr: 'جامعة سيناء', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Arish/Ismailia', locationAr: 'العريش/الإسماعيلية' },
  { id: '18', nameEn: 'Pharos University', nameAr: 'جامعة فاروس', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Alexandria', locationAr: 'الإسكندرية' },
  { id: '19', nameEn: 'Nahda University', nameAr: 'جامعة النهضة', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Beni Suef', locationAr: 'بني سويف' },
  { id: '20', nameEn: 'Future University (FUE)', nameAr: 'جامعة المستقبل', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'New Cairo', locationAr: 'القاهرة الجديدة' },
  { id: '21', nameEn: 'Egyptian Russian University', nameAr: 'الجامعة المصرية الروسية', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Badr City', locationAr: 'مدينة بدر' },
  { id: '24', nameEn: 'New Giza University (NGU)', nameAr: 'جامعة الجيزة الجديدة', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Giza', locationAr: 'الجيزة' },
  { id: '25', nameEn: 'Deraya University', nameAr: 'جامعة دراية', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Minya', locationAr: 'المنيا' },
  { id: '26', nameEn: 'Badr University (BUC)', nameAr: 'جامعة بدر', typeEn: 'Private', typeAr: 'خاصة', locationEn: 'Badr City', locationAr: 'مدينة بدر' },
  { id: '60', nameEn: 'American University in Cairo (AUC)', nameAr: 'الجامعة الأمريكية بالقاهرة', typeEn: 'International Agreement', typeAr: 'اتفاقية دولية', locationEn: 'New Cairo', locationAr: 'القاهرة الجديدة' },
  { id: '61', nameEn: 'Egyptian-Japanese University (E-JUST)', nameAr: 'الجامعة المصرية اليابانية', typeEn: 'International Agreement', typeAr: 'اتفاقية دولية', locationEn: 'Borg El Arab', locationAr: 'برج العرب' },
  { id: '62', nameEn: 'German International University (GIU)', nameAr: 'الجامعة الألمانية الدولية', typeEn: 'International Agreement', typeAr: 'اتفاقية دولية', locationEn: 'New Administrative Capital', locationAr: 'العاصمة الإدارية الجديدة' },
  { id: '68', nameEn: 'Zewail City', nameAr: 'مدينة زويل للعلوم والتكنولوجيا', typeEn: 'National', typeAr: 'أهلية', locationEn: 'October', locationAr: 'أكتوبر' },
  { id: '78', nameEn: 'New Cairo Technological University', nameAr: 'جامعة القاهرة الجديدة التكنولوجية', typeEn: 'Technological', typeAr: 'تكنولوجية', locationEn: 'New Cairo', locationAr: 'القاهرة الجديدة' },
  { id: '79', nameEn: 'Delta Technological University', nameAr: 'جامعة الدلتا التكنولوجية', typeEn: 'Technological', typeAr: 'تكنولوجية', locationEn: 'Quweisna', locationAr: 'قويسنا' },
  { id: '80', nameEn: 'Beni Suef Technological University', nameAr: 'جامعة بني سويف التكنولوجية', typeEn: 'Technological', typeAr: 'تكنولوجية', locationEn: 'Beni Suef', locationAr: 'بني سويف' },
];

const UniversitiesTable: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].universities;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filtered = useMemo(() => {
    return universitiesData.filter(uni => {
      const name = lang === 'ar' ? uni.nameAr : uni.nameEn;
      const loc = lang === 'ar' ? uni.locationAr : uni.locationEn;
      const type = lang === 'ar' ? uni.typeAr : uni.typeEn;
      
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            loc.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'All' || 
                         (filterType === 'Private' && (type.toLowerCase().includes('private') || type.toLowerCase().includes('خاصة'))) ||
                         (filterType === 'National' && (type.toLowerCase().includes('national') || type.toLowerCase().includes('أهلية'))) ||
                         (filterType === 'International' && (type.toLowerCase().includes('international') || type.toLowerCase().includes('دولية') || type.toLowerCase().includes('فرع أجنبي'))) ||
                         (filterType === 'Technological' && (type.toLowerCase().includes('technological') || type.toLowerCase().includes('تكنولوجية')));
      
      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType, lang]);

  return (
    <section id="universities" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <FadeIn className="text-center mb-16">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{t.badge}</span>
          <h2 className="text-4xl md:text-6xl font-black text-[#1d1d1f] mt-4 tracking-tight">{t.title}</h2>
        </FadeIn>

        <FadeIn className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:w-[450px]">
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f5f5f7] border-none rounded-2xl py-4 px-6 pl-12 rtl:pr-12 rtl:pl-6 text-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />
            <svg className={`w-5 h-5 text-slate-400 absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2 p-1.5 bg-[#f5f5f7] rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {([ 'All', 'Private', 'National', 'International', 'Technological'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  filterType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {(t as any)[type.toLowerCase()]}
              </button>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="overflow-hidden border border-slate-100 rounded-[32px] apple-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right bg-white">
              <thead className="bg-[#f5f5f7] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.name}</th>
                  <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.type}</th>
                  <th className="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.location}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((uni) => (
                  <tr key={uni.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 font-bold text-[#1d1d1f] text-lg">
                      {lang === 'ar' ? uni.nameAr : uni.nameEn}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold ${
                        (uni.typeEn.includes('Private') || uni.typeAr.includes('خاصة')) 
                        ? 'bg-purple-50 text-purple-600' : 
                        (uni.typeEn.includes('National') || uni.typeAr.includes('أهلية'))
                        ? 'bg-green-50 text-green-600' :
                        (uni.typeEn.includes('Technological') || uni.typeAr.includes('تكنولوجية'))
                        ? 'bg-orange-50 text-orange-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {lang === 'ar' ? uni.typeAr : uni.typeEn}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-medium">
                      {lang === 'ar' ? uni.locationAr : uni.locationEn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default UniversitiesTable;
