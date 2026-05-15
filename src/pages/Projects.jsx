import React, { useState, useEffect } from 'react';
import { 
  subscribeToProjects, 
  subscribeToClients, 
  addProject, 
  updateProject, 
  deleteProject 
} from '../services/db';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, Search, MoreVertical, Filter, FolderKanban, 
  Activity, CheckCircle, ListTodo, Clock, ArrowUpRight,
  TrendingUp, Briefcase, Layers, ChevronRight, X,
  Target, DollarSign, Edit2, Trash2, CheckCircle2,
  Sparkles, ShieldCheck, Box, BarChart3, Globe2,
  ChevronDown, LayoutGrid, Kanban, ListFilter, ClipboardCheck
} from 'lucide-react';

const EMPTY_PROJECT = { name: '', clientId: '', type: '', status: 'To Do', budget: 0, progress: 0 };

export default function Projects() {
  const { settings } = useSettings();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Admin';
  const sym = settings?.financial?.currencySymbol || '$';

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(EMPTY_PROJECT);

  useEffect(() => {
    const unsubProjects = subscribeToProjects((data) => {
      setProjects(data);
      setLoading(false);
    });
    const unsubClients = subscribeToClients((data) => setClients(data));
    return () => { unsubProjects(); unsubClients(); };
  }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_PROJECT); setFormError(''); setShowModal(true); };
  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({ 
      name: p.name, 
      clientId: p.clientId, 
      type: p.type || '', 
      status: p.status, 
      budget: p.budget || 0, 
      progress: p.progress || 0 
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Initiative name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await updateProject(editingId, form);
      } else {
        await addProject(form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_PROJECT);
    } catch (err) {
      setFormError('Failed to save. Please try again.');
      console.error(err);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await deleteProject(confirmDelete.id); } catch (err) { console.error(err); }
    setConfirmDelete(null);
  };

  const getClientName = (id) => {
    const c = clients.find(c => c.id === id);
    return c ? c.name : 'Internal Initiative';
  };

  const updateStatus = async (id, newStatus) => {
    try { await updateProject(id, { status: newStatus }); } catch (err) { console.error(err); }
  };

  const columns = [
    { name: 'To Do', icon: ListTodo, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', accent: 'bg-slate-400' },
    { name: 'In Progress', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100', accent: 'bg-blue-600' },
    { name: 'Review', icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-100', accent: 'bg-amber-600' },
    { name: 'Completed', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100', accent: 'bg-emerald-600' }
  ];

  const filteredProjects = projects.filter(p => 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    getClientName(p.clientId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCard = (project) => (
    <div 
      key={project.id} 
      className="premium-card p-5 mb-4 cursor-pointer hover:border-blue-400 group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 bg-white/70 backdrop-blur-md"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col min-w-0 pr-4">
          <span className="text-[10px] font-black text-blue-600 mb-1.5 uppercase tracking-widest">{getClientName(project.clientId)}</span>
          <h4 className="font-bold text-slate-900 text-lg leading-tight tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1 uppercase">
            {project.name}
          </h4>
        </div>
        
        {isAdmin && (
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
            <button onClick={() => openEdit(project)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-100 rounded-lg transition-all shadow-sm">
              <Edit2 size={12} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">
            <span>Velocity</span>
            <span className="text-slate-900">{project.progress || 0}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 rounded-full ${
                project.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-600'
              }`} 
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors border border-slate-100">
              <Layers size={14} strokeWidth={2.5}/>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
              <span className="text-[10px] font-black text-slate-900 uppercase truncate">{project.type || 'Standard'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Budget</p>
            <p className="text-sm font-black text-slate-900 tracking-tight">{sym}{(project.budget || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F8FAFC]">
      {/* Institutional Header */}
      <div className="shrink-0 px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
              <ShieldCheck size={14} strokeWidth={3} />
              <span>Project Governance Console</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Initiative <span className="text-blue-600">Command</span></h1>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative group flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} strokeWidth={3} />
              <input 
                className="pl-12 pr-6 py-3 text-[11px] font-bold uppercase tracking-widest bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 w-full lg:w-72 transition-all placeholder:text-slate-300" 
                placeholder="Search command..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isAdmin && (
              <button 
                onClick={openCreate} 
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95"
              >
                <Plus size={16} strokeWidth={3} />
                Deploy Initiative
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar px-8 pb-8">
        <div className="flex gap-6 h-full min-w-max">
          {loading ? (
            <div className="flex gap-6 h-full">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-80 h-full bg-slate-100/50 border border-slate-200/50 rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : (
            columns.map((col, idx) => {
              const colProjects = filteredProjects.filter(p => p.status === col.name);
              return (
                <div 
                  key={col.name} 
                  className="w-80 flex flex-col h-full rounded-[2rem] bg-slate-100/50 border border-slate-200/50 group/column transition-all"
                >
                  {/* Fixed Header */}
                  <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-5 bg-slate-100/80 backdrop-blur-md rounded-t-[2rem] border-b border-slate-200/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${col.bg} ${col.color} flex items-center justify-center shadow-sm`}>
                        <col.icon size={16} strokeWidth={3} />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-black text-slate-900 text-[12px] leading-none uppercase tracking-tight">{col.name}</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{colProjects.length}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={openCreate} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all">
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                  
                  {/* Scrollable List */}
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
                    {colProjects.map((p, i) => (
                      <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${(idx * 4 + i) * 0.05}s` }}>
                        {renderCard(p)}
                      </div>
                    ))}
                    
                    {colProjects.length === 0 && (
                      <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-[1.5rem] py-12 flex flex-col items-center justify-center text-slate-300">
                        <Box size={24} className="opacity-20 mb-3" strokeWidth={2} />
                        <p className="text-[9px] font-black uppercase tracking-widest italic text-center">Empty Slate</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-lg border border-blue-100 mb-1">
                  <Globe2 size={11} strokeWidth={3} />
                  <span>Project</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {editingId ? 'Edit Project' : 'New Project'}
                </h2>
              </div>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-700">
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
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Name</label>
                    <div className="relative">
                      <Briefcase size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        type="text" required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all"
                        placeholder="e.g. Brand Refresh 2025"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Client</label>
                    <div className="relative">
                      <Target size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <select
                        required
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-8 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none cursor-pointer"
                        value={form.clientId}
                        onChange={e => setForm({...form, clientId: e.target.value})}
                      >
                        <option value="">Select client…</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={14} strokeWidth={2.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Type / Sector</label>
                    <div className="relative">
                      <Layers size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all"
                        placeholder="e.g. Branding"
                        value={form.type}
                        onChange={e => setForm({...form, type: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                    <div className="relative">
                      <ClipboardCheck size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                      <select
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-8 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none cursor-pointer"
                        value={form.status}
                        onChange={e => setForm({...form, status: e.target.value})}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <ChevronDown size={14} strokeWidth={2.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Budget ({sym})</label>
                    <div className="relative">
                      <DollarSign size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input
                        type="number" min="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all"
                        value={form.budget}
                        onChange={e => setForm({...form, budget: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Progress (%)</label>
                    <div className="relative">
                      <TrendingUp size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        type="number" min="0" max="100"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all"
                        value={form.progress}
                        onChange={e => setForm({...form, progress: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/60 shrink-0">
              <button type="button" onClick={() => { setShowModal(false); setFormError(''); }} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} strokeWidth={2.5} />
                    {editingId ? 'Save Changes' : 'Create Project'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box-sm p-10 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
              <Trash2 size={28} className="text-rose-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Delete Project?</h2>
            <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
              Remove <strong className="text-slate-900 font-bold">{confirmDelete.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
