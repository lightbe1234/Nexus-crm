import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToMyTasks } from '../../services/employeePortal';
import { subscribeToProjects, updateTask, subscribeToTaskMessages, addTaskMessage, uploadFile, deleteTaskMessage } from '../../services/db';
import {
  CheckCircle2, AlertCircle, ListTodo,
  Activity, ClipboardCheck, CheckCircle, Search,
  Calendar, Flag, X, MessageSquare, Paperclip, FileText, Image as ImageIcon, Trash, Send,
  Zap, ArrowRight, Target, Layout, Filter, Info, ChevronRight
} from 'lucide-react';

const priorityConfig = {
  High: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', bar: 'bg-rose-500', shadow: 'shadow-rose-500/10' },
  Medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', bar: 'bg-amber-500', shadow: 'shadow-amber-500/10' },
  Low: { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', bar: 'bg-slate-400', shadow: 'shadow-slate-500/5' },
};

const statusConfig = {
  'To Do': { icon: ListTodo, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', shadow: 'shadow-slate-500/5' },
  'In Progress': { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', shadow: 'shadow-blue-500/10' },
  'Review': { icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', shadow: 'shadow-amber-500/10' },
  'Done': { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', shadow: 'shadow-emerald-500/10' },
};

export default function MyTasks() {
  const { currentUser, userRole } = useAuth();
  const isAdmin = userRole === 'Admin';
  const uid = currentUser?.uid;

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [taskMessages, setTaskMessages] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let unsubscribe = null;
    if (selectedTask) {
      unsubscribe = subscribeToTaskMessages(selectedTask.id, setTaskMessages);
    } else { setTaskMessages([]); }
    return () => unsubscribe?.();
  }, [selectedTask?.id]);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsubTasks = subscribeToMyTasks(uid, (taskList) => {
      setTasks(taskList);
      setLoading(false);
    });
    const unsubProjects = subscribeToProjects(setProjects);
    return () => { unsubTasks(); unsubProjects(); };
  }, [uid]);

  const getProject = (id) => projects.find(p => p.id === id)?.name || 'Internal Registry';

  const handleStatusUpdate = async (taskId, newStatus) => {
    setUpdatingId(taskId);
    try {
      await updateTask(taskId, { status: newStatus });
      if (selectedTask?.id === taskId) setSelectedTask(prev => ({ ...prev, status: newStatus }));
    } catch (err) { console.error(err); }
    setUpdatingId(null);
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

  const filtered = tasks.filter(t => {
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'Done').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length,
  };

  return (
    <div className="space-y-8 pb-10 animate-slide-up">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100">
            <Target size={12} />
            <span>Mission Directives</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Task <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Registry</span></h1>
          <p className="text-slate-500 text-sm font-medium">Coordinate your assigned deliverables and institutional objectives.</p>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Directives', value: stats.total, icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Finalized Tasks', value: stats.done, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Active Pipeline', value: stats.inProgress, icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
          { label: 'Critical Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
        ].map((s, i) => (
          <div key={i} className="premium-card p-6 group flex items-center gap-5 relative overflow-hidden">
            <div className={`p-3.5 rounded-2xl ${s.bg} ${s.color} ${s.border} border shadow-sm transition-transform group-hover:scale-110`}>
              <s.icon size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Filtering Hub */}
      <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
        <div className="relative group flex-1 w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            className="erp-input pl-11 pr-4 py-3 shadow-none border-none focus:ring-0 w-full"
            placeholder="Search mission registry..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 w-full md:w-auto overflow-x-auto custom-scrollbar">
          {['All', 'To Do', 'In Progress', 'Review', 'Done'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-y-[-1px]'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Task Matrix List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="premium-card p-24 text-center group border-dashed">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={48} strokeWidth={1} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Registry analysis: empty</p>
          <p className="text-xs font-bold text-slate-500">No mission directives matching your current configuration.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((task, idx) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
            const sc = statusConfig[task.status] || statusConfig['To Do'];
            const pc = priorityConfig[task.priority] || priorityConfig['Low'];

            return (
              <div
                key={task.id}
                className="premium-card p-6 hover:border-blue-400 transition-all cursor-pointer group animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className={`w-1.5 h-16 rounded-full shrink-0 ${pc.bar} shadow-lg ${pc.shadow}`} />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">
                        {getProject(task.projectId)}
                      </span>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${pc.bg} ${pc.color} ${pc.border}`}>
                        <Flag size={12} strokeWidth={3} />
                        {task.priority} Priority
                      </div>
                      {isOverdue && (
                        <div className="animate-pulse inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 shadow-sm shadow-rose-900/10">
                          <AlertCircle size={12} strokeWidth={3} />
                          Critical Overdue
                        </div>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                      {task.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1 font-medium italic opacity-70">
                      "{task.description || 'Institutional mission brief not provided.'}"
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 shrink-0">
                    <div onClick={e => e.stopPropagation()} className="relative group/sel">
                      <select
                        value={task.status}
                        disabled={updatingId === task.id}
                        onChange={e => handleStatusUpdate(task.id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border cursor-pointer outline-none appearance-none transition-all hover:shadow-xl ${sc.bg} ${sc.color} ${sc.border} disabled:opacity-50 min-w-[140px] pr-10`}
                      >
                        {['To Do', 'In Progress', 'Review', 'Done'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><ChevronRight size={14} className="rotate-90" /></div>
                    </div>

                    <div className="flex items-center gap-4">
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <Calendar size={12} strokeWidth={3} />
                          {task.dueDate}
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden hidden lg:block">
                          <div className={`h-full transition-all duration-700 ${task.status === 'Done' ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${task.progress || 0}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-slate-900">{task.progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mission Detail Overlay */}
      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-box max-w-[1400px] w-[95vw] h-[95vh] flex-col lg:flex-row overflow-hidden p-0 gap-0 border-none shadow-[0_0_80px_rgba(0,0,0,0.15)]">
            {/* Left Content Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative z-10">
              <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30 shrink-0 sticky top-0 z-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-900/10">
                    {getProject(selectedTask.projectId)}
                  </span>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${priorityConfig[selectedTask.priority]?.bg} ${priorityConfig[selectedTask.priority]?.color} ${priorityConfig[selectedTask.priority]?.border}`}>
                    <Flag size={12} strokeWidth={3} />
                    {selectedTask.priority} Priority
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="ml-auto lg:hidden p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 shadow-sm">
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-6 break-words max-w-full">{selectedTask.title}</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-xl shadow-amber-900/5 group-hover:scale-110 transition-transform">
                      <Calendar size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 break-words">Induction Date</p>
                      <p className="text-sm font-black text-slate-900 break-words">{selectedTask.dueDate || 'Registry Pending'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-xl shadow-emerald-900/5 group-hover:scale-110 transition-transform">
                      <Activity size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 break-words">Efficiency tier</p>
                      <p className="text-sm font-black text-slate-900 break-words">{selectedTask.progress || 0}% Finalized</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-body flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-none">
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Mission Intelligence (Brief)</h3>
                  </div>
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 group relative">
                    <div className="absolute top-4 right-4 text-slate-200 group-hover:text-blue-100 transition-colors">
                      <FileText size={40} strokeWidth={1} />
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap font-medium relative z-10 italic">
                      "{selectedTask.description || 'Institutional brief not finalized.'}"
                    </p>
                  </div>
                </section>

                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Efficiency Registry</h3>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {[0, 25, 50, 75, 100].map(p => (
                      <button
                        key={p}
                        onClick={() => handleStatusUpdate(selectedTask.id, selectedTask.status, p)}
                        disabled={updatingId === selectedTask.id}
                        className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          selectedTask.progress === p
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-400 -translate-y-1'
                            : 'bg-slate-50 text-slate-400 hover:bg-white border border-transparent hover:border-slate-200'
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </section>

                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Operational Tier (Update Status)</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['To Do', 'In Progress', 'Review', 'Done'].map(s => {
                      const sc2 = statusConfig[s];
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(selectedTask.id, s)}
                          className={`flex flex-col items-center gap-3 p-6 rounded-[1.5rem] border-2 transition-all group ${
                            selectedTask.status === s
                              ? 'border-slate-900 bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-y-[-4px]'
                              : `${sc2.bg} ${sc2.color} ${sc2.border} hover:border-slate-400`
                          }`}
                        >
                          <sc2.icon size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {selectedTask.review && (
                  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Administrative Analysis (Review)</h3>
                    </div>
                    <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-900/20 italic font-medium leading-relaxed relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform"></div>
                      "{selectedTask.review}"
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Right Discussion Area */}
            <div className="w-full lg:w-[400px] shrink-0 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col overflow-hidden relative">
              <div className="p-4 md:p-6 border-b border-slate-200/50 bg-slate-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-900/10">
                    <MessageSquare size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Registry Sync</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{taskMessages.length} Messages</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTask(null)} className="hidden lg:block p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 shadow-sm">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] scrollbar-none">
                {taskMessages.map((c, i) => (
                  <div key={c.id || i} className={`flex flex-col group ${c.authorId === currentUser.uid ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.author}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                        {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'JUST NOW'}
                      </span>
                    </div>
                    <div className={`px-5 py-3.5 rounded-3xl max-w-[90%] text-sm font-medium shadow-sm border ${
                      c.authorId === currentUser.uid
                        ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none' 
                        : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'
                    }`}>
                      {c.file && (
                        <div className="mb-3">
                          {c.file.type === 'image' ? (
                            <img src={c.file.url} alt="attachment" className="w-full rounded-xl object-cover border border-white/10 shadow-lg" />
                          ) : (
                            <a href={c.file.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl text-xs font-black uppercase tracking-widest ${c.authorId === currentUser.uid ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 hover:bg-slate-100'}`}>
                              <FileText size={16} strokeWidth={2.5} />
                              <span className="truncate max-w-[120px]">{c.file.name}</span>
                            </a>
                          )}
                        </div>
                      )}
                      <div className="leading-relaxed">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 md:p-6 bg-white border-t border-slate-100 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] shrink-0">
                {file && (
                  <div className="flex items-center justify-between p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 animate-in zoom-in">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {file.type.startsWith('image/') ? <ImageIcon size={14} strokeWidth={2.5} /> : <FileText size={14} strokeWidth={2.5} />}
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                )}
                <form onSubmit={handleAddComment} className="relative flex gap-3">
                  <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-4 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl hover:text-blue-600 hover:bg-white hover:border-blue-200 transition-all shadow-sm">
                    <Paperclip size={20} strokeWidth={2.5} />
                  </button>
                  <div className="relative flex-1">
                    <textarea 
                      className="erp-input h-14 pl-5 pr-14 py-4 resize-none italic font-medium text-sm shadow-sm"
                      placeholder="Commit status update..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button className="absolute right-2 top-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-30 disabled:shadow-none" disabled={(!newComment.trim() && !file) || isUploading}>
                      {isUploading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} strokeWidth={3} />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
