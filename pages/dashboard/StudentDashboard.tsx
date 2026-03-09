import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile, ApplicationStatus, Document, UniversityRecommendation } from '../../types';
import { 
  LayoutDashboard, 
  GraduationCap, 
  CreditCard, 
  Bell, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Menu,
  X,
  Upload,
  FileText,
  QrCode,
  Download,
  Star,
  Zap,
  User,
  CheckCircle,
  Eye,
  MessageSquare,
  LifeBuoy,
  Send,
  MessageCircle,
  ShieldCheck,
  Search,
  FileSearch,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'payments' | 'notifications' | 'documents' | 'recommendations' | 'qr' | 'profile' | 'support'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [ticketReply, setTicketReply] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/student/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          logout();
          navigate('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/tickets', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const verifyPayment = async (sessionId: string) => {
      try {
        const response = await fetch(`/api/payments/verify?session_id=${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
          // Remove query params from URL
          window.history.replaceState({}, '', '/dashboard');
        }
      } catch (err) {
        console.error('Payment verification failed:', err);
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const paymentStatus = urlParams.get('payment');

    if (sessionId && paymentStatus === 'success') {
      verifyPayment(sessionId);
    } else if (token) {
      fetchProfile();
      fetchTickets();
    }
  }, [token, logout, navigate]);

  const createTicket = async () => {
    if (!newTicketSubject || !newTicketMessage) return;
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject: newTicketSubject, message: newTicketMessage })
      });
      if (response.ok) {
        const data = await response.json();
        setTickets([...tickets, data]);
        setNewTicketSubject('');
        setNewTicketMessage('');
        alert('Support ticket created successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const replyToTicket = async (ticketId: string) => {
    if (!ticketReply) return;
    try {
      const response = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: ticketReply })
      });
      if (response.ok) {
        const updatedTicket = await response.json();
        setTickets(tickets.map(t => t.id === ticketId ? updatedTicket : t));
        setActiveTicket(updatedTicket);
        setTicketReply('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async (amount: number, installmentId?: string) => {
    try {
      const response = await fetch('/api/student/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, installmentId })
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('An error occurred while initiating payment');
    }
  };

  const handleProfileUpdate = async (updates: Partial<StudentProfile>) => {
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('An error occurred while updating profile');
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stages: ApplicationStatus[] = ['Received', 'Under Review', 'Submitted', 'Decision', 'Finalized'];
  const currentStageIndex = stages.indexOf(profile.applicationStatus);

  // Calculate Progress Percentage
  const calculateProgress = () => {
    const { progress } = profile;
    let total = 0;
    if (progress.profileCompleted) total += 30;
    if (progress.academicCompleted) total += 20;
    if (progress.preferencesCompleted) total += 20;
    if (progress.documentsCompleted) total += 20;
    if (progress.finalReviewCompleted) total += 10;
    return total;
  };

  const progressPercent = calculateProgress();

  const handleFileUpload = (type: string) => {
    setSelectedDocType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocType) return;

    setUploadingDoc(selectedDocType);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', selectedDocType);

    try {
      const response = await fetch('/api/student/upload-document', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        const error = await response.json();
        alert(error.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during upload');
    } finally {
      setUploadingDoc(null);
      setSelectedDocType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !receiptAmount) {
      alert('Please enter the amount paid first.');
      return;
    }

    setUploadingReceipt(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('amount', receiptAmount);
    formData.append('notes', receiptNotes);

    try {
      const response = await fetch('/api/student/upload-receipt', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setReceiptAmount('');
        setReceiptNotes('');
        alert('Receipt uploaded successfully! It is now pending verification.');
      } else {
        const error = await response.json();
        alert(error.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during upload');
    } finally {
      setUploadingReceipt(false);
      if (receiptInputRef.current) receiptInputRef.current.value = '';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Application Form', icon: User },
    { id: 'applications', label: 'Applications', icon: GraduationCap },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'recommendations', label: 'Smart Suggest', icon: Zap },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'support', label: 'Help Center', icon: LifeBuoy },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'qr', label: 'My QR', icon: QrCode },
  ];

  const SidebarContent = () => (
    <>
      <div className="text-2xl font-black tracking-tighter mb-12">GoUni</div>
      
      <nav className="flex-grow space-y-2">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as any);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-blue-600/10 text-blue-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <button 
        onClick={() => { logout(); navigate('/login'); }}
        className="flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-2xl font-bold transition-all mt-auto"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={onFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <input 
        type="file" 
        ref={receiptInputRef} 
        className="hidden" 
        onChange={handleReceiptUpload}
        accept=".jpg,.jpeg,.png,.pdf"
      />

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-6 border-b border-white/10 bg-[#050505] sticky top-0 z-50">
        <div className="text-xl font-black tracking-tighter">GoUni</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white/5 rounded-xl text-slate-400"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-[#0d0d0f] border-r border-white/10 p-8 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-72 border-r border-white/10 p-8 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 lg:p-12 space-y-12 overflow-y-auto">
        <header className="flex justify-between items-end gap-4">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-blue-500 uppercase tracking-[0.3em]">Student Portal</h2>
            <h1 className="text-3xl lg:text-6xl font-black tracking-tighter">
              {activeTab === 'dashboard' && `Welcome, ${profile.fullName}`}
              {activeTab === 'profile' && 'Application Form'}
              {activeTab === 'applications' && 'My Applications'}
              {activeTab === 'payments' && 'Financial Center'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'documents' && 'Document Vault'}
              {activeTab === 'recommendations' && 'Smart Suggest'}
              {activeTab === 'qr' && 'Personal QR Code'}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Application ID</p>
              <p className="text-xs font-mono text-white">#{profile.id.toUpperCase()}</p>
            </div>
            <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center font-bold text-blue-500">
              {profile.fullName.charAt(0)}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl space-y-8"
            >
              <div className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">Application Information</h3>
                  <p className="text-slate-400 font-medium">
                    {profile.applicationStatus === 'Received' 
                      ? "Keep your information up to date. You can edit this form until it's under review."
                      : "Your application is currently being reviewed and cannot be edited."}
                  </p>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const updates = {
                      fullName: formData.get('fullName') as string,
                      phoneNumber: formData.get('phoneNumber') as string,
                      email: formData.get('email') as string,
                      highSchoolType: formData.get('highSchoolType') as string,
                      score: Number(formData.get('score')),
                      certificateType: formData.get('certificateType') as string,
                      selectedUniversity: formData.get('selectedUniversity') as string,
                      selectedMajor: formData.get('selectedMajor') as string,
                      notes: formData.get('notes') as string,
                    };
                    handleProfileUpdate(updates);
                  }}
                  className="grid md:grid-cols-2 gap-8"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      name="fullName"
                      disabled={profile.applicationStatus !== 'Received'}
                      defaultValue={profile.fullName}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      name="phoneNumber"
                      disabled={profile.applicationStatus !== 'Received'}
                      defaultValue={profile.phoneNumber}
                      placeholder="+20 123 456 7890"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      name="email"
                      readOnly
                      defaultValue={profile.email}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white/50 outline-none transition-all cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">High School Type</label>
                    <select 
                      name="highSchoolType"
                      disabled={profile.applicationStatus !== 'Received'}
                      defaultValue={profile.highSchoolType}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 appearance-none"
                    >
                      <option value="Thanaweya Amma" className="bg-[#0d0d0f]">Thanaweya Amma</option>
                      <option value="IGCSE" className="bg-[#0d0d0f]">IGCSE</option>
                      <option value="American Diploma" className="bg-[#0d0d0f]">American Diploma</option>
                      <option value="STEM" className="bg-[#0d0d0f]">STEM</option>
                      <option value="Azhar" className="bg-[#0d0d0f]">Azhar</option>
                      <option value="Other" className="bg-[#0d0d0f]">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Total Score (%)</label>
                    <input 
                      name="score"
                      type="number"
                      step="0.01"
                      disabled={profile.applicationStatus !== 'Received'}
                      defaultValue={profile.score}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Certificate Type</label>
                    <input 
                      name="certificateType"
                      disabled={profile.applicationStatus !== 'Received'}
                      defaultValue={profile.certificateType}
                      placeholder="e.g. Science Section"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred University</label>
                    <input 
                      name="selectedUniversity"
                      disabled={profile.applicationStatus !== 'Received'}
                      defaultValue={profile.selectedUniversity}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Major</label>
                    <input 
                      name="selectedMajor"
                      disabled={profile.applicationStatus !== 'Received'}
                      defaultValue={profile.selectedMajor}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Additional Notes</label>
                    <textarea 
                      name="notes"
                      disabled={profile.applicationStatus !== 'Received'}
                      defaultValue={profile.notes}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 resize-none"
                    />
                  </div>

                  {profile.applicationStatus === 'Received' && (
                    <div className="md:col-span-2 pt-4">
                      <button 
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/20"
                      >
                        Save Application Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Application Progress Tracker */}
              <section className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Application Journey</h3>
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Current Status: {profile.applicationStatus}</span>
                </div>
                
                <div className="relative flex justify-between">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-0 w-full h-1 bg-white/5 -z-0">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-1000" 
                      style={{ 
                        width: profile.applicationStatus === 'Received' ? '0%' :
                               profile.applicationStatus === 'Under Review' ? '33%' :
                               profile.applicationStatus === 'Submitted' ? '66%' : '100%'
                      }}
                    />
                  </div>

                  {[
                    { id: 'Received', label: 'Application Submitted', icon: Send },
                    { id: 'Under Review', label: 'Documents Verified', icon: ShieldCheck },
                    { id: 'Submitted', label: 'Reviewing by University', icon: FileSearch },
                    { id: 'Finalized', label: 'Final Decision', icon: Check }
                  ].map((step) => {
                    const statuses = ['Received', 'Under Review', 'Submitted', 'Decision', 'Finalized'];
                    const currentIndex = statuses.indexOf(profile.applicationStatus);
                    const stepIndex = statuses.indexOf(step.id);
                    const isCompleted = currentIndex >= stepIndex;
                    const isActive = profile.applicationStatus === step.id;

                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-4 w-1/4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          isCompleted ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-[#0d0d0f] text-slate-600 border border-white/10'
                        }`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-white' : 'text-slate-600'}`}>
                            {step.label}
                          </p>
                          {isActive && <p className="text-[9px] text-blue-500 font-bold animate-pulse mt-1">IN PROGRESS</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Checklist */}
              <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Profile Info', key: 'profileCompleted' },
                  { label: 'Academic Info', key: 'academicCompleted' },
                  { label: 'Preferences', key: 'preferencesCompleted' },
                  { label: 'Documents', key: 'documentsCompleted' }
                ].map((item) => (
                  <div key={item.key} className={`p-6 rounded-3xl border flex items-center gap-4 transition-all ${
                    profile.progress[item.key as keyof typeof profile.progress] 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                    : 'bg-white/5 border-white/10 text-slate-500'
                  }`}>
                    {profile.progress[item.key as keyof typeof profile.progress] 
                      ? <CheckCircle className="w-6 h-6" /> 
                      : <div className="w-6 h-6 rounded-full border-2 border-current opacity-20" />}
                    <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </section>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Details */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/10 space-y-4">
                      <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Academic Info</p>
                        <h4 className="text-xl font-bold mt-1">{profile.certificateType}</h4>
                        <p className="text-slate-400 font-medium">Score: {profile.score}%</p>
                      </div>
                    </div>
                    <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/10 space-y-4">
                      <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center">
                        <LayoutDashboard className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selection</p>
                        <h4 className="text-xl font-bold mt-1">{profile.selectedUniversity}</h4>
                        <p className="text-slate-400 font-medium">{profile.selectedMajor}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notifications Preview */}
                  <div className="bg-white/[0.03] rounded-[32px] border border-white/10 overflow-hidden">
                    <div className="p-8 border-b border-white/10 flex justify-between items-center">
                      <h3 className="text-xl font-bold">Recent Updates</h3>
                      <button 
                        onClick={() => setActiveTab('notifications')}
                        className="text-xs font-bold text-blue-500 uppercase tracking-widest"
                      >
                        View All
                      </button>
                    </div>
                    <div className="divide-y divide-white/5">
                      {profile.notifications.slice(0, 3).map(notif => (
                        <div key={notif.id} className="p-6 flex gap-4 hover:bg-white/5 transition-colors">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Bell className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-white">{notif.message}</p>
                            <p className="text-xs text-slate-500">{new Date(notif.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/10 space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Financial Center</h3>
                    <CreditCard className="w-6 h-6 text-slate-500" />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Fee</p>
                      <p className="text-3xl font-black mt-1">EGP {profile.paymentInfo.totalFee.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Paid</p>
                        <p className="text-lg font-bold text-emerald-500">EGP {profile.paymentInfo.amountPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Balance</p>
                        <p className="text-lg font-bold text-red-500">EGP {(profile.paymentInfo.totalFee - profile.paymentInfo.amountPaid).toLocaleString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('payments')}
                      className="w-full py-4 bg-white text-black rounded-2xl font-bold transition-all hover:bg-slate-200"
                    >
                      View Installments
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'documents' && (
          <motion.div 
            key="documents"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { type: 'ID_FRONT', label: 'National ID (Front)' },
                { type: 'ID_BACK', label: 'National ID (Back)' },
                { type: 'CERTIFICATE', label: 'High School Certificate' },
                { type: 'PHOTO', label: 'Personal Photo' },
                { type: 'PASSPORT', label: 'Passport (Optional)' },
                { type: 'OTHER', label: 'Additional Documents' }
              ].map((docType) => {
                const doc = profile.documents.find(d => d.type === docType.type);
                return (
                  <div key={docType.type} className="bg-white/[0.03] p-8 rounded-[32px] border border-white/10 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-slate-400" />
                      </div>
                      {doc && (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          doc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          doc.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {doc.status}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{docType.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {doc ? `Uploaded on ${new Date(doc.uploadDate).toLocaleDateString()}` : 'No file uploaded yet'}
                      </p>
                    </div>
                    {doc?.status === 'Rejected' && (
                      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl space-y-4">
                        <div className="flex items-start gap-4">
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-red-500">Document Rejected</p>
                            <p className="text-xs text-slate-400 leading-relaxed">Reason: {doc.feedback || 'Please re-upload a clearer version of this document.'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleFileUpload(docType.type)}
                          className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-xs hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Re-upload Document
                        </button>
                      </div>
                    )}
                    {uploadingDoc === docType.type ? (
                      <div className="w-full h-12 bg-white/5 rounded-2xl flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold text-blue-500">Uploading...</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleFileUpload(docType.type)}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {doc ? 'Replace File' : 'Upload File'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'recommendations' && (
          <motion.div 
            key="recommendations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {profile.recommendations.length === 0 ? (
              <div className="bg-white/[0.03] p-20 rounded-[48px] border border-white/10 text-center space-y-6">
                <Zap className="w-16 h-16 text-slate-500 mx-auto" />
                <h3 className="text-2xl font-bold">No Recommendations Yet</h3>
                <p className="text-slate-500 max-w-md mx-auto">Complete your academic profile by entering your high school score to see smart university suggestions.</p>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold"
                >
                  Update Academic Info
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {profile.recommendations.map((rec) => (
                  <div key={rec.id} className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-8 group hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          rec.tier === 'Top' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          rec.tier === 'Mid' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {rec.tier} Tier
                        </span>
                        <h3 className="text-3xl font-black">{rec.universityName}</h3>
                        <p className="text-xl font-bold text-blue-500">{rec.major}</p>
                      </div>
                      <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center group-hover:bg-blue-600/10 transition-all">
                        <Star className="w-8 h-8 text-slate-500 group-hover:text-blue-500 transition-all" />
                      </div>
                    </div>
                    <p className="text-slate-400 font-medium leading-relaxed">{rec.reason}</p>
                    <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Tuition</p>
                        <p className="text-2xl font-black">EGP {rec.estimatedFees.toLocaleString()}</p>
                      </div>
                      <button className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all">
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'qr' && (
          <motion.div 
            key="qr"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12 space-y-8"
          >
            <div className="bg-white p-12 rounded-[48px] shadow-2xl">
              <QRCodeSVG 
                value={JSON.stringify({ id: profile.id, name: profile.fullName, status: profile.applicationStatus })}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Your Personal QR Code</h3>
              <p className="text-slate-500 max-w-xs">Show this code to GoUni staff for instant profile access and verification.</p>
            </div>
            <button className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
              <Download className="w-5 h-5" />
              Download QR
            </button>
          </motion.div>
        )}

        {activeTab === 'applications' && (
          <motion.div 
            key="applications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/[0.03] p-12 rounded-[48px] border border-white/10 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold">My University Applications</h3>
            <p className="text-slate-400 max-w-md mx-auto">View and manage all your university applications in one place.</p>
            <div className="grid gap-4 max-w-2xl mx-auto pt-8">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex justify-between items-center text-left">
                <div>
                  <h4 className="font-bold">{profile.selectedUniversity}</h4>
                  <p className="text-sm text-slate-500">{profile.selectedMajor}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-blue-600/10 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-600/20">
                    {profile.applicationStatus}
                  </span>
                  <button 
                    onClick={() => alert('Generating admission letter PDF...')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                    title="Download PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'payments' && (
          <motion.div 
            key="payments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/10 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Service Fee</p>
                <p className="text-3xl font-black">EGP {profile.paymentInfo.totalFee.toLocaleString()}</p>
              </div>
              <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/10 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount Paid</p>
                <p className="text-3xl font-black text-emerald-500">EGP {profile.paymentInfo.amountPaid.toLocaleString()}</p>
              </div>
              <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/10 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Remaining</p>
                <p className="text-3xl font-black text-red-500">EGP {(profile.paymentInfo.totalFee - profile.paymentInfo.amountPaid).toLocaleString()}</p>
              </div>
            </div>

            {/* Rejected Documents Alert */}
            {profile.documents.some(d => d.status === 'Rejected') && (
              <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[32px] flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-red-500">Action Required: Document Rejected</h4>
                    <p className="text-sm text-slate-400">One or more of your documents were rejected by our team. Please check the Documents tab for details.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('documents')}
                  className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all"
                >
                  Fix Now
                </button>
              </div>
            )}

            {/* Application Progress Tracker */}
            <div className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Application Journey</h3>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Current Status: {profile.applicationStatus}</span>
              </div>
              
              <div className="relative flex justify-between">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 w-full h-1 bg-white/5 -z-0">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000" 
                    style={{ 
                      width: profile.applicationStatus === 'Received' ? '0%' :
                             profile.applicationStatus === 'Under Review' ? '33%' :
                             profile.applicationStatus === 'Submitted' ? '66%' : '100%'
                    }}
                  />
                </div>

                {[
                  { id: 'Received', label: 'Application Submitted', icon: Send },
                  { id: 'Under Review', label: 'Documents Verified', icon: ShieldCheck },
                  { id: 'Submitted', label: 'Reviewing by University', icon: FileSearch },
                  { id: 'Finalized', label: 'Final Decision', icon: Check }
                ].map((step, index) => {
                  const statuses = ['Received', 'Under Review', 'Submitted', 'Decision', 'Finalized'];
                  const currentIndex = statuses.indexOf(profile.applicationStatus);
                  const stepIndex = statuses.indexOf(step.id);
                  const isCompleted = currentIndex >= stepIndex;
                  const isActive = profile.applicationStatus === step.id;

                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-4 w-1/4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isCompleted ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-[#0d0d0f] text-slate-600 border border-white/10'
                      }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-white' : 'text-slate-600'}`}>
                          {step.label}
                        </p>
                        {isActive && <p className="text-[9px] text-blue-500 font-bold animate-pulse mt-1">IN PROGRESS</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Installments */}
              <div className="bg-white/[0.03] rounded-[40px] border border-white/10 overflow-hidden">
                <div className="p-8 border-b border-white/10">
                  <h3 className="text-xl font-bold">Installment Plan</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {profile.paymentInfo.installments.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 italic">No installment plan set.</div>
                  ) : (
                    profile.paymentInfo.installments.map((inst) => (
                      <div key={inst.id} className="p-8 flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold">EGP {inst.amount.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">Due: {new Date(inst.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            inst.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            inst.status === 'Overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {inst.status}
                          </span>
                          {inst.status !== 'Paid' && (
                            <button 
                              onClick={() => handlePayment(inst.amount, inst.id)}
                              className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {profile.paymentInfo.totalFee > profile.paymentInfo.amountPaid && (
                  <div className="p-8 bg-blue-600/5 border-t border-white/10">
                    <button 
                      onClick={() => handlePayment(profile.paymentInfo.totalFee - profile.paymentInfo.amountPaid)}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Pay Remaining Balance
                    </button>
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div className="bg-white/[0.03] rounded-[40px] border border-white/10 overflow-hidden">
                <div className="p-8 border-b border-white/10">
                  <h3 className="text-xl font-bold">Transaction History</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {profile.paymentInfo.history.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 italic">No transactions found.</div>
                  ) : (
                    profile.paymentInfo.history.map((pay) => (
                      <div key={pay.id} className="p-8 flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold text-emerald-500">+ EGP {pay.amount.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">{new Date(pay.date).toLocaleDateString()} • {pay.method}</p>
                        </div>
                        <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Manual Payment Instructions & Upload */}
              <div className="space-y-8">
                <div className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold">Manual Payment Instructions</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                      <h4 className="font-bold text-blue-500">Option 1: Vodafone Cash</h4>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Number: <span className="text-white font-bold">01012345678</span></p>
                        <p className="text-xs text-slate-500">Transfer the amount and keep the screenshot.</p>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                      <h4 className="font-bold text-blue-500">Option 2: Bank Transfer</h4>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Bank: <span className="text-white font-bold">CIB Egypt</span></p>
                        <p className="text-sm font-medium">Account: <span className="text-white font-bold">12345678901234</span></p>
                        <p className="text-sm font-medium">Name: <span className="text-white font-bold">GoUni Education Services</span></p>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 space-y-6">
                      <h4 className="font-bold">Submit Payment Receipt</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount Paid (EGP)</label>
                          <input 
                            type="number" 
                            value={receiptAmount}
                            onChange={(e) => setReceiptAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notes (Optional)</label>
                          <input 
                            type="text" 
                            value={receiptNotes}
                            onChange={(e) => setReceiptNotes(e.target.value)}
                            placeholder="e.g. Transaction ID or sender name"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                        <button 
                          onClick={() => receiptInputRef.current?.click()}
                          disabled={uploadingReceipt || !receiptAmount}
                          className="flex-grow py-4 bg-white text-black rounded-2xl font-bold transition-all hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {uploadingReceipt ? (
                            <>
                              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              Upload to Website
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => {
                            const message = encodeURIComponent(`Hello GoUni Team! I've just made a payment for my application.\n\nName: ${profile.fullName}\nApplication ID: ${profile.id.toUpperCase()}\nAmount: EGP ${receiptAmount}`);
                            window.open(`https://wa.me/201012345678?text=${message}`, '_blank');
                          }}
                          disabled={!receiptAmount}
                          className="flex-grow py-4 bg-[#25D366]/10 text-[#25D366] rounded-2xl font-bold transition-all hover:bg-[#25D366]/20 disabled:opacity-50 flex items-center justify-center gap-3 border border-[#25D366]/20"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Send via WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manual Payment History */}
                <div className="bg-white/[0.03] rounded-[48px] border border-white/10 overflow-hidden">
                  <div className="p-8 border-b border-white/10">
                    <h3 className="text-xl font-bold">Manual Payment History</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {!profile.paymentInfo.manualPayments || profile.paymentInfo.manualPayments.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 italic">No manual payments submitted yet.</div>
                    ) : (
                      profile.paymentInfo.manualPayments.map((payment) => (
                        <div key={payment.id} className="p-8 flex justify-between items-center">
                          <div>
                            <p className="text-lg font-bold">EGP {payment.amount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{new Date(payment.timestamp).toLocaleDateString()}</p>
                            {payment.adminNote && (
                              <p className="text-xs text-red-500 mt-2 font-medium">Note: {payment.adminNote}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                              payment.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              payment.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                              {payment.status}
                            </span>
                            <a 
                              href={payment.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                            >
                              <Eye className="w-5 h-5" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'support' && (
          <motion.div 
            key="support"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black tracking-tighter">Help Center</h2>
                <p className="text-slate-500 mt-2">Need assistance? Our support team is here to help you.</p>
              </div>
              <button 
                onClick={() => setActiveTicket({ id: 'new' })}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                New Support Ticket
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4">My Inquiries</h3>
                <div className="space-y-2">
                  {tickets.length === 0 ? (
                    <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/10 text-slate-500 italic">
                      No tickets yet.
                    </div>
                  ) : (
                    tickets.map(ticket => (
                      <button
                        key={ticket.id}
                        onClick={() => setActiveTicket(ticket)}
                        className={`w-full text-left p-6 rounded-[32px] border transition-all space-y-2 ${
                          activeTicket?.id === ticket.id ? 'bg-blue-600/10 border-blue-600/30' : 'bg-white/[0.03] border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${
                            ticket.status === 'Open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-[10px] text-slate-500">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="font-bold text-white line-clamp-1">{ticket.subject}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{ticket.messages[ticket.messages.length - 1].message}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                {activeTicket?.id === 'new' ? (
                  <div className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-bold">Create New Ticket</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                        <input 
                          type="text" 
                          value={newTicketSubject}
                          onChange={e => setNewTicketSubject(e.target.value)}
                          placeholder="What do you need help with?"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Message</label>
                        <textarea 
                          rows={5}
                          value={newTicketMessage}
                          onChange={e => setNewTicketMessage(e.target.value)}
                          placeholder="Describe your issue in detail..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setActiveTicket(null)}
                          className="flex-grow py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={createTicket}
                          className="flex-grow py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
                        >
                          Submit Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeTicket ? (
                  <div className="bg-white/[0.03] rounded-[48px] border border-white/10 flex flex-col h-[600px] animate-in fade-in duration-500 overflow-hidden">
                    <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                      <div>
                        <h3 className="text-xl font-bold">{activeTicket.subject}</h3>
                        <p className="text-xs text-slate-500">Ticket ID: #{activeTicket.id.toUpperCase()}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        activeTicket.status === 'Open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {activeTicket.status}
                      </span>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-8 space-y-6">
                      {activeTicket.messages.map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.senderRole === 'student' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-6 rounded-[32px] ${
                            msg.senderRole === 'student' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/10'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                            <p className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${msg.senderRole === 'student' ? 'text-blue-200' : 'text-slate-500'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 bg-white/[0.02] border-t border-white/10">
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          value={ticketReply}
                          onChange={e => setTicketReply(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && replyToTicket(activeTicket.id)}
                          placeholder="Type your message..."
                          className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        <button 
                          onClick={() => replyToTicket(activeTicket.id)}
                          className="p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
                        >
                          <Send className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[600px] flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/10 rounded-[48px] text-slate-500 space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                      <LifeBuoy className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-bold uppercase tracking-widest text-xs">Select a ticket to view conversation</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'notifications' && (
          <motion.div 
            key="notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/[0.03] rounded-[32px] border border-white/10 overflow-hidden max-w-4xl"
          >
            <div className="p-8 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold">All Notifications</h3>
              <button className="text-xs font-bold text-blue-500 uppercase tracking-widest">Clear All</button>
            </div>
            <div className="divide-y divide-white/5">
              {profile.notifications.map(notif => (
                <div key={notif.id} className="p-8 flex gap-6 hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-white">{notif.message}</p>
                    <p className="text-sm text-slate-500">{new Date(notif.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
