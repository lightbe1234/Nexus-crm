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
  ChevronDown, LayoutGrid, Kanban, ListFilter, ClipboardCheck,
  Calendar, Zap, Award, Info
} from 'lucide-react';

const EMPTY_PROJECT = { name: '', clientId: '', type: '', status: 'To Do', budget: 0, progress: 0, description: '' };

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
  const [selectedProject, setSelectedProject] = useState(null);
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

  const openCreate = (e) => { 
    e?.stopPropagation();
    setEditingId(null); 
    setForm(EMPTY_PROJECT); 
    setFormError(''); 
    setShowModal(true); 
  };

  const openEdit = (p, e) => {
    e?.stopPropagation();
    setEditingId(p.id);
    setForm({ 
      name: p.name, 
      clientId: p.clientId, 
      type: p.type || '', 
      status: p.status, 
      budget: p.budget || 0, 
      progress: p.progress || 0,
      description: p.description || ''
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
    setSelectedProject(null);
  };

  const getClientName = (id) => {
    const c = clients.find(c => c.id === id);
    return c ? c.name : 'Internal Initiative';
  };

  const updateStatus = async (id, newStatus) => {
    try { 
      await updateProject(id, { status: newStatus }); 
      if (selectedProject?.id === id) {
        setSelectedProject(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) { console.error(err); }
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
      onClick={() => setSelectedProject(project)}
      className="premium-card p-5 mb-4 cursor-pointer hover:border-blue-500 group relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] animate-slide-up bg-white/80 backdrop-blur-xl border-slate-100"
    >
      <div className={`absolute top-0 left-0 w-2 h-full transition-all duration-500 group-hover:w-3 ${
        project.status === 'Completed' ? 'bg-emerald-500 shadow-[4px_0_15px_rgba(16,185,129,0.3)]' : 
        project.status === 'In Progress' ? 'bg-blue-600 shadow-[4px_0_15px_rgba(37,99,235,0.3)]' : 'bg-slate-300'
      }`} />

      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black text-blue-600 bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100/50 uppercase tracking-[0.2em] w-fit">
            {getClientName(project.clientId)}
          </span>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border bg-slate-50 text-slate-500 border-slate-100">
              {project.type || 'Operational'}
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={(e) => openEdit(project, e)}
            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
          >
            <Edit2 size={14} strokeWidth={3} />
          </button>
        )}
      </div>
      
      <div className="mb-6">
        <h4 className="font-black text-slate-900 text-lg mb-2 tracking-tighter group-hover:text-blue-600 transition-colors line-clamp-2 uppercase leading-tight">
          {project.name}
        </h4>
        <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed font-medium italic">
          {project.description || 'Institutional initiative briefing not provided.'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center text-[10px] font-black text-slate-900 mb-2 uppercase tracking-widest">
            <span>Market Velocity</span>
            <span className="text-blue-600 font-black">{project.progress || 0}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
            <div 
              className={`h-full transition-all duration-1000 rounded-full ${
                project.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-600'
              } shadow-[0_0_10px_rgba(37,99,235,0.4)]`} 
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-slate-50/80 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
              CAPITAL ALLOCATION
            </span>
            <span className="text-sm font-black text-slate-900 tracking-tight">{sym}{(project.budget || 0).toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity size={14} strokeWidth={3} className={project.status === 'In Progress' ? 'animate-pulse text-blue-500' : ''} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC]">
      {/* Page Header */}
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
                className="pl-12 pr-6 py-3 text-[11px] font-bold uppercase tracking-widest bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 w-full lg:w-72 transition-all placeholder:text-slate-300 shadow-sm" 
                placeholder="Scan initiatives..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isAdmin && (
              <button 
                onClick={openCreate} 
                className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 shrink-0"
              >
                <Plus size={18} strokeWidth={3} />
                Deploy Initiative
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wide Kanban Board */}
      <div className="px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((col, idx) => {
            const colProjects = filteredProjects.filter(p => p.status === col.name);
            return (
              <div 
                key={col.name} 
                className="flex flex-col rounded-[2.5rem] bg-slate-100/40 border border-slate-200/40 group/column transition-all hover:bg-slate-100/60"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center px-8 py-6 bg-slate-100/90 backdrop-blur-xl rounded-t-[2.5rem] border-b border-slate-200/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl ${col.bg} ${col.color} flex items-center justify-center shadow-lg border ${col.border}`}>
                      <col.icon size={20} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-black text-slate-900 text-sm leading-none uppercase tracking-tighter">{col.name}</h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">{colProjects.length} Units</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={openCreate} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  )}
                </div>
                
                {/* Scrollable List */}
                <div className="p-4 custom-scrollbar space-y-1">
                  {colProjects.map((p, i) => (
                    <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${(idx * 4 + i) * 0.05}s` }}>
                      {renderCard(p)}
                    </div>
                  ))}
                  
                  {colProjects.length === 0 && (
                    <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-[2.5rem] py-16 flex flex-col items-center justify-center text-slate-300">
                      <Box size={32} className="opacity-20 mb-4" strokeWidth={1.5} />
                      <p className="text-[10px] font-black uppercase tracking-widest italic text-center">Empty Matrix</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cinematic Initiative Detail View */}
      {selectedProject && (
        <div className="modal-overlay">
          <div className="modal-box max-w-[1500px] w-[98vw] h-[96vh] flex-col lg:flex-row overflow-hidden p-0 gap-0 border-none shadow-[0_0_100px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-500">
            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white relative z-10">
              <div className="p-10 md:p-12 border-b border-slate-50 bg-slate-50/20 relative shrink-0 sticky top-0 z-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="flex flex-wrap items-center gap-5 mb-10 relative z-10">
                  <div className="flex items-center gap-3 text-[11px] font-black text-blue-600 bg-blue-50/80 px-5 py-2.5 rounded-2xl border border-blue-100 shadow-sm uppercase tracking-widest">
                    <Layers size={16} strokeWidth={3} />
                    <span>{getClientName(selectedProject.clientId)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl border shadow-sm bg-slate-900 text-white">
                    <Target size={16} strokeWidth={3} />
                    <span>{selectedProject.type || 'Standard'} Initiative</span>
                  </div>
                  
                  <div className="flex-1 flex flex-wrap items-center justify-end gap-4">
                    <button onClick={() => setSelectedProject(null)} className="lg:hidden p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-slate-900 transition-all shadow-sm">
                      <X size={24} strokeWidth={3} />
                    </button>
                    {isAdmin && (
                      <div className="relative">
                        <select 
                          className="appearance-none bg-blue-600 text-white rounded-2xl pl-8 pr-14 py-4 text-[11px] font-black uppercase tracking-widest focus:ring-8 focus:ring-blue-500/10 outline-none cursor-pointer hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/30"
                          value={selectedProject.status}
                          onChange={(e) => updateStatus(selectedProject.id, e.target.value)}
                        >
                          {columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown size={16} strokeWidth={3} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                      </div>
                    )}
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[1.1] mb-12 relative z-10 break-words max-w-[90%]">
                  {selectedProject.name}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 relative z-10">
                  <div className="flex items-center gap-6 group min-w-0">
                    <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center shadow-2xl shadow-slate-900/30 group-hover:rotate-6 transition-all duration-500">
                      <DollarSign size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 leading-none whitespace-nowrap">Budget Allocated</p>
                      <p className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none truncate">{sym}{(selectedProject.budget || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 group min-w-0">
                    <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-xl shadow-amber-900/5 group-hover:-translate-y-2 transition-all duration-500">
                      <TrendingUp size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 leading-none whitespace-nowrap">Current Velocity</p>
                      <p className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none truncate">{selectedProject.progress || 0}% Complete</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 group min-w-0">
                    <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xl shadow-emerald-900/5 group-hover:-translate-y-2 transition-all duration-500">
                      <Award size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 leading-none whitespace-nowrap">Quality Index</p>
                      <p className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none truncate">OPTIMIZED</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 group min-w-0">
                    <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xl shadow-blue-900/5 group-hover:-translate-y-2 transition-all duration-500">
                      <ShieldCheck size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 leading-none whitespace-nowrap">Security Protocol</p>
                      <p className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none truncate">ENFORCED</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar bg-white scrollbar-none">
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-1 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Institutional Briefing</h3>
                  </div>
                  <div className="bg-slate-50/50 p-12 rounded-[3rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50">
                    <div className="absolute top-8 right-12 text-slate-200 group-hover:text-blue-200 transition-colors duration-700">
                      <Box size={64} strokeWidth={1} />
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xl font-medium relative z-10 italic tracking-tight whitespace-pre-wrap">
                      "{selectedProject.description || 'Institutional initiative briefing not finalized. Awaiting leadership directive.'}"
                    </p>
                  </div>
                </section>

                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-1 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Operational Readiness</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Market Sync', status: 'Active', icon: Globe2 },
                      { label: 'Asset Load', status: 'Optimal', icon: Layers },
                      { label: 'Risk Factor', status: 'Low', icon: ShieldCheck },
                      { label: 'ROI Forecast', status: 'High', icon: Sparkles }
                    ].map((item, i) => (
                      <div key={i} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mb-6">
                          <item.icon size={24} strokeWidth={2.5} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.status}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {/* Sidebar with Actions & Quick Info */}
            <div className="w-full lg:w-[450px] shrink-0 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col overflow-hidden relative">
              <div className="p-10 border-b border-slate-200/30 bg-white/50 backdrop-blur-2xl flex justify-between items-center relative z-10 shrink-0">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] shadow-2xl shadow-slate-900/30 flex items-center justify-center animate-bounce-slow">
                    <Activity size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-widest leading-none mb-2">Initiative Control</h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Active Oversight Mode</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProject(null)} className="hidden lg:block p-5 bg-white border border-slate-100 text-slate-300 hover:text-slate-900 rounded-[1.5rem] transition-all hover:shadow-2xl">
                  <X size={28} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar scrollbar-none">
                <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <Info size={16} className="text-blue-500" strokeWidth={3} />
                    Quick Actions
                  </h4>
                  <div className="space-y-4">
                    {isAdmin && (
                      <>
                        <button 
                          onClick={(e) => openEdit(selectedProject, e)}
                          className="w-full py-5 px-6 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-between group shadow-xl shadow-slate-900/10"
                        >
                          Modify Parameters
                          <Edit2 size={16} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(selectedProject); }}
                          className="w-full py-5 px-6 rounded-2xl bg-white border border-rose-100 text-rose-500 font-black text-[11px] uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-between group"
                        >
                          Terminate Initiative
                          <Trash2 size={16} strokeWidth={3} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 relative z-10">Strategic Insight</h4>
                  <p className="text-sm font-medium italic text-slate-300 leading-relaxed relative z-10">
                    "This initiative is currently trending at {selectedProject.progress}% velocity. Market penetration is expected to increase upon transition to the next phase."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legacy Edit/Create Modal (Standard UI) */}
      {showModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-lg border border-blue-100 mb-1">
                  <Globe2 size={11} strokeWidth={3} />
                  <span>Initiative Parameters</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {editingId ? 'Modify Strategy' : 'Deploy Strategy'}
                </h2>
              </div>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-700">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="modal-body p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-start gap-3">
                    <AlertCircle size={16} strokeWidth={3} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Initiative Nomenclature</label>
                    <div className="relative">
                      <Briefcase size={16} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        type="text" required
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-300"
                        placeholder="IDENTIFIER..."
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Briefing / Description</label>
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 h-32 resize-none"
                      placeholder="OPERATIONAL DIRECTIVES..."
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Institutional Partner</label>
                    <div className="relative">
                      <Target size={16} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                      <select
                        required
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-4 text-xs font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none cursor-pointer uppercase tracking-widest"
                        value={form.clientId}
                        onChange={e => setForm({...form, clientId: e.target.value})}
                      >
                        <option value="">SELECT PARTNER…</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={14} strokeWidth={2.5} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Strategic Type</label>
                    <div className="relative">
                      <Layers size={16} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 uppercase tracking-widest"
                        placeholder="SECTOR..."
                        value={form.type}
                        onChange={e => setForm({...form, type: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Deployment Status</label>
                    <div className="relative">
                      <ClipboardCheck size={16} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" />
                      <select
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-4 text-xs font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none cursor-pointer uppercase tracking-widest"
                        value={form.status}
                        onChange={e => setForm({...form, status: e.target.value})}
                      >
                        {columns.map(c => <option key={c.name} value={c.name}>{c.name.toUpperCase()}</option>)}
                      </select>
                      <ChevronDown size={14} strokeWidth={2.5} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Capital Allocation ({sym})</label>
                    <div className="relative">
                      <DollarSign size={16} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input
                        type="number" min="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all"
                        value={form.budget}
                        onChange={e => setForm({...form, budget: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between">
                      <span>Execution Velocity</span>
                      <span className="text-blue-600">{form.progress}%</span>
                    </label>
                    <input
                      type="range" min="0" max="100" step="5"
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={form.progress}
                      onChange={e => setForm({...form, progress: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex gap-4 justify-end bg-slate-50/60 shrink-0">
              <button type="button" onClick={() => { setShowModal(false); setFormError(''); }} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} strokeWidth={3} />
                    {editingId ? 'Update Parameters' : 'Finalize Deployment'}
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
          <div className="modal-box-sm p-10 text-center bg-white rounded-[3rem] border-none shadow-2xl">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-rose-100 shadow-inner">
              <Trash2 size={32} className="text-rose-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter uppercase">Terminate Initiative?</h2>
            <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed italic">
              Removing <strong className="text-slate-900 font-black uppercase tracking-tight">{confirmDelete.name}</strong> from active registry. This operational directive cannot be reversed.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">Abort</button>
              <button onClick={handleDelete} className="flex-1 py-4 px-6 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/20">Execute</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
