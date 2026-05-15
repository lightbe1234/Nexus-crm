import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMyEmployeeProfile,
  subscribeToMyTasks,
  subscribeToMyAttendance,
  getMyPerformance,
} from '../../services/employeePortal';
import {
  Clock,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Calendar,
  Zap,
  AlertCircle,
  Sparkles,
  BarChart3,
  Target,
  ArrowRight,
  Activity,
  Award,
  ShieldCheck,
  Box,
  ChevronRight,
  User,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActivityFeed from '../../components/ActivityFeed';

export default function EmployeeDashboard() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  const [profile, setProfile] = useState(null);
  const [todayAtt, setTodayAtt] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    if (!uid) return;

    setLoading(true);
    const loadProfile = async () => {
      try {
        const prof = await getMyEmployeeProfile(uid);
        const perf = await getMyPerformance(uid);
        setProfile(prof);
        setPerformance(perf);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();

    const unsubTasks = subscribeToMyTasks(uid, (newTasks) => {
      setTasks(newTasks);
    });

    const unsubAttendance = subscribeToMyAttendance(uid, (newAttendance) => {
      const todayDate = new Date().toISOString().split('T')[0];
      const todayRecord = newAttendance.find(a => a.date === todayDate);
      setTodayAtt(todayRecord || null);
    });

    return () => {
      unsubTasks();
      unsubAttendance();
    };
  }, [uid]);

  // Task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const pendingTasks = tasks.filter(t => ['To Do', 'In Progress', 'Review'].includes(t.status)).length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length;

  // Performance context
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentPerf = performance.find(p => p.month === currentMonth);
  const perfPct = currentPerf?.performancePercentage ?? 0;
  const attPct = currentPerf?.attendancePercentage ?? 0;
  const attDays = currentPerf?.attendanceDays ?? 0;

  const getAttStatus = () => {
    if (!todayAtt) return { label: 'Inactive', color: 'text-slate-400', bg: 'bg-slate-50', dot: 'bg-slate-300' };
    if (todayAtt.status === 'checked-out') return { label: 'Shift Ended', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
    if (todayAtt.status === 'late') return { label: 'Delayed Entry', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' };
    return { label: 'Active Shift', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' };
  };

  const attStatus = getAttStatus();

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse pb-10">
        <div className="h-40 bg-slate-50 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-50 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  const name = profile?.fullName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Member';

  return (
    <div className="space-y-10 pb-10 animate-slide-up">
      {/* Institutional Hero Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 relative">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 w-fit px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
            <Sparkles size={12} className="animate-pulse" />
            <span>Personnel Command</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium italic opacity-75 flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              Institutional Protocol: {today}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] border-2 shadow-sm transition-all hover:scale-105 duration-500 ${attStatus.bg} ${attStatus.color} ${attStatus.dot === 'bg-blue-500' ? 'border-blue-100' : 'border-slate-100'}`}>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status: {attStatus.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black tracking-tight">{todayAtt?.checkInTime?.slice(0,5) || '--:--'}</span>
                <span className="text-[10px] font-bold opacity-60 uppercase">Shift Start</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${attStatus.dot} flex items-center justify-center text-white shadow-lg shadow-current/20`}>
              <Clock size={20} strokeWidth={3} className={todayAtt && todayAtt.status !== 'checked-out' ? 'animate-spin-slow' : ''} />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action & KPI Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Attendance Quick-Link / Operational Hub */}
        <div className="col-span-12 lg:col-span-12 bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl shadow-slate-900/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 border border-white/20">
                <ShieldCheck size={40} strokeWidth={2.5} />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-black text-white tracking-tight leading-none">Operational Status: <span className="text-blue-400">Secure</span></h2>
                <p className="text-slate-400 text-sm font-medium italic opacity-75">Your daily log is currently being synchronized with HQ servers.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <MapPin size={10} /> {profile?.department || 'Department: General'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <User size={10} /> Rank: {profile?.designation || 'Specialist'}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/employee/attendance')}
              className="group flex items-center gap-4 px-8 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              Access Attendance Log
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Assigned Initiatives', value: totalTasks, icon: Box, sub: 'Current active queue', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Completion Rate', value: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`, icon: CheckCircle2, sub: `${completedTasks} items verified`, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Efficiency Index', value: `${perfPct}%`, icon: Zap, sub: 'Rank: Optimal', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'Attendance Weight', value: `${attPct}%`, icon: Award, sub: `${attDays} days logged`, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          ].map((kpi, idx) => (
            <div key={idx} className="premium-card p-8 group relative overflow-hidden transition-all hover:-translate-y-2">
              <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color} ${kpi.border} border w-fit mb-6 transition-transform group-hover:scale-110 shadow-sm`}>
                <kpi.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{kpi.value}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic pt-2 flex items-center gap-1">
                  <Activity size={10} className={kpi.color} /> {kpi.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Strategic Data Visualization Row */}
        <div className="col-span-12 lg:col-span-8 premium-card p-10 space-y-10">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Initiative Registry</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Operational priority: High</p>
            </div>
            <button 
              onClick={() => navigate('/employee/tasks')}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-2 group"
            >
              Expand Registry <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {tasks.length > 0 ? tasks.slice(0, 4).map((task, i) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
              const statusMap = {
                'Done': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' },
                'In Progress': { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500' },
                'Review': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500' },
                'To Do': { color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-300' },
              };
              const s = statusMap[task.status] || statusMap['To Do'];
              
              return (
                <div key={task.id} className="group flex items-center gap-6 p-6 rounded-[1.5rem] bg-slate-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all animate-slide-right" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`w-3 h-12 rounded-full ${s.dot} shadow-[0_0_10px] shadow-current/20 group-hover:scale-y-110 transition-transform`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{task.title}</h4>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        <Calendar size={12} className={isOverdue ? 'text-rose-500' : 'text-slate-300'} />
                        <span className={isOverdue ? 'text-rose-500' : ''}>{task.dueDate || 'No Schedule'}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID-{task.id?.slice(-6)}</div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${s.bg} ${s.color} ${s.border} shadow-sm`}>
                    {task.status}
                  </div>
                </div>
              );
            }) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
                  <Box size={40} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Registry Empty: No active initiatives assigned.</p>
              </div>
            )}
          </div>
        </div>

        {/* Efficiency Chart / Analytics Hub */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="premium-card p-10 bg-slate-900 text-white relative overflow-hidden group shadow-2xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/30">
                  <BarChart3 size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Efficiency Pulse</h2>
              </div>

              {/* Progress Rings */}
              <div className="flex items-center justify-center gap-10">
                <div className="relative w-32 h-32 group/ring">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      strokeDashoffset={283 * (1 - attPct / 100)}
                      className="transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black tracking-tighter">{attPct}%</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Attendance</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Workload Volume', value: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0, color: 'bg-emerald-500' },
                  { label: 'Strategic Alignment', value: perfPct, color: 'bg-blue-500' },
                ].map((bar, i) => (
                  <div key={i} className="space-y-2 group/bar">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/bar:text-white transition-colors">{bar.label}</span>
                      <span className="text-[10px] font-black text-white">{bar.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-px">
                      <div className={`h-full ${bar.color} rounded-full transition-all duration-1000 shadow-[0_0_10px] shadow-current/20`} style={{ width: `${bar.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Target size={12} className="text-blue-500" />
                Current Phase: {currentMonth}
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/employee/performance')}
            className="w-full premium-card p-6 flex items-center justify-between group hover:border-blue-400 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <TrendingUp size={18} strokeWidth={3} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics</p>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Performance Deep-dive</h4>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* Real-time Activity Stream */}
        <div className="col-span-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <Activity size={14} />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Live Intelligence Stream</h2>
            </div>
            <div className="premium-card overflow-hidden">
              <ActivityFeed isAdmin={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
