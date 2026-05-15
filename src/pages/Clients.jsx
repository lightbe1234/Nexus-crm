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
  ChevronDown, Download
} from 'lucide-react';

const EMPTY_CLIENT = { name: '', industry: '', contactName: '', contactRole: '', status: 'Lead', retainer: 0 };

export default function Clients() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Admin';
  const { settings } = useSettings();
  const sym = settings?.financial?.currencySymbol || '$';

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
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

  const openCreate = () => { setEditingId(null); setForm(EMPTY_CLIENT); setFormError(''); setShowModal(true); };
  const openEdit = (client) => {
    setEditingId(client.id);
    setForm({ name: client.name, industry: client.industry, contactName: client.contactName, contactRole: client.contactRole || '', status: client.status, retainer: client.retainer || 0 });
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

  return (
    <div className="space-y-10 pb-10 animate-slide-up">
      {/* Institutional Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 w-fit px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
            <Users size={12} className="animate-pulse" />
            <span>Relationship Management</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Portfolio</span></h1>
            <p className="text-slate-500 text-sm font-medium italic opacity-75">Consolidated registry of institutional partners and strategic accounts.</p>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm">
              <Download size={14} /> Export Directory
            </button>
            <button 
              onClick={openCreate}
              className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
            >
              <Plus size={14} /> Onboard Partner
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="premium-card overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 bg-white">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Institutional Registry</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Tracking partner status, market sector, and contract value</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:w-96">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400" 
                placeholder="QUERY PORTFOLIO..." 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-4 bg-slate-50 text-slate-500 rounded-[1.2rem] border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
              <Filter size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Identity</th>
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Market Sector</th>
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Liaison</th>
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Retainer</th>
                {isAdmin && <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Control</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={isAdmin ? 6 : 5} className="py-8 px-10">
                      <div className="h-10 bg-slate-50 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredClients.length > 0 ? filteredClients.map((client, idx) => {
                const sc = statusConfig[client.status] || statusConfig.Lead;
                return (
                  <tr key={client.id || idx} className="hover:bg-slate-50/50 transition-all group animate-slide-right" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform">
                          {client.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase text-xs">{client.name}</p>
                          <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-lg leading-none tracking-[0.2em]">UID-{client.id?.slice(-8).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                          <Building2 size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{client.industry || 'General Sector'}</span>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-900 tracking-tight uppercase">{client.contactName || '—'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{client.contactRole || 'Strategic Lead'}</p>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${sc.bg} ${sc.text} ${sc.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${client.status === 'Onboarding' ? 'animate-pulse' : ''}`} />
                        {client.status}
                      </div>
                    </td>
                    <td className="py-6 px-10 text-right">
                      <p className="text-sm font-black text-slate-900 tracking-tight">
                        {sym}{(client.retainer || 0).toLocaleString()}
                      </p>
                    </td>
                    {isAdmin && (
                      <td className="py-6 px-10">
                        <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEdit(client)}
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => setConfirmDelete({ id: client.id, name: client.name })}
                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-32 text-center bg-slate-50/20">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-200 border border-slate-100">
                        <Building2 size={40} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Portfolio Registry Empty</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-widest">No institutional entities located in directory.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-slate-50/50 flex justify-center border-t border-slate-100">
          <button className="group text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 hover:text-blue-700 transition-all flex items-center gap-3">
            Expand Institutional Matrix
            <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      {/* Modern Onboarding Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-lg border border-blue-100 mb-1">
                  <Shield size={11} strokeWidth={3} />
                  <span>Onboarding Protocol</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {editingId ? 'Modify Entity' : 'Register Entity'}
                </h2>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-700"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="space-y-5">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-semibold flex items-start gap-2">
                    <span className="shrink-0">⚠</span>
                    <span>{formError}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Institutional Identity</label>
                    <div className="relative">
                      <Building2 size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400" 
                        placeholder="COMPANY LEGAL NAME..."
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Market Sector</label>
                    <div className="relative">
                      <Zap size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400" 
                        placeholder="INDUSTRY TYPE..."
                        value={form.industry}
                        onChange={e => setForm({ ...form, industry: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Operational State</label>
                    <div className="relative">
                      <ShieldCheck size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-8 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none appearance-none cursor-pointer"
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="Lead">Potential Lead</option>
                        <option value="Onboarding">Integration Phase</option>
                        <option value="Active">Strategic Partner</option>
                      </select>
                      <ChevronDown size={14} strokeWidth={2.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Liaison</label>
                    <div className="relative">
                      <User size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400" 
                        placeholder="LIAISON NAME..."
                        value={form.contactName}
                        onChange={e => setForm({ ...form, contactName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Liaison Position</label>
                    <div className="relative">
                      <Target size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400" 
                        placeholder="EXECUTIVE ROLE..."
                        value={form.contactRole}
                        onChange={e => setForm({ ...form, contactRole: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Institutional Retainer ({sym})</label>
                    <div className="relative">
                      <DollarSign size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        type="number" min="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all" 
                        value={form.retainer}
                        onChange={e => setForm({ ...form, retainer: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/60 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} strokeWidth={2.5} />
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
          <div className="modal-box-sm p-10 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
              <Trash2 size={28} className="text-rose-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Terminate Account?</h2>
            <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
              Remove <strong className="text-slate-900 font-bold">{confirmDelete.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
