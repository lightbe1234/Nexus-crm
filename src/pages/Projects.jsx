import React, { useState, useEffect } from 'react';
import { getProjects, addProject, updateProject, getClients } from '../services/db';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Filter, 
  FolderKanban, 
  Activity, 
  CheckCircle, 
  ListTodo, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  Briefcase,
  Layers,
  ChevronRight,
  X,
  Target,
  DollarSign
} from 'lucide-react';

export default function Projects() {
  const { settings } = useSettings();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Admin';
  const sym = settings.financial.currencySymbol;

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProject, setNewProject] = useState({ name: '', clientId: '', type: '', status: 'To Do', budget: 0, progress: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsData, clientsData] = await Promise.all([getProjects(), getClients()]);
      setProjects(projectsData);
      setClients(clientsData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await addProject(newProject);
      setShowModal(false);
      setNewProject({ name: '', clientId: '', type: '', status: 'To Do', budget: 0, progress: 0 });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getClientName = (id) => {
    const c = clients.find(c => c.id === id);
    return c ? c.name : 'Internal Initiative';
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateProject(id, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { name: 'To Do', icon: ListTodo, color: 'text-slate-400', bg: 'bg-slate-100', border: 'border-slate-200' },
    { name: 'In Progress', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { name: 'Completed', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
  ];

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getClientName(p.clientId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCard = (project) => (
    <div key={project.id} className="bg-white border border-slate-200/60 rounded-3xl p-6 mb-5 cursor-pointer hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 group active:scale-[0.98] relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>

      <div className="flex justify-between items-start mb-5">
        <div className="flex flex-col min-w-0 pr-4">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mb-1 truncate">{getClientName(project.clientId)}</span>
          <h4 className="font-black text-slate-900 text-base leading-tight tracking-tight group-hover:text-blue-600 transition-colors truncate">{project.name}</h4>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {project.status !== 'To Do' && (
            <button onClick={(e) => { e.stopPropagation(); updateStatus(project.id, 'To Do'); }} className="p-2 hover:bg-slate-100 rounded-xl text-slate-300 hover:text-slate-600 transition-all" title="Move to Todo">
              <ListTodo size={14} strokeWidth={2.5} />
            </button>
          )}
          {project.status !== 'In Progress' && (
            <button onClick={(e) => { e.stopPropagation(); updateStatus(project.id, 'In Progress'); }} className="p-2 hover:bg-blue-50 rounded-xl text-slate-300 hover:text-blue-600 transition-all" title="Start Project">
              <Activity size={14} strokeWidth={2.5} />
            </button>
          )}
          {project.status !== 'Completed' && (
            <button onClick={(e) => { e.stopPropagation(); updateStatus(project.id, 'Completed'); }} className="p-2 hover:bg-emerald-50 rounded-xl text-slate-300 hover:text-emerald-600 transition-all" title="Complete Project">
              <CheckCircle size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>Execution Progress</span>
            <span className="text-slate-900">{project.progress || 0}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div 
              className={`h-full transition-all duration-1000 rounded-full ${
                project.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]'
              }`} 
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 min-w-0">
            <div className="p-1.5 bg-slate-100 rounded-lg shrink-0">
              <Briefcase size={12} strokeWidth={2.5} className="text-slate-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest truncate">{project.type || 'N/A'}</span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Budget</p>
            <p className="text-sm font-black text-slate-900 tracking-tighter">{sym}{(project.budget || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col space-y-10 overflow-hidden pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
            <Layers size={12} strokeWidth={3} />
            <span>Strategic Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Project Tracking</h1>
          <p className="text-slate-500 text-sm mt-3 font-medium">Monitoring lifecycle progress and capital allocation across active initiatives.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-full md:w-80 transition-all shadow-sm" 
              placeholder="Search active project board..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)} 
              className="flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white rounded-[20px] hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus size={18} strokeWidth={3} />
              Add Project
            </button>
          )}
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 flex gap-8 overflow-x-auto pb-10 items-start custom-scrollbar">
        {columns.map(col => {
          const colProjects = filteredProjects.filter(p => p.status === col.name);
          return (
            <div key={col.name} className="min-w-[340px] max-w-[340px] flex flex-col h-full rounded-[40px] bg-slate-50/50 border border-slate-100 p-4 group/column">
              {/* Column Header */}
              <div className="flex justify-between items-center px-4 py-5 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${col.bg} ${col.color} border ${col.border} shadow-sm`}>
                    <col.icon size={16} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] leading-tight">{col.name}</h3>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{colProjects.length} Active Items</span>
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowModal(true)} className="text-slate-300 hover:text-blue-600 p-2 rounded-xl hover:bg-white transition-all opacity-0 group-hover/column:opacity-100 shadow-sm">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                )}
              </div>
              
              {/* Project Card List */}
              <div className="flex-1 overflow-y-auto px-1 space-y-2 custom-scrollbar">
                {colProjects.map(renderCard)}
                
                {colProjects.length === 0 && (
                  <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[32px] py-20 flex flex-col items-center justify-center text-slate-300 group-hover/column:border-slate-300 transition-colors">
                    <FolderKanban size={40} className="mb-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Registry Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Creation Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-white/20 animate-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            <div className="flex justify-between items-center p-10 border-b border-slate-50 shrink-0">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Register Initiative</h2>
                <p className="text-slate-500 text-sm font-medium mt-3">Define the parameters for the new strategic client project.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 shrink-0">
                <X size={28} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <form onSubmit={handleAddProject} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Initiative Nomenclature</label>
                    <div className="relative group">
                      <Briefcase size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" 
                        placeholder="e.g. Q4 Growth Campaign"
                        value={newProject.name} 
                        onChange={e => setNewProject({...newProject, name: e.target.value})} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Key Stakeholder</label>
                    <div className="relative group">
                      <Target size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <select 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-10 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        value={newProject.clientId} 
                        onChange={e => setNewProject({...newProject, clientId: e.target.value})}
                      >
                        <option value="">Select Stakeholder</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Category Tier</label>
                    <div className="relative group">
                      <Layers size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" 
                        placeholder="e.g. Marketing"
                        value={newProject.type} 
                        onChange={e => setNewProject({...newProject, type: e.target.value})} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Capital Budget ({sym})</label>
                    <div className="relative group">
                      <DollarSign size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" 
                        value={newProject.budget} 
                        onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Initial Completion (%)</label>
                    <div className="relative group">
                      <TrendingUp size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" 
                        value={newProject.progress} 
                        onChange={e => setNewProject({...newProject, progress: Number(e.target.value)})} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="flex-1 px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                  >
                    Save Initiative
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
