import React, { useState, useEffect } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../services/db';
import { secondaryAuth } from '../services/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  User, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Zap,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';

const DEPTS = ['Engineering','Marketing','Design','Sales','Finance','Operations','HR'];
const ROLES_LIST = ['Manager','Senior Developer','Developer','Designer','Sales Executive','Accountant','HR Executive','Intern'];
const STATUS = ['Active','Inactive','On Leave'];
const SAL_TYPES = ['Fixed','Percentage','Hybrid'];
const PAY_FREQ = ['Monthly','Bi-Weekly','Weekly'];

const emptyEmp = {
  employeeId:'', fullName:'', email:'', phone:'', role:'', department:'',
  joinDate:'', status:'Active', address:'', notes:'',
  loginEmail:'', loginPassword:'',
  salary: { type:'Fixed', fixedAmount:0, commissionPct:0, bonusAmount:0, deduction:0, overtime:0, allowance:0, frequency:'Monthly', effectiveDate:'' }
};

export default function Employees() {
  const { userRole } = useAuth();
  const { settings } = useSettings();
  const sym = settings?.financial?.currencySymbol || '$';
  const isAdmin = userRole === 'Admin';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewingEmp, setViewingEmp] = useState(null);
  const [editingEmp, setEditingEmp] = useState(null);
  const [form, setForm] = useState(emptyEmp);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    try { const d = await getEmployees(); setEmployees(d); }
    catch(e) { console.error(e); }
    setLoading(false);
  };

  const openAdd = () => { setForm(emptyEmp); setEditingEmp(null); setActiveTab('profile'); setShowModal(true); };
  const openEdit = (emp) => { setForm(emp); setEditingEmp(emp.id); setActiveTab('profile'); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingEmp(null); setMsg(null); };

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const setSal = (field, val) => setForm(p => ({ ...p, salary: { ...p.salary, [field]: val } }));

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (editingEmp) {
        const { loginEmail, loginPassword, ...profileData } = form;
        await updateEmployee(editingEmp, profileData);
        setMsg({ type:'success', text: 'Employee profile updated successfully.' });
        fetch();
        setTimeout(closeModal, 1500);
      } else {
        if (!form.loginEmail) throw new Error('Login email is required.');
        if (!form.loginPassword || form.loginPassword.length < 6)
          throw new Error('Password must be at least 6 characters.');
        if (!form.fullName) throw new Error('Full name is required.');

        const credential = await createUserWithEmailAndPassword(secondaryAuth, form.loginEmail, form.loginPassword);
        const uid = credential.user.uid;
        await signOut(secondaryAuth);

        await setDoc(doc(db, 'users', uid), {
          email: form.loginEmail,
          name: form.fullName,
          role: 'Employee',
          createdAt: serverTimestamp()
        });

        const { loginPassword, loginEmail, ...profileData } = form;
        await setDoc(doc(db, 'employees', uid), {
          ...profileData,
          uid,
          loginEmail,
          createdAt: serverTimestamp()
        });

        setMsg({ type:'success', text: `Employee account created! They can log in with: ${form.loginEmail}` });
        fetch();
        setTimeout(closeModal, 2500);
      }
    } catch(err) {
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered in the system.';
      else if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      else if (err.code === 'auth/weak-password') msg = 'Password is too weak. Use at least 6 characters.';
      setMsg({ type:'error', text: msg });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee profile? This will not remove their Auth account.')) return;
    await deleteEmployee(id);
    fetch();
  };

  const toggleStatus = async (emp) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    await updateEmployee(emp.id, { status: newStatus });
    fetch();
  };

  const filtered = employees.filter(e => {
    const matchSearch = e.fullName?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="h-screen flex flex-col space-y-10 overflow-hidden pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
            <ShieldCheck size={12} strokeWidth={3} />
            <span>Human Resources</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Employee Core</h1>
          <p className="text-slate-500 text-sm mt-3 font-medium">Managing institutional talent, role distribution, and payroll structures.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={openAdd} 
            className="flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white rounded-[20px] hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={3} />
            Add Employee
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap gap-4 items-center px-1">
        <div className="relative group flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm" 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <select 
            className="px-5 py-3.5 bg-white border border-slate-200 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer hover:border-blue-300" 
            value={deptFilter} 
            onChange={e=>setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {DEPTS.map(d=><option key={d}>{d}</option>)}
          </select>
          
          <select 
            className="px-5 py-3.5 bg-white border border-slate-200 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer hover:border-blue-300" 
            value={statusFilter} 
            onChange={e=>setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            {STATUS.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i=><div key={i} className="bg-white border border-slate-100 rounded-[40px] h-64 animate-pulse shadow-sm"/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-[48px] p-24 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Users size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Talent Records Found</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">Try adjusting your filters or search criteria to find team members.</p>
            {isAdmin && (
              <button onClick={openAdd} className="px-8 py-3.5 bg-blue-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
                Onboard New Member
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map(emp => (
              <div 
                key={emp.id} 
                onClick={() => setViewingEmp(emp)}
                className="bg-white border border-slate-200/60 rounded-[40px] p-8 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                
                {/* Profile Header */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
                      {emp.fullName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{emp.fullName}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100/50">{emp.role}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{emp.department}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                      <button onClick={()=>openEdit(emp)} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm"><Edit2 size={14} strokeWidth={2.5}/></button>
                      <button onClick={()=>handleDelete(emp.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={14} strokeWidth={2.5}/></button>
                    </div>
                  )}
                </div>

                {/* Metrics / Details */}
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><FileText size={14}/></div>
                    <span>ID: {emp.employeeId || 'System Managed'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={14}/></div>
                    <span className="truncate">{emp.email}</span>
                  </div>
                </div>

                {/* Salary Section (Admin Only) */}
                {isAdmin && emp.salary && (
                  <div className="bg-slate-900 rounded-[32px] p-6 mb-8 border border-slate-800 relative overflow-hidden group/salary">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-blue-400" strokeWidth={3} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Compensation</span>
                      </div>
                      <span className="text-[9px] font-black text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1 rounded-xl uppercase tracking-widest">{emp.salary.type} Plan</span>
                    </div>
                    <div className="flex items-baseline gap-1 relative z-10">
                      <span className="text-3xl font-black text-white tracking-tighter">{sym}{(emp.salary.fixedAmount||0).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">/ {emp.salary.frequency?.toLowerCase()}</span>
                    </div>
                  </div>
                )}

                {/* Action Footer */}
                <div className="flex justify-between items-center relative z-10">
                  <span className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] border ${
                    emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 
                    emp.status === 'On Leave' ? 'bg-amber-50 text-amber-600 border-amber-100/50' : 'bg-rose-50 text-rose-600 border-rose-100/50'
                  }`}>
                    {emp.status}
                  </span>
                  {isAdmin && (
                    <button 
                      onClick={(e)=>{ e.stopPropagation(); toggleStatus(emp); }} 
                      className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl transition-all border ${
                        emp.status==='Active' 
                          ? 'text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white' 
                          : 'text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      {emp.status==='Active' ? 'Suspend Access' : 'Restore Access'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/20 animate-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-10 border-b border-slate-50">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{editingEmp ? 'Modify Profile' : 'Institutional Onboarding'}</h2>
                <p className="text-slate-500 text-sm font-medium mt-3">Registering new personnel and defining compensation parameters.</p>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
                <X size={28} strokeWidth={3} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-4 px-10 pt-6">
              {[
                {id:'profile', label: 'Biographical Profile', icon: User},
                {id:'salary', label: 'Payroll & Benefits', icon: DollarSign}
              ].map(tab=>(
                <button 
                  key={tab.id} 
                  onClick={()=>setActiveTab(tab.id)} 
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    activeTab===tab.id 
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  <tab.icon size={14} strokeWidth={3} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form Body */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <form onSubmit={handleSave} className="space-y-10">
                {msg && (
                  <div className={`p-5 rounded-3xl flex items-center gap-3 text-sm font-bold border animate-in slide-in-from-top ${
                    msg.type==='success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' : 'bg-rose-50 text-rose-700 border-rose-100/50'
                  }`}>
                    {msg.type==='success' ? <CheckCircle2 size={20} strokeWidth={3}/> : <XCircle size={20} strokeWidth={3}/>} 
                    {msg.text}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="grid grid-cols-2 gap-8">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Legal Full Nomenclature</label>
                      <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" placeholder="e.g. Jonathan Alexander Doe" value={form.fullName||''} onChange={e=>set('fullName',e.target.value)}/>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Institutional UID</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={form.employeeId||''} onChange={e=>set('employeeId',e.target.value)}/>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Contact Email</label>
                      <input type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={form.email||''} onChange={e=>set('email',e.target.value)}/>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Telecom Link</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={form.phone||''} onChange={e=>set('phone',e.target.value)}/>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Induction Date</label>
                      <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={form.joinDate||''} onChange={e=>set('joinDate',e.target.value)}/>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Residence Location</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={form.address||''} onChange={e=>set('address',e.target.value)}/>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Operational Role</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer" value={form.role||''} onChange={e=>set('role',e.target.value)}>
                        <option value="">Select Role</option>
                        {ROLES_LIST.map(r=><option key={r}>{r}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Department Sector</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer" value={form.department||''} onChange={e=>set('department',e.target.value)}>
                        <option value="">Select Department</option>
                        {DEPTS.map(d=><option key={d}>{d}</option>)}
                      </select>
                    </div>

                    {!editingEmp && (
                      <div className="col-span-2 mt-4">
                        <div className="bg-slate-900 rounded-[32px] p-8 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                          <div className="flex items-center gap-3 mb-8">
                            <Lock size={18} className="text-blue-400" strokeWidth={3} />
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-white">System Access Credentials</h3>
                            <span className="ml-auto text-[9px] font-bold text-slate-500 uppercase tracking-widest">Authentication Tier</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Login Email</label>
                              <div className="relative group/input">
                                <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" />
                                <input
                                  type="email"
                                  required={!editingEmp}
                                  placeholder="name@agency.com"
                                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                  value={form.loginEmail||''}
                                  onChange={e=>set('loginEmail',e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">System Password</label>
                              <div className="relative group/input">
                                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" />
                                <input
                                  type={showPwd ? 'text' : 'password'}
                                  required={!editingEmp}
                                  placeholder="••••••••"
                                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-14 pr-14 py-4 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                  value={form.loginPassword||''}
                                  onChange={e=>set('loginPassword',e.target.value)}
                                />
                                <button type="button" onClick={()=>setShowPwd(p=>!p)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-all">
                                  {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {form.loginPassword && form.loginPassword.length > 0 && (
                            <div className="mt-6 flex items-center gap-2">
                              {form.loginPassword.length < 6 ? (
                                <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><XCircle size={14}/> Security Threshold Not Met</p>
                              ) : (
                                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={14}/> Security Requirements Satisfied</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'salary' && (
                  <div className="space-y-10">
                    <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-4 items-center">
                      <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20"><Zap size={20} strokeWidth={3}/></div>
                      <p className="text-xs font-bold text-blue-900">Define the compensation structure for this personnel record. Financial models support Fixed, Commission-based, or Hybrid architectures.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Salary Model</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer" value={form.salary?.type||'Fixed'} onChange={e=>setSal('type',e.target.value)}>
                          {SAL_TYPES.map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Disbursement Frequency</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer" value={form.salary?.frequency||'Monthly'} onChange={e=>setSal('frequency',e.target.value)}>
                          {PAY_FREQ.map(f=><option key={f}>{f}</option>)}
                        </select>
                      </div>
                      
                      {(form.salary?.type==='Fixed'||form.salary?.type==='Hybrid') && (
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Fixed Basic Salary ({sym})</label>
                          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none" value={form.salary?.fixedAmount||0} onChange={e=>setSal('fixedAmount',Number(e.target.value))}/>
                        </div>
                      )}
                      
                      {(form.salary?.type==='Percentage'||form.salary?.type==='Hybrid') && (
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Performance Commission (%)</label>
                          <input type="number" min="0" max="100" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none" value={form.salary?.commissionPct||0} onChange={e=>setSal('commissionPct',Number(e.target.value))}/>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Allocated Allowances ({sym})</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none" value={form.salary?.allowance||0} onChange={e=>setSal('allowance',Number(e.target.value))}/>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Total Deductions ({sym})</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none text-rose-500" value={form.salary?.deduction||0} onChange={e=>setSal('deduction',Number(e.target.value))}/>
                      </div>
                    </div>

                    {/* Net Payroll Calculation */}
                    <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group/calc">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover/calc:scale-125 transition-transform duration-700"></div>
                      <div className="flex justify-between items-center mb-6 relative z-10">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Net Financial Commitment</p>
                          <p className="text-4xl font-black tracking-tighter">
                            {sym}{Math.max(0,(Number(form.salary?.fixedAmount||0)+Number(form.salary?.bonusAmount||0)+Number(form.salary?.allowance||0)-Number(form.salary?.deduction||0))).toLocaleString()}
                          </p>
                        </div>
                        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 group-hover/calc:rotate-6 transition-transform">
                          <DollarSign size={28} strokeWidth={3} />
                        </div>
                      </div>
                      <div className="pt-6 border-t border-slate-800 flex justify-between items-center relative z-10">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Base + Bonus + Allowance − Deductions</span>
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle2 size={12} strokeWidth={3} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Validated for {form.salary?.frequency} cycle</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-10 border-t border-slate-50 flex gap-4 justify-end bg-slate-50/20">
              <button type="button" onClick={closeModal} className="px-10 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">Discard Changes</button>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Processing Authorization...' : editingEmp ? 'Update Personnel Record' : 'Authorize Recruitment'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Details View Modal */}
      {viewingEmp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/20 animate-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            <div className="flex justify-between items-start p-10 border-b border-slate-50 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-600/20">
                  {viewingEmp.fullName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">{viewingEmp.fullName}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100/50">{viewingEmp.role}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{viewingEmp.department}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingEmp(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
                <X size={28} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {viewingEmp.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {viewingEmp.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Institutional ID</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><FileText size={14} className="text-slate-400" /> {viewingEmp.employeeId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Induction Date</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> {viewingEmp.joinDate || 'N/A'}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Residence Location</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {viewingEmp.address || 'N/A'}</p>
                </div>
              </div>

              {isAdmin && viewingEmp.salary && (
                <div className="bg-slate-900 rounded-[32px] p-8 relative overflow-hidden group mt-4">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl"><DollarSign size={18} strokeWidth={3} /></div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Compensation Details</h3>
                    <span className="ml-auto px-3 py-1 bg-slate-800 text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-700">{viewingEmp.salary.type} Plan</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Base Pay</p>
                      <p className="text-lg font-black text-white tracking-tight">{sym}{(viewingEmp.salary.fixedAmount || 0).toLocaleString()}</p>
                    </div>
                    {viewingEmp.salary.type === 'Percentage' || viewingEmp.salary.type === 'Hybrid' ? (
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Commission</p>
                        <p className="text-lg font-black text-white tracking-tight">{viewingEmp.salary.commissionPct || 0}%</p>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Frequency</p>
                      <p className="text-sm font-bold text-white mt-1">{viewingEmp.salary.frequency}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Bonus</p>
                      <p className="text-sm font-bold text-white mt-1">{sym}{(viewingEmp.salary.bonusAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 mt-auto">
              <button onClick={() => setViewingEmp(null)} className="px-8 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
