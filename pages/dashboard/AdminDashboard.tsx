import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile, ApplicationStatus, DocumentStatus } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Edit2,
  Save,
  X,
  LayoutDashboard,
  LogOut,
  Menu,
  Eye,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  ChevronRight,
  Unlock,
  CreditCard,
  LifeBuoy,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentProfile | null>(null);
  const [editForm, setEditForm] = useState<Partial<StudentProfile>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'analytics' | 'universities' | 'staff' | 'tickets' | 'payments'>('students');
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [ticketReply, setTicketReply] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchTickets();
    if (user?.role === 'manager') {
      fetchStaff();
    }
  }, [token, user]);

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

  const replyToTicket = async (ticketId: string, studentId: string) => {
    if (!ticketReply) return;
    try {
      const response = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: ticketReply, studentId })
      });
      if (response.ok) {
        const updatedTicket = await response.json();
        setTickets(tickets.map(t => t.id === ticketId ? { ...updatedTicket, studentId, studentName: t.studentName } : t));
        setActiveTicket({ ...updatedTicket, studentId, studentName: activeTicket.studentName });
        setTicketReply('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/staff', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let filtered = students.filter(s => 
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phoneNumber && s.phoneNumber.includes(searchQuery)) ||
      s.selectedUniversity.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (statusFilter !== 'All') {
      filtered = filtered.filter(s => s.applicationStatus === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [searchQuery, statusFilter, students]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, updateData: any = editForm) => {
    try {
      const response = await fetch(`/api/admin/students/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      if (response.ok) {
        setEditingId(null);
        fetchStudents();
        if (viewingStudent && viewingStudent.id === id) {
          const updated = await response.json();
          setViewingStudent(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocumentStatus = async (studentId: string, docType: string, status: DocumentStatus) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const feedback = status === 'Rejected' ? prompt('Enter reason for rejection:') : '';
    if (status === 'Rejected' && feedback === null) return;

    const updatedDocs = student.documents.map(d => 
      d.type === docType ? { ...d, status, feedback: feedback || undefined } : d
    );

    await handleUpdate(studentId, { documents: updatedDocs });
  };

  const verifyManualPayment = async (studentId: string, paymentId: string, status: 'Approved' | 'Rejected') => {
    const adminNote = status === 'Rejected' ? prompt('Enter reason for rejection:') : '';
    if (status === 'Rejected' && adminNote === null) return;

    await handleUpdate(studentId, { 
      paymentInfo: students.find(s => s.id === studentId)?.paymentInfo,
      verifyManualPayment: { paymentId, status, adminNote: adminNote || '' }
    });
  };

  const handleGenerateReceipt = (student: StudentProfile, payment: any) => {
    const receiptContent = `
      GOUNI UNIVERSITY CONSULTING - OFFICIAL RECEIPT
      ----------------------------------------------
      Receipt ID: REC-${payment.id.toUpperCase()}
      Date: ${new Date(payment.timestamp).toLocaleDateString()}
      
      Student Name: ${student.fullName}
      Application ID: ${student.id.toUpperCase()}
      
      Payment Amount: EGP ${payment.amount.toLocaleString()}
      Payment Status: ${payment.status}
      
      Thank you for choosing GoUni!
    `;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${student.fullName}-${payment.id}.txt`;
    link.click();
  };

  // Analytics Data
  const statusData = [
    { name: 'Received', value: students.filter(s => s.applicationStatus === 'Received').length },
    { name: 'Review', value: students.filter(s => s.applicationStatus === 'Under Review').length },
    { name: 'Submitted', value: students.filter(s => s.applicationStatus === 'Submitted').length },
    { name: 'Decision', value: students.filter(s => s.applicationStatus === 'Decision').length },
    { name: 'Finalized', value: students.filter(s => s.applicationStatus === 'Finalized').length },
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="text-2xl font-black tracking-tighter mb-12">GoUni Admin</div>
      
      <nav className="flex-grow space-y-2">
        <button 
          onClick={() => setActiveTab('students')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'students' ? 'bg-blue-600/10 text-blue-500' : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-5 h-5" />
          Students
        </button>
        {user?.role === 'manager' && (
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${
              activeTab === 'analytics' ? 'bg-blue-600/10 text-blue-500' : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
        )}
        {user?.role === 'manager' && (
          <button 
            onClick={() => setActiveTab('staff')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${
              activeTab === 'staff' ? 'bg-blue-600/10 text-blue-500' : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-5 h-5" />
            Staff Management
          </button>
        )}
        {user?.role === 'manager' && (
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${
              activeTab === 'payments' ? 'bg-blue-600/10 text-blue-500' : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Payments
          </button>
        )}
        <button 
          onClick={() => setActiveTab('universities')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'universities' ? 'bg-blue-600/10 text-blue-500' : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Universities
        </button>
        <button 
          onClick={() => setActiveTab('tickets')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'tickets' ? 'bg-blue-600/10 text-blue-500' : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <LifeBuoy className="w-5 h-5" />
          Support Tickets
        </button>
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
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-6 border-b border-white/10 bg-[#050505] sticky top-0 z-50">
        <div className="text-xl font-black tracking-tighter">GoUni Admin</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white/5 rounded-xl text-slate-400"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0d0d0f] border-r border-white/10 p-8 flex flex-col animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-72 border-r border-white/10 p-8 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 lg:p-12 space-y-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-blue-500 uppercase tracking-[0.3em]">Admin Control</h2>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter">Student Management</h1>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </header>

        {activeTab === 'students' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Students', value: students.length, icon: Users },
                { label: 'Pending Review', value: students.filter(s => s.applicationStatus === 'Under Review').length, icon: Clock },
                { label: 'Finalized', value: students.filter(s => s.applicationStatus === 'Finalized').length, icon: CheckCircle2 },
                { label: 'Total Revenue', value: `EGP ${students.reduce((acc, s) => acc + s.paymentInfo.amountPaid, 0).toLocaleString()}`, icon: TrendingUp }
              ].map(stat => (
                <div key={stat.label} className="bg-white/[0.03] p-8 rounded-[32px] border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <stat.icon className="w-5 h-5 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-black">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                {['All', 'Received', 'Under Review', 'Submitted', 'Decision', 'Finalized'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === status ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => alert('Generating PDF Report...')}
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>

            {/* Students Table */}
            <div className="bg-white/[0.03] rounded-[40px] border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Academic Info</th>
                      {user?.role === 'manager' && (
                        <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</th>
                      )}
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center font-bold text-blue-500">
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white">{student.fullName}</p>
                              <p className="text-xs text-slate-500">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <p className="text-sm font-medium text-white">{student.certificateType}</p>
                          <p className="text-xs text-slate-500">Score: {student.score}%</p>
                        </td>
                        {user?.role === 'manager' && (
                          <td className="p-8">
                            <select 
                              value={student.assignedTo || ''}
                              onChange={(e) => handleUpdate(student.id, { assignedTo: e.target.value })}
                              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                            >
                              <option value="" className="bg-[#0d0d0f]">Unassigned</option>
                              {staff.filter(s => s.role === 'admin').map(s => (
                                <option key={s.id} value={s.id} className="bg-[#0d0d0f]">{s.fullName}</option>
                              ))}
                            </select>
                          </td>
                        )}
                        <td className="p-8">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            student.applicationStatus === 'Finalized' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            student.applicationStatus === 'Under Review' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            {student.applicationStatus}
                          </span>
                        </td>
                        <td className="p-8">
                          <p className="text-sm font-bold text-white">EGP {student.paymentInfo.amountPaid.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">of EGP {student.paymentInfo.totalFee.toLocaleString()}</p>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setViewingStudent(student)}
                              className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingId(student.id);
                                setEditForm(student);
                              }}
                              className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Revenue</p>
                <p className="text-4xl font-black text-emerald-500">EGP {students.reduce((acc, s) => acc + s.paymentInfo.amountPaid, 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500">From {students.filter(s => s.paymentInfo.amountPaid > 0).length} students</p>
              </div>
              <div className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Revenue</p>
                <p className="text-4xl font-black text-amber-500">EGP {students.reduce((acc, s) => acc + (s.paymentInfo.totalFee - s.paymentInfo.amountPaid), 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500">Outstanding balances</p>
              </div>
              <div className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg. Revenue / Student</p>
                <p className="text-4xl font-black text-blue-500">EGP {Math.round(students.reduce((acc, s) => acc + s.paymentInfo.amountPaid, 0) / (students.length || 1)).toLocaleString()}</p>
                <p className="text-xs text-slate-500">Based on current payments</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-8">
                <h3 className="text-xl font-bold">Application Funnel</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0d0d0f', border: '1px solid #ffffff10', borderRadius: '16px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white/[0.03] p-10 rounded-[48px] border border-white/10 space-y-8">
                <h3 className="text-xl font-bold">Status Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0d0d0f', border: '1px solid #ffffff10', borderRadius: '16px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black tracking-tighter">Support Center</h2>
                <p className="text-slate-500 mt-2">Manage student inquiries and provide assistance.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4">Active Inquiries</h3>
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
                          <div className="flex gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${
                              ticket.status === 'Open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                              {ticket.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${
                              ticket.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'
                            }`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="font-bold text-white line-clamp-1">{ticket.subject}</p>
                        <p className="text-xs text-blue-500 font-bold">{ticket.studentName}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{ticket.messages[ticket.messages.length - 1].message}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                {activeTicket ? (
                  <div className="bg-white/[0.03] rounded-[48px] border border-white/10 flex flex-col h-[700px] animate-in fade-in duration-500 overflow-hidden">
                    <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                      <div>
                        <h3 className="text-xl font-bold">{activeTicket.subject}</h3>
                        <p className="text-xs text-blue-500 font-bold">From: {activeTicket.studentName} (ID: #{activeTicket.studentId.toUpperCase()})</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          activeTicket.status === 'Open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {activeTicket.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-8 space-y-6">
                      {activeTicket.messages.map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.senderRole !== 'student' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-6 rounded-[32px] ${
                            msg.senderRole !== 'student' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/10'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                            <p className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${msg.senderRole !== 'student' ? 'text-blue-200' : 'text-slate-500'}`}>
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
                          onKeyPress={e => e.key === 'Enter' && replyToTicket(activeTicket.id, activeTicket.studentId)}
                          placeholder="Type your response..."
                          className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        <button 
                          onClick={() => replyToTicket(activeTicket.id, activeTicket.studentId)}
                          className="p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
                        >
                          <Send className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[700px] flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/10 rounded-[48px] text-slate-500 space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                      <LifeBuoy className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-bold uppercase tracking-widest text-xs">Select a ticket to respond</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'payments' && user?.role === 'manager' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="bg-white/[0.03] rounded-[48px] border border-white/10 overflow-hidden">
              <div className="p-10 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Financial Transactions</h3>
                <div className="flex gap-4">
                  <div className="px-6 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 font-bold text-sm">
                    Total Revenue: EGP {students.reduce((acc, s) => acc + s.paymentInfo.amountPaid, 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.flatMap(s => (s.paymentInfo.manualPayments || []).map(p => ({ student: s, payment: p }))).sort((a, b) => new Date(b.payment.timestamp).getTime() - new Date(a.payment.timestamp).getTime()).map(({ student, payment }) => (
                      <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-bold text-slate-400">
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white">{student.fullName}</p>
                              <p className="text-xs text-slate-500">ID: #{student.id.toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <p className="text-lg font-bold text-white">EGP {payment.amount.toLocaleString()}</p>
                        </td>
                        <td className="p-8">
                          <p className="text-sm text-slate-400">{new Date(payment.timestamp).toLocaleDateString()}</p>
                        </td>
                        <td className="p-8">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            payment.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            payment.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex justify-end gap-2">
                            <a 
                              href={payment.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                              title="View Receipt"
                            >
                              <Eye className="w-5 h-5" />
                            </a>
                            {payment.status === 'Pending' && (
                              <>
                                <button 
                                  onClick={() => verifyManualPayment(student.id, payment.id, 'Approved')}
                                  className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => verifyManualPayment(student.id, payment.id, 'Rejected')}
                                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {payment.status === 'Approved' && (
                              <button 
                                onClick={() => handleGenerateReceipt(student, payment)}
                                className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all"
                                title="Download Official Receipt"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'staff' && user?.role === 'manager' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="bg-white/[0.03] rounded-[48px] border border-white/10 overflow-hidden">
              <div className="p-10 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Staff Performance & Workload</h3>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">
                  Add Staff Member
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Staff Member</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Active Workload</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Completed Apps</th>
                      <th className="p-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {staff.map(member => (
                      <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-bold text-slate-400">
                              {member.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white">{member.fullName}</p>
                              <p className="text-xs text-slate-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            member.role === 'manager' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="p-8 text-center">
                          <p className="text-xl font-black">{member.workload || 0}</p>
                          <p className="text-[10px] text-slate-500 uppercase">Students</p>
                        </td>
                        <td className="p-8 text-center">
                          <p className="text-xl font-black text-emerald-500">{member.completed || 0}</p>
                          <p className="text-[10px] text-slate-500 uppercase">Finalized</p>
                        </td>
                        <td className="p-8 text-right">
                          <button className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        {viewingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setViewingStudent(null)}></div>
            <div className="relative bg-[#0d0d0f] border border-white/10 rounded-[48px] w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
              <div className="p-12 space-y-12">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center text-3xl font-bold text-blue-500">
                      {viewingStudent.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black">{viewingStudent.fullName}</h3>
                      <p className="text-slate-500">{viewingStudent.email}</p>
                      <p className="text-xs font-mono text-blue-500 mt-1">#{viewingStudent.id.toUpperCase()}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingStudent(null)} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</p>
                    <p className="text-lg font-bold">{viewingStudent.phoneNumber || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">High School Type</p>
                    <p className="text-lg font-bold">{viewingStudent.highSchoolType}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Certificate</p>
                    <p className="text-lg font-bold">{viewingStudent.certificateType}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score</p>
                    <p className="text-lg font-bold">{viewingStudent.score}%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preferred University</p>
                    <p className="text-lg font-bold">{viewingStudent.selectedUniversity}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preferred Major</p>
                    <p className="text-lg font-bold text-blue-500">{viewingStudent.selectedMajor}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                    <select 
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none w-full"
                      value={viewingStudent.applicationStatus}
                      onChange={e => handleUpdate(viewingStudent.id, { applicationStatus: e.target.value })}
                    >
                      {['Received', 'Under Review', 'Submitted', 'Decision', 'Finalized'].map(s => (
                        <option key={s} value={s} className="bg-[#1d1d1f]">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {viewingStudent.notes && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Notes</p>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 italic text-slate-400">
                      "{viewingStudent.notes}"
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Internal Admin Notes</p>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Add private notes about this application..."
                    defaultValue={viewingStudent.internalNotes}
                    onBlur={e => handleUpdate(viewingStudent.id, { internalNotes: e.target.value })}
                  />
                </div>

                {/* Documents Section */}
                <div className="space-y-6">
                  <h4 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Uploaded Documents
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {viewingStudent.documents.map((doc) => (
                      <div key={doc.type} className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="font-bold text-sm">{doc.type.replace('_', ' ')}</p>
                            <p className="text-xs text-slate-500">Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDocumentStatus(viewingStudent.id, doc.type, 'Approved')}
                              className={`p-2 rounded-xl transition-all ${doc.status === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500 hover:text-emerald-500'}`}
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDocumentStatus(viewingStudent.id, doc.type, 'Rejected')}
                              className={`p-2 rounded-xl transition-all ${doc.status === 'Rejected' ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-500 hover:text-red-500'}`}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                        {doc.feedback && (
                          <p className="text-xs text-red-500 font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                            Rejection Note: {doc.feedback}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual Payments Verification */}
                {viewingStudent.paymentInfo.manualPayments && viewingStudent.paymentInfo.manualPayments.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                      Manual Payment Receipts
                    </h4>
                    <div className="space-y-4">
                      {viewingStudent.paymentInfo.manualPayments.map((payment) => (
                        <div key={payment.id} className="bg-white/5 p-8 rounded-[32px] border border-white/10 flex justify-between items-center">
                          <div className="space-y-2">
                            <p className="text-2xl font-black">EGP {payment.amount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Submitted {new Date(payment.timestamp).toLocaleDateString()}</p>
                            {payment.notes && <p className="text-sm text-slate-400 italic">"{payment.notes}"</p>}
                            {payment.adminNote && <p className="text-xs text-red-500 font-bold">Admin Note: {payment.adminNote}</p>}
                          </div>
                          <div className="flex items-center gap-4">
                            <a 
                              href={payment.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"
                            >
                              <Eye className="w-6 h-6" />
                            </a>
                            {payment.status === 'Pending Verification' ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => verifyManualPayment(viewingStudent.id, payment.id, 'Approved')}
                                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => verifyManualPayment(viewingStudent.id, payment.id, 'Rejected')}
                                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all text-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border ${
                                payment.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                              }`}>
                                {payment.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {user?.role === 'manager' && (
                  <div className="bg-white/5 rounded-[40px] p-10 space-y-8">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-bold">Financial Management</h4>
                      <button className="text-xs font-bold text-blue-500 uppercase tracking-widest">Add Payment</button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Fee</p>
                        <input 
                          type="number"
                          className="bg-transparent text-2xl font-black w-full outline-none border-b border-white/10 focus:border-blue-500 transition-all"
                          defaultValue={viewingStudent.paymentInfo.totalFee}
                          onBlur={e => handleUpdate(viewingStudent.id, { paymentInfo: { ...viewingStudent.paymentInfo, totalFee: Number(e.target.value) } })}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Paid</p>
                        <p className="text-2xl font-black text-emerald-500">EGP {viewingStudent.paymentInfo.amountPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Remaining</p>
                        <p className="text-2xl font-black text-red-500">EGP {(viewingStudent.paymentInfo.totalFee - viewingStudent.paymentInfo.amountPaid).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Installments</p>
                      <div className="space-y-2">
                        {viewingStudent.paymentInfo.installments.map(inst => (
                          <div key={inst.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                            <div>
                              <p className="font-bold">EGP {inst.amount.toLocaleString()}</p>
                              <p className="text-[10px] text-slate-500">Due: {new Date(inst.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                inst.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {inst.status}
                              </span>
                              {inst.status !== 'Paid' && (
                                <button 
                                  onClick={() => {
                                    const updatedInstallments = viewingStudent.paymentInfo.installments.map(i => 
                                      i.id === inst.id ? { ...i, status: 'Paid', paymentDate: Date.now() } : i
                                    );
                                    const updatedHistory = [
                                      { id: Math.random().toString(36).substr(2, 9), amount: inst.amount, date: Date.now(), method: 'Manual (Admin)' },
                                      ...viewingStudent.paymentInfo.history
                                    ];
                                    handleUpdate(viewingStudent.id, { 
                                      paymentInfo: { 
                                        ...viewingStudent.paymentInfo, 
                                        amountPaid: viewingStudent.paymentInfo.amountPaid + inst.amount,
                                        installments: updatedInstallments,
                                        history: updatedHistory
                                      } 
                                    });
                                  }}
                                  className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                                  title="Confirm Payment"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => handleUpdate(viewingStudent.id, { progress: { ...viewingStudent.progress, documentsCompleted: false } })}
                    className="flex-grow py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-5 h-5" />
                    Unlock Editing
                  </button>
                  <button 
                    onClick={() => window.open(`mailto:${viewingStudent.email}`)}
                    className="flex-grow py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all"
                  >
                    Contact Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
