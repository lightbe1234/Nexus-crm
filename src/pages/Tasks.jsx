import React, { useState, useEffect, useRef } from 'react';
import { subscribeToTasks, addTask, updateTask, deleteTask, subscribeToProjects, getUsers, subscribeToTaskMessages, addTaskMessage, uploadFile, deleteTaskMessage } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, MessageSquare, Clock, Calendar, User, Flag, 
  CheckCircle2, MoreHorizontal, Send, AlertCircle,
  BarChart3, Search, ChevronRight, Filter, ListTodo,
  Activity, ClipboardCheck, CheckCircle, Edit, Trash,
  FolderKanban, X, Paperclip, FileText, Image as ImageIcon,
  Zap, ArrowRight, Target, Layout, ShieldCheck, Sparkles,
  Box, Layers, Globe2, Award, ChevronDown, LayoutGrid,
  Kanban, ListFilter, TrendingUp, Bell, Users
} from 'lucide-react';

const Countdown = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diff = target - now;
      if (diff <= 0) { setTimeLeft('EXPIRED'); clearInterval(timer); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m`);
      else setTimeLeft(`${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border ${timeLeft === 'EXPIRED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-500/5'}`}>
      <Clock size={12} strokeWidth={3} />
      <span className="font-black text-[9px] tracking-widest uppercase">{timeLeft}</span>
    </div>
  );
};

export default function Tasks() {
  const { currentUser, userRole } = useAuth();
  const isAdmin = userRole === 'Admin';
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskMessages, setTaskMessages] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const fileInputRef = useRef(null);
  
  const [newTask, setNewTask] = useState({ 
    title: '', projectId: '', assigneeId: '', status: 'To Do', priority: 'Medium',
    description: '', dueDate: '', dueTime: '', progress: 0, comments: [], review: ''
  });

  useEffect(() => {
    setLoading(true);
    const unsubTasks = subscribeToTasks(setTasks);
    const unsubProjects = subscribeToProjects(setProjects);
    getUsers().then(setUsers).finally(() => setLoading(false));
    return () => { unsubTasks(); unsubProjects(); };
  }, []);

  useEffect(() => {
    let unsubscribe = null;
    if (selectedTask) {
      unsubscribe = subscribeToTaskMessages(selectedTask.id, setTaskMessages);
    } else { setTaskMessages([]); }
    return () => unsubscribe?.();
  }, [selectedTask?.id]);

  const handleSaveTask = async (e) => {
    if (e) e.preventDefault();
    if (!newTask.title?.trim()) { setFormError('Task title is required.'); return; }
    if (!newTask.projectId) { setFormError('Please select a project.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingTask) { await updateTask(editingTask, { ...newTask }); }
      else { await addTask({ ...newTask, creatorId: currentUser.uid, createdAt: new Date().toISOString() }); }
      setShowModal(false); setEditingTask(null);
      setNewTask({ title: '', projectId: '', assigneeId: '', status: 'To Do', priority: 'Medium', description: '', dueDate: '', dueTime: '', progress: 0, comments: [], review: '' });
    } catch (err) {
      setFormError('Failed to save task. Please try again.');
      console.error(err);
    } finally { setSaving(false); }
  };

  const handleDeleteTask = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try { await deleteTask(id); if (selectedTask?.id === id) setSelectedTask(null); }
    catch (err) { console.error(err); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if ((!newComment.trim() && !file) || !selectedTask || isUploading) return;
    setIsUploading(true);
    try {
      let fileData = null;
      if (file) {
        const url = await uploadFile(file, 'taskFiles');
        fileData = { url, name: file.name, type: file.type.startsWith('image/') ? 'image' : 'document' };
      }
      await addTaskMessage({
        taskId: selectedTask.id, text: newComment.trim(), file: fileData,
        author: currentUser.displayName || currentUser.email, authorId: currentUser.uid, role: userRole
      });
      setNewComment(''); setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) { console.error(err); }
    setIsUploading(false);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateTask(id, { status: newStatus });
      if (selectedTask?.id === id) setSelectedTask(prev => ({ ...prev, status: newStatus }));
    } catch (err) { console.error(err); }
  };

  const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Internal Task';
  const getUserName = (id) => users.find(u => u.id === id)?.name || 'Unassigned';
  const getUserInitial = (id) => getUserName(id).charAt(0).toUpperCase();

  const columns = [
    { name: 'To Do', icon: ListTodo, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', accent: 'bg-slate-400' },
    { name: 'In Progress', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100', accent: 'bg-blue-600' },
    { name: 'Review', icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-100', accent: 'bg-amber-600' },
    { name: 'Completed', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100', accent: 'bg-emerald-600' }
  ];

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getProjectName(t.projectId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCard = (task) => (
    <div 
      key={task.id} 
      onClick={() => setSelectedTask(task)}
      className="premium-card p-5 mb-4 cursor-pointer hover:border-blue-400 group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 animate-slide-up bg-white/70 backdrop-blur-md"
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full ${
        task.priority === 'High' ? 'bg-rose-500 shadow-[2px_0_10px_rgba(244,63,94,0.3)]' : 
        task.priority === 'Medium' ? 'bg-amber-500 shadow-[2px_0_10px_rgba(245,158,11,0.3)]' : 'bg-slate-300'
      }`} />

      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-widest truncate max-w-[70%]">
          {getProjectName(task.projectId)}
        </span>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${
            task.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
            task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
            'bg-slate-50 text-slate-500 border-slate-100'
          }`}>
            {task.priority}
          </div>
          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => { setEditingTask(task.id); setNewTask({ ...task }); setShowModal(true); }}
                className="p-1.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-100 rounded-lg transition-all"
              >
                <Edit size={12} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-bold text-slate-900 text-base mb-1 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2 uppercase">
          {task.title}
        </h4>
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
          {task.description || 'No description provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg" title={getUserName(task.assigneeId)}>
            {getUserInitial(task.assigneeId)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">
              {getUserName(task.assigneeId).split(' ')[0]}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {task.dueDate && <Countdown deadline={`${task.dueDate}T${task.dueTime || '23:59'}`} />}
          <div className="flex items-center gap-1.5 text-slate-400">
            <MessageSquare size={12} strokeWidth={3} />
            <span className="text-[11px] font-bold">{task.messagesCount || 0}</span>
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
              <span>Project Workflow System</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Task <span className="text-blue-600">Board</span></h1>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative group flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} strokeWidth={3} />
              <input 
                className="pl-12 pr-6 py-3 text-[11px] font-bold uppercase tracking-widest bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 w-full lg:w-72 transition-all placeholder:text-slate-300" 
                placeholder="Search registry..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isAdmin && (
              <button 
                onClick={() => { setEditingTask(null); setShowModal(true); }} 
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95"
              >
                <Plus size={16} strokeWidth={3} />
                New Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Kanban Board - One Screen Architecture */}
      <div className="flex-1 overflow-y-hidden px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 h-full">
          {columns.map((col, idx) => {
            const colTasks = filteredTasks.filter(t => t.status === col.name);
            return (
              <div 
                key={col.name} 
                className="flex flex-col h-full rounded-[2.5rem] bg-slate-100/40 border border-slate-200/50 group/column transition-all hover:bg-slate-100/60"
              >
                {/* Fixed Column Header */}
                <div className="sticky top-0 z-20 flex justify-between items-center px-6 py-5 bg-slate-100/80 backdrop-blur-md rounded-t-[2rem] border-b border-slate-200/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${col.bg} ${col.color} flex items-center justify-center shadow-sm`}>
                      <col.icon size={16} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-black text-slate-900 text-[12px] leading-none uppercase tracking-tight">{col.name}</h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{colTasks.length}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => { setNewTask(prev => ({ ...prev, status: col.name })); setShowModal(true); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all">
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  )}
                </div>
                
                {/* Scrollable Card List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
                  {colTasks.map((t, i) => (
                    <div key={t.id} className="animate-slide-up" style={{ animationDelay: `${(idx * 4 + i) * 0.05}s` }}>
                      {renderCard(t)}
                    </div>
                  ))}
                  
                  {colTasks.length === 0 && (
                    <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-[1.5rem] py-12 flex flex-col items-center justify-center text-slate-300">
                      <Box size={24} className="opacity-20 mb-3" strokeWidth={2} />
                      <p className="text-[9px] font-black uppercase tracking-widest italic text-center">Empty Slate</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cinematic Task Detail View */}
      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-box-cinematic flex-col lg:flex-row shadow-[0_0_100px_rgba(0,0,0,0.2)]">
            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white relative z-10">
              <div className="p-4 md:p-6 lg:p-8 border-b border-slate-50 bg-slate-50/20 relative shrink-0 sticky top-0 z-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="flex flex-wrap items-center gap-4 mb-8 relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                    <Layers size={14} strokeWidth={3} />
                    <span>{getProjectName(selectedTask.projectId)}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border shadow-sm ${
                    selectedTask.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    <Flag size={14} strokeWidth={3} />
                    <span>{selectedTask.priority} Stratum</span>
                  </div>
                  
                  <div className="flex-1 flex flex-wrap items-center justify-end gap-3">
                    <button onClick={() => setSelectedTask(null)} className="lg:hidden p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-slate-900 transition-all shadow-sm">
                      <X size={20} strokeWidth={3} />
                    </button>
                    {isAdmin && (
                      <button onClick={(e) => { handleDeleteTask(selectedTask.id); setSelectedTask(null); }} className="p-3 bg-white border border-slate-100 text-rose-500 rounded-xl hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                        <Trash size={18} strokeWidth={3} />
                      </button>
                    )}
                    <div className="relative">
                      <select 
                        className="appearance-none bg-slate-900 text-white rounded-xl pl-6 pr-12 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20"
                        value={selectedTask.status}
                        onChange={(e) => updateStatus(selectedTask.id, e.target.value)}
                      >
                        {columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={14} strokeWidth={3} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-tight mb-8 relative z-10 break-words max-w-full">
                  {selectedTask.title}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 relative z-10">
                  <div className="flex items-center gap-5 group min-w-0">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-2xl shadow-slate-900/20 group-hover:rotate-3 transition-transform">
                      {getUserInitial(selectedTask.assigneeId)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight whitespace-nowrap">Lead Operative</p>
                      <p className="text-sm md:text-base font-black text-slate-900 tracking-tighter uppercase leading-tight truncate">{getUserName(selectedTask.assigneeId)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 group min-w-0">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-xl shadow-amber-900/5 group-hover:-translate-y-1 transition-transform">
                      <Calendar size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight whitespace-nowrap">Target Deadline</p>
                      <p className="text-sm md:text-base font-black text-slate-900 tracking-tighter uppercase leading-tight truncate">{selectedTask.dueDate || 'PENDING'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 group min-w-0">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xl shadow-amber-900/5 group-hover:-translate-y-1 transition-transform">
                      <Target size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight whitespace-nowrap">Execution Velocity</p>
                      <p className="text-sm md:text-base font-black text-slate-900 tracking-tighter uppercase leading-tight truncate">{selectedTask.progress || 0}% Done</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 group min-w-0">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xl shadow-blue-900/5 group-hover:-translate-y-1 transition-transform">
                      <Bell size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-tight whitespace-nowrap">Alert Status</p>
                      <p className="text-sm md:text-base font-black text-slate-900 tracking-tighter uppercase leading-tight truncate">NOMINAL</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-white scrollbar-none">
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-1 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Operational Briefing</h3>
                  </div>
                  <div className="bg-slate-50/50 p-12 rounded-[3rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50">
                    <div className="absolute top-8 right-12 text-slate-200 group-hover:text-blue-200 transition-colors duration-700">
                      <FileText size={64} strokeWidth={1} />
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xl font-medium relative z-10 italic tracking-tight">
                      "{selectedTask.description || 'Institutional brief not finalized. Awaiting leadership directive.'}"
                    </p>
                  </div>
                </section>

                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-1 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Induction Calibration</h3>
                  </div>
                  <div className="grid grid-cols-5 gap-6">
                    {[0, 25, 50, 75, 100].map(p => (
                      <button 
                        key={p}
                        onClick={() => updateTask(selectedTask.id, { progress: p })}
                        className={`group relative py-8 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all overflow-hidden border ${
                          selectedTask.progress === p 
                            ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/40 -translate-y-2 border-slate-900' 
                            : 'bg-slate-50 text-slate-400 hover:bg-white border-slate-100 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        <span className="relative z-10">{p}%</span>
                        {selectedTask.progress === p && <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </section>
                
                {selectedTask.review && (
                  <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-1 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Command Protocol Feedback</h3>
                    </div>
                    <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000"></div>
                      <div className="flex items-center gap-4 mb-8 relative z-10">
                        <ShieldCheck size={24} className="text-indigo-400" strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Validated Directive</span>
                      </div>
                      <div className="relative z-10 italic text-xl font-medium text-slate-200 leading-relaxed tracking-tight">
                        {selectedTask.review}
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Tactical Discussion Sidebar */}
            <div className="w-full lg:w-[360px] shrink-0 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col overflow-hidden relative">
              <div className="p-6 md:p-8 border-b border-slate-200/30 bg-white/50 backdrop-blur-xl flex justify-between items-center relative z-10 shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center animate-bounce-slow">
                    <MessageSquare size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-2">Team Intel Sync</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{taskMessages.length} Secure Logs</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTask(null)} className="hidden lg:block p-4 bg-white border border-slate-100 text-slate-300 hover:text-slate-900 rounded-2xl transition-all hover:shadow-xl">
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] scrollbar-none">
                {taskMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-6 animate-pulse">
                      <Activity size={32} strokeWidth={1.5} className="opacity-30" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-slate-400">Silent Frequency</h4>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-300">Awaiting tactical injection...</p>
                  </div>
                ) : (
                  taskMessages.map((c, i) => (
                    <div key={c.id || i} className={`flex flex-col group ${c.authorId === currentUser.uid ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`} style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="flex items-center gap-3 mb-4 px-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${c.authorId === currentUser.uid ? 'bg-slate-900' : 'bg-blue-600'} shadow-[0_0_8px_rgba(37,99,235,0.4)]`} />
                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest leading-none">{c.author}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                          {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'SYNCHRONIZING'}
                        </span>
                      </div>
                      <div className="flex items-end gap-4 max-w-[95%]">
                      {c.authorId === currentUser.uid && (
                        <button onClick={() => deleteTaskMessage(c.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all mb-2">
                          <Trash size={14} strokeWidth={3} />
                        </button>
                      )}
                      <div className={`px-7 py-5 rounded-[2rem] text-sm font-medium shadow-2xl border transition-all hover:scale-[1.02] ${
                        c.authorId === currentUser.uid
                          ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none shadow-slate-900/10' 
                          : 'bg-white text-slate-700 border-slate-100 rounded-tl-none shadow-slate-200/50'
                      }`}>
                        {c.file && (
                          <div className="mb-5">
                            {c.file.type === 'image' ? (
                              <div className="relative group/img overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                                <img src={c.file.url} alt="attachment" className="w-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                  <ImageIcon size={24} className="text-white" />
                                </div>
                              </div>
                            ) : (
                              <a href={c.file.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-4 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${c.authorId === currentUser.uid ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}>
                                <div className="p-2 rounded-xl bg-current opacity-10"><FileText size={16} /></div>
                                <span className="truncate max-w-[140px]">{c.file.name}</span>
                                <ChevronRight size={14} strokeWidth={3} className="ml-auto" />
                              </a>
                            )}
                          </div>
                        )}
                        <div className="leading-relaxed tracking-tight">{c.text}</div>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-white border-t border-slate-100 space-y-6 shadow-[0_-20px_50px_rgba(0,0,0,0.03)] relative z-10 shrink-0">
                {file && (
                  <div className="flex items-center justify-between p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 animate-in zoom-in shadow-lg shadow-blue-500/5">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-blue-100 rounded-xl">{file.type.startsWith('image/') ? <ImageIcon size={14} strokeWidth={3} /> : <FileText size={14} strokeWidth={3} />}</div>
                      <span className="truncate max-w-[240px]">{file.name}</span>
                    </div>
                    <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-2 hover:bg-blue-200 rounded-xl transition-all">
                      <X size={16} strokeWidth={4} />
                    </button>
                  </div>
                )}
                <form onSubmit={handleAddComment} className="relative flex gap-4">
                  <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 bg-slate-50 border border-slate-200 text-slate-300 rounded-[1.5rem] hover:text-blue-600 hover:bg-white hover:border-blue-400 transition-all shadow-sm flex items-center justify-center shrink-0">
                    <Paperclip size={24} strokeWidth={2.5} />
                  </button>
                  <div className="relative flex-1">
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-6 pr-20 py-5 resize-none italic font-medium text-base shadow-inner focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 h-16"
                      placeholder="Induction update..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-20 disabled:shadow-none flex items-center justify-center" 
                      disabled={(!newComment.trim() && !file) || isUploading}
                    >
                      {isUploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} strokeWidth={3} />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-lg border border-blue-100 mb-1">
                  <Sparkles size={11} strokeWidth={3} />
                  <span>New Task</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              </div>
              <button type="button" onClick={() => { setShowModal(false); setFormError(''); }} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-700">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSaveTask} className="space-y-5">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-semibold flex items-start gap-2">
                    <span className="shrink-0">⚠</span>
                    <span>{formError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Task Title</label>
                  <div className="relative group">
                    <Target size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input
                      type="text" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all"
                      placeholder="e.g. Design landing page"
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Project</label>
                    <div className="relative">
                      <Layers size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <select
                        required className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-8 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none cursor-pointer"
                        value={newTask.projectId}
                        onChange={e => setNewTask({...newTask, projectId: e.target.value})}
                      >
                        <option value="">Select project…</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <ChevronDown size={14} strokeWidth={2.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Assignee</label>
                    <div className="relative">
                      <User size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <select
                        required className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-8 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none cursor-pointer"
                        value={newTask.assigneeId}
                        onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                      >
                        <option value="">Select person…</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                      <ChevronDown size={14} strokeWidth={2.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                    <div className="relative">
                      <Flag size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <select
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-8 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none cursor-pointer"
                        value={newTask.priority}
                        onChange={e => setNewTask({...newTask, priority: e.target.value})}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High — Critical</option>
                      </select>
                      <ChevronDown size={14} strokeWidth={2.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Due Date</label>
                    <div className="relative">
                      <Calendar size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        type="date" required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none"
                        value={newTask.dueDate}
                        onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <div className="relative">
                    <FileText size={16} strokeWidth={2.5} className="absolute left-4 top-3.5 text-blue-500" />
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 outline-none transition-all h-28 resize-none"
                      placeholder="What needs to be done?"
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/60 shrink-0">
              <button type="button" onClick={() => { setShowModal(false); setFormError(''); }} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              <button
                onClick={handleSaveTask}
                disabled={saving}
                className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} strokeWidth={2.5} />
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
