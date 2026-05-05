import React, { useState, useEffect, useRef } from 'react';
import { getTasks, addTask, updateTask, getProjects, getUsers } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  Calendar, 
  User, 
  Flag, 
  CheckCircle2, 
  MoreHorizontal, 
  Send,
  AlertCircle,
  BarChart3,
  Search,
  ChevronRight,
  Filter,
  CheckSquare,
  ListTodo,
  Activity,
  ClipboardCheck,
  CheckCircle,
  MoreVertical,
  Edit,
  Trash,
  FolderKanban
} from 'lucide-react';

// Countdown Timer Component
const Countdown = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
        return;
      }

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
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${timeLeft === 'EXPIRED' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-600'}`}>
      <Clock size={12} strokeWidth={2.5} />
      <span className="font-black text-[10px] tracking-tight uppercase">
        {timeLeft}
      </span>
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
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    projectId: '', 
    assigneeId: '', 
    status: 'To Do', 
    priority: 'Medium',
    description: '',
    dueDate: '',
    dueTime: '',
    progress: 0,
    comments: [],
    review: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, projectsData, usersData] = await Promise.all([getTasks(), getProjects(), getUsers()]);
      setTasks(tasksData);
      setProjects(projectsData);
      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await addTask({
        ...newTask,
        creatorId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      setNewTask({ title: '', projectId: '', assigneeId: '', status: 'To Do', priority: 'Medium', description: '', dueDate: '', dueTime: '', progress: 0, comments: [], review: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (taskId, progress) => {
    try {
      await updateTask(taskId, { progress });
      fetchData();
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => ({ ...prev, progress }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    const commentObj = {
      text: newComment,
      author: currentUser.name || currentUser.email,
      timestamp: new Date().toISOString()
    };

    try {
      const updatedComments = [...(selectedTask.comments || []), commentObj];
      await updateTask(selectedTask.id, { comments: updatedComments });
      setSelectedTask(prev => ({ ...prev, comments: updatedComments }));
      setNewComment('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReview = async (taskId, review) => {
    if (userRole !== 'Admin') return;
    try {
      await updateTask(taskId, { review });
      setSelectedTask(prev => ({ ...prev, review }));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateTask(id, { status: newStatus });
      fetchData();
      if (selectedTask?.id === id) {
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Internal Task';
  const getUserName = (id) => users.find(u => u.id === id)?.name || 'Unassigned';
  const getUserInitial = (id) => {
    const name = getUserName(id);
    return name.charAt(0).toUpperCase();
  };

  const columns = [
    { name: 'To Do', icon: ListTodo, color: 'text-slate-400', bg: 'bg-slate-400/10' },
    { name: 'In Progress', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Review', icon: ClipboardCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Done', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getProjectName(t.projectId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCard = (task) => (
    <div 
      key={task.id} 
      onClick={() => setSelectedTask(task)}
      className="bg-white border border-slate-200/60 rounded-3xl p-6 mb-5 cursor-pointer hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 active:scale-[0.98] group relative overflow-hidden flex flex-col gap-4"
    >
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>

      {/* Card Ribbon for Priority */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
        task.priority === 'High' ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 
        task.priority === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-slate-300 to-slate-200'
      }`} />

      <div className="flex justify-between items-start pt-1">
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest truncate max-w-[70%]">
          {getProjectName(task.projectId)}
        </span>
        {isAdmin && (
          <button 
            onClick={(e) => { e.stopPropagation(); /* future edit trigger */ }}
            className="text-slate-300 hover:text-slate-900 p-1.5 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-slate-100"
          >
            <MoreVertical size={16} />
          </button>
        )}
      </div>
      
      <div>
        <h4 className="font-black text-slate-900 text-base mb-1 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
          {task.title}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
          {task.description || 'No detailed description available for this task.'}
        </p>
      </div>

      <div className="space-y-4 mt-auto">
        {/* Progress Section */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Progress</span>
            <span className="text-slate-900">{task.progress || 0}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div 
              className={`h-full transition-all duration-1000 rounded-full ${
                task.status === 'Done' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]'
              }`} 
              style={{ width: `${task.progress || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm" title={getUserName(task.assigneeId)}>
              {getUserInitial(task.assigneeId)}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:block truncate max-w-[60px]">
              {getUserName(task.assigneeId).split(' ')[0]}
            </span>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {task.dueDate && <Countdown deadline={`${task.dueDate}T${task.dueTime || '23:59'}`} />}
            <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
              <MessageSquare size={12} strokeWidth={3} />
              <span className="text-[10px] font-black">{task.comments?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col space-y-6 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Workflow Board</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Real-time task synchronization across all agency projects.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-full md:w-72 transition-all shadow-sm" 
              placeholder="Search tasks, projects..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)} 
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 flex gap-8 overflow-x-auto pb-10 items-start custom-scrollbar">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.name);
          return (
            <div key={col.name} className="min-w-[340px] max-w-[340px] flex flex-col h-full rounded-[40px] bg-slate-50/50 border border-slate-100 p-4 group/column">
              {/* Column Header */}
              <div className="flex justify-between items-center px-4 py-5 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${col.bg} ${col.color} border ${col.bg.replace('/10', '/20')} shadow-sm`}>
                    <col.icon size={16} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] leading-tight">{col.name}</h3>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{colTasks.length} Active Items</span>
                  </div>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => {
                      setNewTask(prev => ({ ...prev, status: col.name }));
                      setShowModal(true);
                    }} 
                    className="text-slate-300 hover:text-blue-600 p-2 rounded-xl hover:bg-white transition-all opacity-0 group-hover/column:opacity-100 shadow-sm"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                )}
              </div>
              
              {/* Task List */}
              <div className="flex-1 overflow-y-auto px-1 space-y-2 custom-scrollbar">
                {colTasks.map(renderCard)}
                
                {colTasks.length === 0 && (
                  <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[32px] py-20 flex flex-col items-center justify-center text-slate-300 group-hover/column:border-slate-300 transition-colors">
                    <FolderKanban size={40} className="mb-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Empty Section</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl h-[90vh] max-h-[90vh] flex flex-col md:flex-row overflow-hidden border border-white/20 animate-in zoom-in duration-300">
            {/* Left Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-10 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                    {getProjectName(selectedTask.projectId)}
                  </span>
                  <span className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    selectedTask.priority === 'High' 
                      ? 'bg-rose-50 text-rose-600 border-rose-100/50' 
                      : 'bg-amber-50 text-amber-600 border-amber-100/50'
                  }`}>
                    {selectedTask.priority} Priority
                  </span>
                  <div className="ml-auto">
                    <select 
                      className="bg-slate-900 text-white border-none rounded-2xl px-5 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-500/20 outline-none cursor-pointer hover:bg-blue-600 transition-all shadow-lg"
                      value={selectedTask.status}
                      onChange={(e) => updateStatus(selectedTask.id, e.target.value)}
                    >
                      {columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                  {selectedTask.title}
                </h2>
                
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 border border-slate-200">
                      {getUserInitial(selectedTask.assigneeId)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</p>
                      <p className="text-sm font-bold text-slate-900">{getUserName(selectedTask.assigneeId)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                      <Calendar size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</p>
                      <p className="text-sm font-bold text-slate-900">{selectedTask.dueDate || 'TBA'} · {selectedTask.dueTime || 'Anytime'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-6 h-1 bg-blue-600 rounded-full"></span>
                    Description
                  </h3>
                  <div className="bg-slate-50/50 p-6 rounded-[28px] border border-slate-100">
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                      {selectedTask.description || 'No detailed description provided for this task.'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-6 h-1 bg-emerald-500 rounded-full"></span>
                    Work Progress
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {[0, 25, 50, 75, 100].map(p => (
                      <button 
                        key={p}
                        onClick={() => handleUpdateProgress(selectedTask.id, p)}
                        className={`flex-1 min-w-[80px] py-4 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all duration-300 ${
                          selectedTask.progress === p 
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105 border-transparent' 
                            : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500'
                        }`}
                      >
                        {p}% Completed
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-6 h-1 bg-blue-600 rounded-full"></span>
                    Project Review
                  </h3>
                  <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="flex items-center gap-3 mb-6">
                      <CheckCircle2 size={20} className="text-blue-400" strokeWidth={3} />
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-400">Admin Feedback</h3>
                    </div>
                    {userRole === 'Admin' ? (
                      <textarea 
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-5 text-sm focus:ring-4 focus:ring-blue-500/20 outline-none transition-all h-36 placeholder:text-slate-600 text-slate-200 resize-none"
                        placeholder="Provide detailed feedback for the team..."
                        value={selectedTask.review || ''}
                        onChange={(e) => handleUpdateReview(selectedTask.id, e.target.value)}
                      />
                    ) : (
                      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl text-sm text-slate-300 min-h-[140px] leading-relaxed italic">
                        {selectedTask.review || 'The project review is pending. Feedback will appear here once an administrator has evaluated the task progress.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Area (Discussion) */}
            <div className="w-full md:w-[420px] shrink-0 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col overflow-hidden relative">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={16} strokeWidth={3} className="text-blue-600" />
                  Team Discussion
                </h3>
                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-900">
                  <Plus size={24} className="rotate-45" strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {selectedTask.comments?.map((c, i) => (
                  <div key={i} className={`flex flex-col ${c.author === currentUser.name ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1.5 px-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.author}</span>
                      <span className="text-[9px] text-slate-300 font-bold">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-4 rounded-2xl max-w-[90%] text-sm shadow-sm border ${
                      c.author === (currentUser.name || currentUser.email)
                        ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' 
                        : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                    }`}>
                      {c.text}
                    </div>
                  </div>
                ))}
                
                {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                    <MessageSquare size={48} strokeWidth={1} className="mb-4" />
                    <p className="text-[11px] font-black uppercase tracking-widest">Start a discussion</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-slate-100">
                <form onSubmit={handleAddComment} className="relative group">
                  <textarea 
                    className="w-full bg-slate-100 border-none rounded-3xl pl-5 pr-14 py-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none h-20 placeholder:text-slate-400 font-medium"
                    placeholder="Type your message..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button className="absolute right-3 bottom-3 p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50" disabled={!newComment.trim()}>
                    <Send size={18} strokeWidth={2.5} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Task Creation Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/20 animate-in zoom-in duration-300 overflow-hidden">
            <div className="flex justify-between items-center p-10 border-b border-slate-50 shrink-0">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Initialize Task</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Fill out the essential parameters for the new project activity.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 shrink-0">
                <Plus size={32} className="rotate-45" strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <form onSubmit={handleAddTask} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Title of Activity</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" 
                    placeholder="e.g. Brand Identity Design Phase 1"
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Parent Project</label>
                  <div className="relative group">
                    <select 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                      value={newTask.projectId} 
                      onChange={e => setNewTask({...newTask, projectId: e.target.value})}
                    >
                      <option value="">Choose Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Primary Assignee</label>
                  <div className="relative group">
                    <select 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                      value={newTask.assigneeId} 
                      onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                    >
                      <option value="">Select Team Member</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Urgency Level</label>
                  <div className="relative group">
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                      value={newTask.priority} 
                      onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                    <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Target Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none" 
                    value={newTask.dueDate} 
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Detailed Brief</label>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all h-32 placeholder:text-slate-300 resize-none" 
                    placeholder="Briefly explain the scope of work..."
                    value={newTask.description} 
                    onChange={e => setNewTask({...newTask, description: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                >
                  Create Activity
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
