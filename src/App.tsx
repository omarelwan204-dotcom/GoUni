
import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import UniversitiesTable from './components/UniversitiesTable';
import ApplicationForm from './components/ApplicationForm';
import WhyChooseUs from './components/WhyChooseUs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GeminiAssistant from './components/GeminiAssistant';
import StudioView from './components/StudioView';
import ChatView from './components/ChatView';
import ExploreView from './components/ExploreView';
import VideoView from './components/VideoView';
import VoiceView from './components/VoiceView';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Dashboard Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Pages
import UniversitySelection from './pages/UniversitySelection';
import ApplicationSupport from './pages/ApplicationSupport';
import AdmissionStrategy from './pages/AdmissionStrategy';
import ContactPage from './pages/ContactPage';
import UniversitiesPage from './pages/UniversitiesPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'student' | 'admin' }> = ({ children, role }) => {
  const { token, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !token) {
      navigate('/login');
    } else if (!isLoading && role && user?.role !== role) {
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [token, user, role, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  
  return token ? <>{children}</> : null;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'landing' | 'studio'>('landing');
  const [activeStudioTool, setActiveStudioTool] = useState<'chat' | 'explore' | 'studio' | 'video' | 'voice'>('chat');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  const LandingPage = () => (
    <div className={`min-h-screen flex flex-col overflow-x-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
      <Navbar lang={lang} toggleLang={toggleLang} />
      <main className="flex-grow">
        <Hero lang={lang} />
        <About lang={lang} />
        <Services lang={lang} onLaunchStudio={() => setView('studio')} />
        <UniversitiesTable lang={lang} />
        <ApplicationForm lang={lang} />
        <WhyChooseUs lang={lang} />
        <Contact lang={lang} />
      </main>
      <Footer lang={lang} />
      <GeminiAssistant lang={lang} />
    </div>
  );

  if (view === 'studio') {
    return (
      <div className={`min-h-screen flex flex-col bg-[#0a0a0a] text-white ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        <nav className="glass-nav sticky top-0 w-full z-[100] py-4">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-bold tracking-tighter cursor-pointer" onClick={() => setView('landing')}>GoUni AI</span>
              <div className="hidden md:flex gap-4">
                {(['chat', 'explore', 'studio', 'video', 'voice'] as const).map(tool => (
                  <button 
                    key={tool}
                    onClick={() => setActiveStudioTool(tool)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeStudioTool === tool ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {tool.charAt(0).toUpperCase() + tool.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setView('landing')}
              className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-sm font-bold transition-all"
            >
              {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
          </div>
        </nav>
        <main className="flex-grow">
          {activeStudioTool === 'chat' && <ChatView />}
          {activeStudioTool === 'explore' && <ExploreView />}
          {activeStudioTool === 'studio' && <StudioView />}
          {activeStudioTool === 'video' && <VideoView />}
          {activeStudioTool === 'voice' && <VoiceView />}
        </main>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/university-selection" element={<UniversitySelection lang={lang} toggleLang={toggleLang} />} />
          <Route path="/application-support" element={<ApplicationSupport lang={lang} toggleLang={toggleLang} />} />
          <Route path="/admission-strategy" element={<AdmissionStrategy lang={lang} toggleLang={toggleLang} />} />
          <Route path="/contact" element={<ContactPage lang={lang} toggleLang={toggleLang} />} />
          <Route path="/universities" element={<UniversitiesPage lang={lang} toggleLang={toggleLang} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
