import React, { useState, useEffect } from 'react';
import { 
  subscribeToEmployees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee 
} from '../services/db';
import { secondaryAuth } from '../services/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Plus, Search, Edit2, Trash2, X, User, CheckCircle2, 
  XCircle, Lock, Mail, Eye, EyeOff, Users, Building2, 
  Calendar, DollarSign, Briefcase, ChevronRight, 
  ShieldCheck, Zap, Phone, MapPin, FileText, Sparkles,
  Activity, Shield, Box, Layers, Globe2, Award,
  ChevronDown, ArrowUpRight, TrendingUp, Wallet, Filter
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
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { 
    const unsub = subscribeToEmployees((data) => {
      setEmployees(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

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
        setMsg({ type:'success', text: 'Personnel record updated successfully.' });
        setTimeout(closeModal, 1500);
      } else {
        if (!form.loginEmail) throw new Error('Institutional email required.');
        if (!form.loginPassword || form.loginPassword.length < 6)
          throw new Error('Credential strength insufficient.');
        if (!form.fullName) throw new Error('Full legal name required.');

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

        setMsg({ type:'success', text: `Recruitment authorized. Credentials dispatched.` });
        setTimeout(closeModal, 2500);
      }
    } catch(err) {
      setMsg({ type:'error', text: err.message });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteEmployee(confirmDelete.id);
      setConfirmDelete(null);
    } catch (err) { console.error(err); }
  };

  const toggleStatus = async (emp) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    await updateEmployee(emp.id, { status: newStatus });
  };

  const filtered = employees.filter(e => {
    const matchSearch = e.fullName?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="space-y-10 pb-10 animate-slide-up">
      {/* Institutional Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 w-fit px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
            <ShieldCheck size={12} className="animate-pulse" />
            <span>Personnel Command</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Talent</span></h1>
            <p className="text-slate-500 text-sm font-medium italic opacity-75">Managing agency human capital, role distribution, and payroll structures.</p>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex flex-col text-right mr-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Velocity</p>
              <div className="flex items-center gap-2 text-emerald-500 justify-end">
                <TrendingUp size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-tighter">98.4% Engagement</span>
              </div>
            </div>
            <button 
              onClick={openAdd}
              className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Plus size={14} strokeWidth={3} /> Authorize Recruitment
            </button>
          </div>
        )}
      </div>

      {/* Modern Control Bar */}
      <div className="premium-card p-4 flex flex-col md:flex-row items-center gap-6 bg-white/50 backdrop-blur-xl border-slate-100">
        <div className="relative group flex-1 w-full">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400" 
            placeholder="QUERY PERSONNEL DIRECTORY..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <select 
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pr-12 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all cursor-pointer hover:bg-white hover:border-blue-400"
              value={deptFilter} 
              onChange={e=>setDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {DEPTS.map(d=><option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={14} strokeWidth={3} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 md:w-48">
            <select 
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pr-12 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all cursor-pointer hover:bg-white hover:border-blue-400"
              value={statusFilter} 
              onChange={e=>setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              {STATUS.map(s=><option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} strokeWidth={3} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          
          <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
            <Filter size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} className="premium-card h-80 animate-pulse bg-slate-50/50" />
          ))
        ) : (
          filtered.map((emp, idx) => {
            const isActive = emp.status === 'Active';
            return (
              <div 
                key={emp.id || idx} 
                onClick={() => setViewingEmp(emp)}
                className="premium-card p-8 group relative overflow-hidden cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50 animate-slide-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform">
                      {emp.fullName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-900 text-lg tracking-tighter uppercase leading-none group-hover:text-blue-600 transition-colors">{emp.fullName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">{emp.role}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={()=>openEdit(emp)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 rounded-xl transition-all shadow-sm"><Edit2 size={16} strokeWidth={2.5}/></button>
                    </div>
                  )}
                </div>

                {/* Personnel Telemetry */}
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors"><Layers size={16} strokeWidth={2.5}/></div>
                    <span>{emp.department} &bull; {emp.employeeId || 'ID UNASSIGNED'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors"><Mail size={16} strokeWidth={2.5}/></div>
                    <span className="truncate">{emp.email}</span>
                  </div>
                </div>

                {/* Fiscal Context (Admin Only) */}
                {isAdmin && emp.salary && (
                  <div className="bg-slate-900 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-xl shadow-slate-900/10 group-hover:bg-blue-600 transition-colors duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-white/20 transition-all" />
                    <div className="flex justify-between items-center mb-3 relative z-10">
                      <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-blue-400 group-hover:text-white" strokeWidth={3} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-100">Annual Yield</span>
                      </div>
                      <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg uppercase tracking-widest group-hover:bg-white/20 group-hover:text-white border border-blue-500/20 group-hover:border-white/20">{emp.salary.type}</span>
                    </div>
                    <div className="flex items-baseline gap-1 relative z-10">
                      <span className="text-3xl font-black text-white tracking-tighter">{sym}{(emp.salary.fixedAmount||0).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-slate-500 ml-1 uppercase group-hover:text-blue-100">/ {emp.salary.frequency}</span>
                    </div>
                  </div>
                )}

                {/* Status & Quick Control */}
                <div className="flex justify-between items-center relative z-10">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    emp.status === 'On Leave' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-current animate-pulse'}`} />
                    {emp.status}
                  </div>
                  
                  {isAdmin && (
                    <button 
                      onClick={(e)=>{ e.stopPropagation(); toggleStatus(emp); }} 
                      className={`p-3 rounded-xl transition-all border ${
                        emp.status==='Active' 
                          ? 'text-rose-500 border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-rose-600/10 hover:shadow-xl' 
                          : 'text-emerald-500 border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-emerald-600/10 hover:shadow-xl'
                      }`}
                      title={emp.status === 'Active' ? 'Suspend Access' : 'Restore Access'}
                    >
                      {emp.status==='Active' ? <XCircle size={18} strokeWidth={2.5}/> : <CheckCircle2 size={18} strokeWidth={2.5}/>}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Institutional Onboarding Modal */}
      {showModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="p-8 border-b border-slate-50 bg-white/80 backdrop-blur-xl shrink-0 flex justify-between items-center sticky top-0 z-20">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-lg border border-blue-100">
                  <Award size={12} strokeWidth={3} />
                  <span>Administrative Protocol</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  {editingEmp ? 'Profile Refinement' : 'Recruitment Authorization'}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Updating institutional personnel telemetry and compensation structures.</p>
              </div>
              <button 
                onClick={closeModal}
                className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-900 border border-transparent hover:border-slate-100"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Premium Multi-Step Navigation */}
            <div className="flex gap-4 px-8 pt-8 shrink-0">
              {[
                {id:'profile', label: 'Biographical Matrix', icon: User, desc: 'Identity & Sector'},
                {id:'salary', label: 'Fiscal Parameters', icon: DollarSign, desc: 'Compensation & Benefits'}
              ].map(tab=>(
                <button 
                  key={tab.id} 
                  onClick={()=>setActiveTab(tab.id)} 
                  className={`flex-1 flex flex-col gap-1 p-6 rounded-2xl text-left transition-all border ${
                    activeTab===tab.id 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-900/20' 
                      : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <tab.icon size={20} strokeWidth={2.5} className={activeTab===tab.id ? 'text-blue-400' : 'text-slate-300'} />
                    {activeTab===tab.id && <Sparkles size={14} className="animate-pulse text-blue-400" />}
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest mt-2 leading-none">{tab.label}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-tighter italic ${activeTab===tab.id ? 'text-slate-400' : 'text-slate-300'}`}>{tab.desc}</p>
                </button>
              ))}
            </div>

            <div className="modal-body p-8">
              <form onSubmit={handleSave} className="space-y-12">
                {msg && (
                  <div className={`p-6 rounded-3xl flex items-center gap-4 text-[11px] font-black uppercase tracking-widest border animate-in slide-in-from-top-4 ${
                    msg.type==='success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    <div className={`p-2 rounded-xl ${msg.type==='success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                      {msg.type==='success' ? <CheckCircle2 size={20} strokeWidth={3} /> : <XCircle size={20} strokeWidth={3} />} 
                    </div>
                    {msg.text}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="grid grid-cols-2 gap-10">
                    <div className="col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Full Nomenclature</label>
                      <div className="relative group">
                        <User size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:scale-110 transition-transform" />
                        <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-xs font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" placeholder="FULL LEGAL IDENTITY..." value={form.fullName||''} onChange={e=>set('fullName',e.target.value)}/>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional ID</label>
                      <div className="relative">
                        <FileText size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-xs font-black tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" placeholder="UID-0000" value={form.employeeId||''} onChange={e=>set('employeeId',e.target.value)}/>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Email</label>
                      <div className="relative">
                        <Mail size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-xs font-black tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" placeholder="name@agency.com" value={form.email||''} onChange={e=>set('email',e.target.value)}/>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Telecom Link</label>
                      <div className="relative">
                        <Phone size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-xs font-black tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" placeholder="+1 (555) 000-0000" value={form.phone||''} onChange={e=>set('phone',e.target.value)}/>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Induction Date</label>
                      <div className="relative">
                        <Calendar size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" value={form.joinDate||''} onChange={e=>set('joinDate',e.target.value)}/>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Operational Role</label>
                      <div className="relative">
                        <Briefcase size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                        <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-12 py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all cursor-pointer" value={form.role||''} onChange={e=>set('role',e.target.value)}>
                          <option value="">SELECT ROLE...</option>
                          {ROLES_LIST.map(r=><option key={r}>{r}</option>)}
                        </select>
                        <ChevronDown size={16} strokeWidth={3} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department Sector</label>
                      <div className="relative">
                        <Layers size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                        <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-12 py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all cursor-pointer" value={form.department||''} onChange={e=>set('department',e.target.value)}>
                          <option value="">SELECT SECTOR...</option>
                          {DEPTS.map(d=><option key={d}>{d}</option>)}
                        </select>
                        <ChevronDown size={16} strokeWidth={3} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {!editingEmp && (
                      <div className="col-span-2 mt-8">
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl shadow-slate-900/40">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                          <div className="flex items-center gap-3 mb-10">
                            <Lock size={20} className="text-blue-400" strokeWidth={3} />
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Institutional Access Protocol</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-10 relative z-10">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Login Email</label>
                              <div className="relative">
                                <Mail size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                  type="email"
                                  required={!editingEmp}
                                  placeholder="INSTITUTIONAL EMAIL..."
                                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-14 pr-6 py-5 text-xs font-black uppercase tracking-widest text-white focus:ring-8 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                  value={form.loginEmail||''}
                                  onChange={e=>set('loginEmail',e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Access Credential</label>
                              <div className="relative">
                                <Lock size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                  type={showPwd ? 'text' : 'password'}
                                  required={!editingEmp}
                                  placeholder="••••••••"
                                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-14 pr-14 py-5 text-xs font-black tracking-widest text-white focus:ring-8 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                  value={form.loginPassword||''}
                                  onChange={e=>set('loginPassword',e.target.value)}
                                />
                                <button type="button" onClick={()=>setShowPwd(p=>!p)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                  {showPwd ? <EyeOff size={18} strokeWidth={2.5}/> : <Eye size={18} strokeWidth={2.5}/>}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'salary' && (
                  <div className="space-y-10">
                    <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 flex gap-6 items-center">
                      <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 animate-pulse"><TrendingUp size={24} strokeWidth={3}/></div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Fiscal Structure Activation</p>
                        <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-tighter italic leading-relaxed">Defining institutional compensation models and benefit parameters for personnel record.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Salary Model</label>
                        <div className="relative">
                          <Layers size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                          <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-12 py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all cursor-pointer" value={form.salary?.type||'Fixed'} onChange={e=>setSal('type',e.target.value)}>
                            {SAL_TYPES.map(t=><option key={t}>{t}</option>)}
                          </select>
                          <ChevronDown size={16} strokeWidth={3} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Disbursement Frequency</label>
                        <div className="relative">
                          <Activity size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                          <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-12 py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all cursor-pointer" value={form.salary?.frequency||'Monthly'} onChange={e=>setSal('frequency',e.target.value)}>
                            {PAY_FREQ.map(f=><option key={f}>{f}</option>)}
                          </select>
                          <ChevronDown size={16} strokeWidth={3} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      
                      {(form.salary?.type==='Fixed'||form.salary?.type==='Hybrid') && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fixed Basic Salary ({sym})</label>
                          <div className="relative">
                            <DollarSign size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" />
                            <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-xs font-black tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" value={form.salary?.fixedAmount||0} onChange={e=>setSal('fixedAmount',Number(e.target.value))}/>
                          </div>
                        </div>
                      )}
                      
                      {(form.salary?.type==='Percentage'||form.salary?.type==='Hybrid') && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Performance Yield (%)</label>
                          <div className="relative">
                            <Zap size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" />
                            <input type="number" min="0" max="100" className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-xs font-black tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" value={form.salary?.commissionPct||0} onChange={e=>setSal('commissionPct',Number(e.target.value))}/>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Allocated Allowances ({sym})</label>
                        <div className="relative">
                          <Box size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-xs font-black tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" value={form.salary?.allowance||0} onChange={e=>setSal('allowance',Number(e.target.value))}/>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Total Deductions ({sym})</label>
                        <div className="relative">
                          <ArrowUpRight size={18} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500 rotate-180" />
                          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-xs font-black tracking-widest text-rose-500 focus:ring-8 focus:ring-rose-500/5 focus:bg-white focus:border-rose-400 outline-none transition-all" value={form.salary?.deduction||0} onChange={e=>setSal('deduction',Number(e.target.value))}/>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                      <div className="flex justify-between items-center relative z-10">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Commitment</p>
                          <p className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400">
                            {sym}{Math.max(0,(Number(form.salary?.fixedAmount||0)+Number(form.salary?.bonusAmount||0)+Number(form.salary?.allowance||0)-Number(form.salary?.deduction||0))).toLocaleString()}
                          </p>
                        </div>
                        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/20">
                          <DollarSign size={40} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-50 flex gap-4 justify-end bg-slate-50/50 shrink-0 sticky bottom-0 z-20">
              <button type="button" onClick={closeModal} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">Discard Changes</button>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center gap-3 disabled:opacity-50"
              >
                {saving ? <Activity size={16} className="animate-spin" /> : editingEmp ? <Edit2 size={16} strokeWidth={3} /> : <CheckCircle2 size={16} strokeWidth={3} />}
                {saving ? 'SYNCHRONIZING...' : editingEmp ? 'REFINE PERSONNEL RECORD' : 'AUTHORIZE RECRUITMENT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Termination Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box-sm p-10 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-rose-100">
              <Trash2 size={32} className="text-rose-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">Terminate Personnel?</h2>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-4 italic">
              Are you sure you want to delete <strong className="text-slate-900 font-black uppercase tracking-tight">{confirmDelete.name}</strong>? This will remove all institutional records permanently.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 py-3 px-6 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 py-3 px-6 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/30 border border-rose-500 active:scale-95"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-Fidelity Details Viewer */}
      {viewingEmp && (
        <div className="modal-overlay">
          <div className="modal-box-lg">
            <div className="relative h-64 shrink-0 overflow-hidden bg-slate-900 rounded-t-[2rem]">
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[100px] -mr-64 -mt-64" />
              <div className="absolute inset-0 flex items-end p-8 md:p-12">
                <div className="flex items-center gap-6 relative z-10 w-full">
                  <div className="w-24 h-24 rounded-[1.5rem] bg-white text-slate-900 flex items-center justify-center font-black text-4xl shadow-2xl shadow-black/20 animate-bounce-slow">
                    {viewingEmp.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">{viewingEmp.role}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{viewingEmp.department} SECTOR</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">{viewingEmp.fullName}</h2>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
                      <Shield size={14} className="text-blue-500" strokeWidth={3} /> Institutional ID: {viewingEmp.employeeId || 'System Managed'}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingEmp(null)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 backdrop-blur-md"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="modal-body p-8 space-y-12 bg-white">
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Email</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-500"><Mail size={20} strokeWidth={3}/></div>
                    {viewingEmp.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telecom link</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-500"><Phone size={20} strokeWidth={3}/></div>
                    {viewingEmp.phone || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Induction Date</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-500"><Calendar size={20} strokeWidth={3}/></div>
                    {viewingEmp.joinDate || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Residence</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-500"><MapPin size={20} strokeWidth={3}/></div>
                    {viewingEmp.address || 'N/A'}
                  </p>
                </div>
              </div>

              {isAdmin && viewingEmp.salary && (
                <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl" />
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20"><DollarSign size={20} strokeWidth={3} /></div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Fiscal Context</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-10 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Compensation</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">{sym}{(viewingEmp.salary.fixedAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequency</p>
                      <p className="text-sm font-black text-slate-600 uppercase tracking-widest mt-2">{viewingEmp.salary.frequency}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Type</p>
                      <p className="text-sm font-black text-slate-600 uppercase tracking-widest mt-2">{viewingEmp.salary.type}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50/50 border-t border-slate-50 shrink-0 flex justify-end sticky bottom-0 z-20">
              <button 
                onClick={() => setViewingEmp(null)} 
                className="px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
              >
                Exit Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
