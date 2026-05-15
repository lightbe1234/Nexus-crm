import React, { useState, useEffect } from 'react';
import { subscribeToClients, addClient, updateClient, deleteClient } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Users, Plus, Search, Filter, Mail, Phone, Globe,
  ArrowUpRight, TrendingUp, Building2, ChevronRight,
  X, Target, DollarSign, User, ShieldCheck, Zap,
  Edit2, Trash2, CheckCircle2, Sparkles, Activity,
  Shield, Box, Layers, Globe2, Briefcase, Award,
  ChevronDown, Download, Info, BarChart3, Clock,
  MapPin, ExternalLink, MessageSquare, AlertCircle
} from 'lucide-react';

const EMPTY_CLIENT = { 
  name: '', 
  industry: '', 
  contactName: '', 
  contactRole: '', 
  status: 'Lead', 
  retainer: 0,
  email: '',
  phone: '',
  website: '',
  description: ''
};

export default function Clients() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Admin';
  const { settings } = useSettings();
  const sym = settings?.financial?.currencySymbol || '$';

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(EMPTY_CLIENT);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const unsub = subscribeToClients((data) => {
      setClients(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openCreate = (e) => { 
    e?.stopPropagation();
    setEditingId(null); 
    setForm(EMPTY_CLIENT); 
    setFormError(''); 
    setShowModal(true); 
  };

  const openEdit = (client, e) => {
    e?.stopPropagation();
    setEditingId(client.id);
    setForm({ 
      name: client.name, 
      industry: client.industry, 
      contactName: client.contactName, 
      contactRole: client.contactRole || '', 
      status: client.status, 
      retainer: client.retainer || 0,
      email: client.email || '',
      phone: client.phone || '',
      website: client.website || '',
      description: client.description || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contactName.trim()) {
      setFormError('Company name and primary liaison are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await updateClient(editingId, form);
        if (selectedClient?.id === editingId) setSelectedClient({ ...selectedClient, ...form });
      } else {
        await addClient(form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_CLIENT);
    } catch (err) {
      setFormError('Failed to save. Please try again.');
      console.error(err);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await deleteClient(confirmDelete.id); } catch (err) { console.error(err); }
    setConfirmDelete(null);
    setSelectedClient(null);
  };

  const filteredClients = clients.filter(c =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contactName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusConfig = {
    Active:     { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' },
    Onboarding: { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100', dot: 'bg-blue-500' },
    Lead:       { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100', dot: 'bg-amber-500' },
  };

  const stats = [
    { label: 'Strategic Partners', val: clients.filter(c => c.status === 'Active').length, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Pipeline', val: clients.filter(c => c.status === 'Onboarding').length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Market Potential', val: clients.filter(c => c.status === 'Lead').length, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Portfolio Value', val: `${sym}${clients.reduce((acc, c) => acc + (c.retainer || 0), 0).toLocaleString()}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  return (
    <div className="bg-[#F8FAFC]">
      {/* Institutional Header */}
      <div className="shrink-0 px-10 py-10 space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 bg-blue-50 w-fit px-5 py-2.5 rounded-2xl border border-blue-100 shadow-sm uppercase tracking-[0.3em]">
              <Users size={14} strokeWidth={3} className="animate-pulse" />
              <span>Institutional Relationship Matrix</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Client <span className="text-blue-600">Portfolio</span></h1>
          </div>
          
          <div className="flex items-center gap-5 w-full lg:w-auto">
            <div className="relative group flex-1 lg:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} strokeWidth={3} />
              <input 
                className="w-full pl-14 pr-8 py-4 text-[11px] font-bold uppercase tracking-widest bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 transition-all placeholder:text-slate-300 shadow-sm" 
                placeholder="Query institutional registry..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isAdmin && (
              <button 
                onClick={openCreate}
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
              >
                <Plus size={18} strokeWidth={3} />
                Onboard Partner
              </button>
            )}
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="premium-card p-8 group transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{s.val}</h3>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shadow-lg border border-white group-hover:rotate-6 transition-all`}>
                  <s.icon size={28} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Density Strategic Grid - One Screen Architecture */}
      <div className="px-10 pb-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-64 erp-card animate-pulse bg-white/50 rounded-[2.5rem]" />
            ))}
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClients.map((client, idx) => {
              const sc = statusConfig[client.status] || statusConfig.Lead;
              return (
                <div 
                  key={client.id || idx}
                  onClick={() => setSelectedClient(client)}
                  className="premium-card p-6 group cursor-pointer hover:bg-slate-900 transition-all duration-500 relative overflow-hidden"
                >
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-all duration-700" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 group-hover:bg-white/10 text-white flex items-center justify-center text-2xl font-black shadow-lg transition-colors">
                        {client.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className={`px-4 py-2 rounded-xl border ${sc.bg} ${sc.text} ${sc.border} text-[9px] font-black uppercase tracking-widest shadow-sm`}>
                        {client.status}
                      </div>
                    </div>

                    <div className="space-y-1 mb-8">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-white tracking-tighter uppercase truncate transition-colors">
                        {client.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 group-hover:text-slate-300 uppercase tracking-widest">
                        <Building2 size={12} />
                        <span className="truncate">{client.industry || 'Global Sector'}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100/50 group-hover:border-white/10 flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Retainer</p>
                        <p className="text-lg font-black text-slate-900 group-hover:text-white tracking-tighter transition-colors">
                          {sym}{(client.retainer || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-white transition-all group-hover:translate-x-1">
                        <ChevronRight size={18} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="premium-card p-48 text-center bg-white/50 border-dashed border-2">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-8">
              <Building2 size={48} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-4">Registry Empty</h3>
            <p className="text-slate-500 font-medium italic">No institutional entities found in current directory.</p>
          </div>
        )}
      </div>

      {/* Cinematic Client Detail View */}
      {selectedClient && (
        <div className="modal-overlay" onClick={() => setSelectedClient(null)}>
          <div 
            className="modal-box-cinematic flex-col lg:flex-row" 
            onClick={e => e.stopPropagation()}
          >
            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white relative z-10">
              <div className="p-10 md:p-14 border-b border-slate-50 bg-slate-50/30 relative shrink-0 sticky top-0 z-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                
                <div className="flex flex-wrap items-center gap-6 mb-12 relative z-10">
                  <div className="flex items-center gap-4 text-[11px] font-black text-blue-600 bg-white px-6 py-3 rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5 uppercase tracking-widest">
                    <Globe2 size={18} strokeWidth={3} />
                    <span>{selectedClient.industry || 'Global Market'}</span>
                  </div>
                  <div className={`flex items-center gap-4 text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl border shadow-xl shadow-slate-900/5 ${
                    selectedClient.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    <ShieldCheck size={18} strokeWidth={3} />
                    <span>{selectedClient.status} Protocol</span>
                  </div>
                  
                  <div className="flex-1 flex flex-wrap items-center justify-end gap-5">
                    <button onClick={() => setSelectedClient(null)} className="p-5 bg-white border border-slate-100 text-slate-400 rounded-[2rem] hover:text-slate-900 transition-all shadow-xl shadow-slate-200/50">
                      <X size={28} strokeWidth={3} />
                    </button>
                    {isAdmin && (
                      <button onClick={(e) => openEdit(selectedClient, e)} className="p-5 bg-slate-900 text-white rounded-[2rem] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/30">
                        <Edit2 size={24} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-12 mb-16 relative z-10">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-[3.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-5xl md:text-7xl shadow-[0_40px_80px_rgba(0,0,0,0.15)] shrink-0 border-[8px] border-white">
                    {selectedClient.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="space-y-4 min-w-0">
                    <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] break-words">
                      {selectedClient.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400">
                      <span className="text-lg font-bold tracking-tight uppercase">Partner ID: UID-{selectedClient.id?.slice(-8).toUpperCase()}</span>
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <span className="text-lg font-bold tracking-tight uppercase flex items-center gap-3">
                        <MapPin size={20} className="text-blue-500" />
                        Global Headquarters
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12 relative z-10">
                  <div className="flex items-center gap-8 group min-w-0">
                    <div className="w-20 h-20 shrink-0 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center shadow-2xl shadow-slate-900/40 group-hover:rotate-6 transition-all duration-700">
                      <User size={36} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 leading-none whitespace-nowrap">Primary Liaison</p>
                      <p className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none truncate">{selectedClient.contactName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{selectedClient.contactRole || 'Executive Lead'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 group min-w-0">
                    <div className="w-20 h-20 shrink-0 rounded-[2rem] bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xl shadow-indigo-900/5 group-hover:-translate-y-2 transition-all duration-700">
                      <DollarSign size={36} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 leading-none whitespace-nowrap">Annualized Retainer</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none truncate">{sym}{(selectedClient.retainer || 0).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2 tracking-widest">Institutional Yield: High</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 group min-w-0">
                    <div className="w-20 h-20 shrink-0 rounded-[2rem] bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xl shadow-emerald-900/5 group-hover:-translate-y-2 transition-all duration-700">
                      <Clock size={36} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 leading-none whitespace-nowrap">Lifecycle Stage</p>
                      <p className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none truncate">{selectedClient.status}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Duration: 12+ Cycles</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 group min-w-0">
                    <div className="w-20 h-20 shrink-0 rounded-[2rem] bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xl shadow-blue-900/5 group-hover:-translate-y-2 transition-all duration-700">
                      <ShieldCheck size={36} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 leading-none whitespace-nowrap">Strategic Rating</p>
                      <p className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none truncate">Tier 1 Partner</p>
                      <p className="text-[10px] font-bold text-blue-500 uppercase mt-2 tracking-widest">Compliance: 100%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-16 custom-scrollbar bg-white scrollbar-none">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                  <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-16 h-1.5 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">Corporate Synopsis</h3>
                    </div>
                    <div className="bg-slate-50/50 p-14 rounded-[4rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-[0_60px_100px_rgba(0,0,0,0.06)] min-h-[300px]">
                      <div className="absolute top-10 right-14 text-slate-200 group-hover:text-blue-200 transition-colors duration-1000">
                        <Building2 size={80} strokeWidth={1} />
                      </div>
                      <p className="text-slate-600 leading-relaxed text-2xl font-medium relative z-10 italic tracking-tight whitespace-pre-wrap">
                        "{selectedClient.description || 'Institutional partner profile not finalized. Initial market analysis pending leadership directive.'}"
                      </p>
                    </div>
                  </section>

                  <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-16 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">Communication Channels</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {[
                        { label: 'Secure Electronic Mail', val: selectedClient.email || 'ENCRYPTED@STITCH.AGENCY', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Voice Frequency', val: selectedClient.phone || '+1 (800) STITCH', icon: Phone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Digital Domain', val: selectedClient.website || 'WWW.PARTNER.COM', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-8 p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group">
                          <div className={`w-20 h-20 rounded-[2rem] ${item.bg} ${item.color} flex items-center justify-center shadow-lg border border-white group-hover:rotate-12 transition-all`}>
                            <item.icon size={36} strokeWidth={2.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{item.label}</p>
                            <p className="text-xl font-black text-slate-900 tracking-tighter truncate uppercase">{item.val}</p>
                          </div>
                          <button className="ml-auto w-16 h-16 rounded-[1.5rem] bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                            <ExternalLink size={24} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Sidebar with Actions & Status Oversight */}
            <div className="w-full lg:w-[480px] shrink-0 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col overflow-hidden relative">
              <div className="p-12 border-b border-slate-200/30 bg-white/50 backdrop-blur-3xl flex justify-between items-center relative z-10 shrink-0">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] shadow-[0_30px_60px_rgba(37,99,235,0.3)] flex items-center justify-center">
                    <Shield size={36} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest leading-none mb-3">Account Control</h3>
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">High-Value Asset Oversight</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar scrollbar-none">
                <div className="p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
                  <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                    <Zap size={20} className="text-amber-500" strokeWidth={3} />
                    Protocol Deployment
                  </h4>
                  <div className="space-y-6">
                    {isAdmin && (
                      <>
                        <button 
                          onClick={(e) => openEdit(selectedClient, e)}
                          className="w-full py-7 px-8 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-between group shadow-2xl shadow-slate-900/10"
                        >
                          Modify Parameters
                          <Edit2 size={20} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                        </button>
                        <button 
                          className="w-full py-7 px-8 rounded-[2rem] bg-white border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-between group"
                        >
                          Export Portfolio
                          <Download size={20} strokeWidth={3} />
                        </button>
                        <div className="pt-6">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(selectedClient); }}
                            className="w-full py-7 px-8 rounded-[2rem] bg-rose-50 border border-rose-100 text-rose-600 font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-100 transition-all flex items-center justify-between group"
                          >
                            Terminate Partnership
                            <Trash2 size={20} strokeWidth={3} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-blue-600/20 rounded-full blur-[60px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <Award size={24} className="text-amber-400" strokeWidth={3} />
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">Partner Status: ELITE</h4>
                  </div>
                  <p className="text-base font-medium italic text-slate-300 leading-relaxed relative z-10 tracking-tight">
                    "Institutional partner consistently demonstrates high operational alignment. Retainer yield is optimized for current market cycle."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Onboarding Modal (Form) */}
      {showModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-box max-w-[800px] rounded-[3.5rem]">
            <div className="flex justify-between items-center px-10 py-8 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 w-fit px-4 py-2 rounded-xl border border-blue-100 mb-2">
                  <Shield size={12} strokeWidth={3} />
                  <span>Partnership Protocol</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                  {editingId ? 'Modify Partner' : 'Register Partner'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-700">
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            
            <div className="modal-body p-10 bg-slate-50/20">
              <form onSubmit={handleSubmit} className="space-y-8">
                {formError && (
                  <div className="p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-start gap-4 animate-shake">
                    <AlertCircle size={20} strokeWidth={3} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Institutional Legal Nomenclature</label>
                    <div className="relative">
                      <Building2 size={20} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        required 
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-base font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 uppercase tracking-tight" 
                        placeholder="LEGAL ENTITY NAME..."
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Market Briefing</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-base font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 h-32 resize-none uppercase tracking-tight" 
                      placeholder="ENTER STRATEGIC BRIEFING..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Target Industry</label>
                    <div className="relative">
                      <Layers size={20} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 uppercase tracking-tight" 
                        placeholder="SECTOR..."
                        value={form.industry}
                        onChange={e => setForm({ ...form, industry: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Lifecycle State</label>
                    <div className="relative">
                      <ShieldCheck size={20} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-10 py-4 text-sm font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none appearance-none cursor-pointer uppercase tracking-widest"
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="Lead">POTENTIAL LEAD</option>
                        <option value="Onboarding">INTEGRATION PHASE</option>
                        <option value="Active">STRATEGIC PARTNER</option>
                      </select>
                      <ChevronDown size={18} strokeWidth={2.5} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Account Liaison</label>
                    <div className="relative">
                      <User size={20} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        required 
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 uppercase tracking-tight" 
                        placeholder="LIAISON NAME..."
                        value={form.contactName}
                        onChange={e => setForm({ ...form, contactName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Position / Rank</label>
                    <div className="relative">
                      <Award size={20} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 uppercase tracking-tight" 
                        placeholder="EXECUTIVE ROLE..."
                        value={form.contactRole}
                        onChange={e => setForm({ ...form, contactRole: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Retainer Allocation ({sym})</label>
                    <div className="relative">
                      <DollarSign size={20} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input 
                        type="number" min="0"
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-base font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all" 
                        value={form.retainer}
                        onChange={e => setForm({ ...form, retainer: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-10 py-8 border-t border-slate-100 flex gap-5 justify-end bg-slate-50/60 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-8 py-4 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
              >
                Abort Protocol
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-10 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} strokeWidth={3} />
                    {editingId ? 'Execute Update' : 'Finalize Onboarding'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Termination Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box-sm p-12 text-center bg-white rounded-[4rem] border-none shadow-[0_40px_100px_rgba(0,0,0,0.15)]">
            <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-rose-100 shadow-inner">
              <Trash2 size={40} className="text-rose-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Terminate Asset?</h2>
            <p className="text-slate-500 text-base font-medium mb-12 leading-relaxed italic px-6">
              Removing <strong className="text-slate-900 font-black uppercase tracking-tight">{confirmDelete.name}</strong> from operational matrix. This directive is irreversible.
            </p>
            <div className="flex gap-5">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 py-5 px-8 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 py-5 px-8 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/20"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
