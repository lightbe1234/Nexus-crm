import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getMyPerformance, 
  upsertPerformance, 
  getMyEmployeeProfile,
  subscribeToMyTasks,
  subscribeToMyAttendance
} from '../../services/employeePortal';
import {
  TrendingUp, CheckCircle2, Clock, Calendar, Zap,
  BarChart3, Target, RefreshCw, Award, AlertCircle, CalendarDays,
  Briefcase, Activity, Target as TargetIcon, Layout, ChevronRight,
  ShieldCheck, Rocket, BrainCircuit
} from 'lucide-react';

const getPerfColor = (pct) => {
  if (pct >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200', label: 'Exceptional Tier' };
  if (pct >= 60) return { text: 'text-blue-600', bg: 'bg-blue-500', border: 'border-blue-200', label: 'Operational Tier' };
  if (pct >= 40) return { text: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-200', label: 'Maintenance Tier' };
  return { text: 'text-rose-600', bg: 'bg-rose-500', border: 'border-rose-200', label: 'Critical Tier' };
};

export default function MyPerformance() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  const [performance, setPerformance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfileAndHistory = async () => {
    try {
      const [perf, prof] = await Promise.all([
        getMyPerformance(uid),
        getMyEmployeeProfile(uid),
      ]);
      setPerformance(perf);
      setProfile(prof);
    } catch (err) {
      console.error('Profile load error:', err);
    }
  };

  useEffect(() => {
    if (!uid) return;
    
    setLoading(true);
    loadProfileAndHistory().finally(() => setLoading(false));

    const unsubTasks = subscribeToMyTasks(uid, (newTasks) => {
      setTasks(newTasks);
    });

    const unsubAttendance = subscribeToMyAttendance(uid, (newAttendance) => {
      setAttendance(newAttendance);
    });

    return () => {
      unsubTasks();
      unsubAttendance();
    };
  }, [uid]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await upsertPerformance(uid, profile || { fullName: currentUser?.displayName || currentUser?.email });
      await loadProfileAndHistory();
    } catch (err) {
      console.error('Performance refresh error:', err);
    }
    setRefreshing(false);
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const todayDate = new Date().toISOString().split('T')[0];

  // Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const overdueTasks = tasks.filter(t => t.status !== 'Done' && t.dueDate && t.dueDate < todayDate).length;
  const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
  const productivityScore = totalTasks > 0 ? Math.max(0, Math.round(((totalTasks - overdueTasks) / totalTasks) * 100)) : 100;

  const thisMonthAtt = attendance.filter(a => a.date?.startsWith(currentMonth));
  const attDays = thisMonthAtt.filter(a => ['checked-out', 'checked-in', 'late'].includes(a.status)).length;
  const workingDays = 22; 
  const attPct = Math.min(100, Math.round((attDays / workingDays) * 100));

  const perfPct = Math.round((attPct * 0.4) + (taskRate * 0.4) + (productivityScore * 0.2));
  const pc = getPerfColor(perfPct);
  const hasData = totalTasks > 0 || attendance.length > 0;

  const getInsights = () => {
    const items = [];
    if (attPct < 75) items.push({ title: 'Attendance Velocity', desc: 'Consistent check-ins are vital for baseline score stabilization.', icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50' });
    if (overdueTasks > 0) items.push({ title: 'Registry Conflict', desc: `Critical: ${overdueTasks} directives are past deadline. Immediate resolution required.`, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' });
    if (taskRate > 90) items.push({ title: 'Operational Excellence', desc: 'Maintaining high completion velocity. Target sustained output.', icon: Rocket, color: 'text-emerald-600', bg: 'bg-emerald-50' });
    if (items.length === 0) items.push({ title: 'System Optimized', desc: 'All performance vectors are currently within target parameters.', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' });
    return items;
  };

  return (
    <div className="space-y-10 pb-10 animate-slide-up">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 w-fit px-3 py-1.5 rounded-lg border border-indigo-100">
            <Activity size={12} />
            <span>Efficiency Command</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Efficiency <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Analytics</span></h1>
          <p className="text-slate-500 text-sm font-medium italic opacity-75">Real-time vector analysis of operational performance.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="group flex items-center gap-3 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          {refreshing ? 'Syncing Matrix...' : 'Synchronize Registry'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-8">
          <div className="h-64 bg-slate-50 rounded-[2.5rem] animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-50 rounded-[2rem] animate-pulse" />)}
          </div>
        </div>
      ) : !hasData ? (
        <div className="premium-card p-24 text-center group border-dashed">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-8 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
            <BrainCircuit size={56} strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Analytics Offline</h2>
          <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium leading-relaxed">
            Commence operational check-ins and task fulfillment to generate performance intelligence.
          </p>
        </div>
      ) : (
        <>
          {/* Main Hero Stats */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[2.5rem] blur-2xl opacity-5 group-hover:opacity-10 transition-opacity" />
            <div className="relative premium-card p-10 overflow-hidden bg-white border-slate-100 flex flex-col lg:flex-row items-center gap-12">
              <div className="relative shrink-0">
                <svg className="w-56 h-56 -rotate-90 drop-shadow-[0_0_15px_rgba(79,70,229,0.1)]" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle
                    cx="80" cy="80" r="70" fill="none"
                    stroke="url(#grad1)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - perfPct / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{perfPct}<span className="text-xl text-slate-400 font-bold">%</span></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Efficiency Index</span>
                </div>
              </div>

              <div className="flex-1 space-y-10 w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1.5 text-center md:text-left">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm ${pc.bg} text-white`}>
                      <Award size={12} strokeWidth={3} />
                      {pc.label}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{profile?.fullName || currentUser?.displayName || 'Registry User'}</h2>
                    <p className="text-slate-500 text-sm font-bold flex items-center justify-center md:justify-start gap-2 uppercase tracking-tighter italic">
                      <Briefcase size={14} className="text-indigo-600" />
                      {profile?.role || 'Team Operative'} · {profile?.department || 'Operations'}
                    </p>
                  </div>
                  <div className="flex gap-4 self-center md:self-end">
                    {[
                      { label: 'Inductions', val: totalTasks, icon: TargetIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { label: 'Avg Shift', val: '8.4h', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 min-w-[120px] text-center shadow-xl shadow-slate-900/5 group/stat hover:-translate-y-1 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-xl font-black text-slate-900 tracking-tighter`}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Attendance (40%)', val: attPct, color: 'bg-blue-600', icon: Calendar },
                    { label: 'Execution (40%)', val: taskRate, color: 'bg-indigo-600', icon: CheckCircle2 },
                    { label: 'Consistency (20%)', val: productivityScore, color: 'bg-slate-900', icon: Zap },
                  ].map((m, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2 text-slate-500">
                          <m.icon size={12} className="opacity-50" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-tight">{m.val}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div className={`h-full ${m.color} rounded-full transition-all duration-1000 delay-300 shadow-[0_0_8px_rgba(0,0,0,0.1)]`} style={{ width: `${m.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Metrics Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Task Execution Matrix */}
            <div className="premium-card p-8 group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Task Matrix</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Execution lifecycle</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">{taskRate}%</span>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Finalized', val: completedTasks, total: totalTasks, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'In Pipeline', val: totalTasks - completedTasks - overdueTasks, total: totalTasks, color: 'bg-blue-500', bg: 'bg-blue-50' },
                  { label: 'Critical Overdue', val: overdueTasks, total: totalTasks, color: 'bg-rose-500', bg: 'bg-rose-50' },
                ].map((row, i) => (
                  <div key={i} className="group/row">
                    <div className="flex justify-between items-center mb-1.5 px-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{row.label}</span>
                      <span className="text-xs font-black text-slate-900">{row.val}</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div className={`h-full ${row.color} rounded-full transition-all duration-700`} style={{ width: `${totalTasks > 0 ? (row.val/totalTasks)*100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Analytics */}
            <div className="premium-card p-8 group">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 group-hover:scale-110 transition-transform">
                  <Clock size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Attendance Flow</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">{new Date().toLocaleString('default', { month: 'long' })} Cycle</p>
                </div>
              </div>
              <div className="flex items-center gap-8 h-full">
                <div className="relative shrink-0">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f8fafc" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="#2563eb" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="263.89"
                      strokeDashoffset={263.89 * (1 - attPct/100)}
                      className="transition-all duration-1000 shadow-xl"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900 tracking-tighter">{attPct}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  {[
                    { label: 'Present', val: attDays, color: 'bg-emerald-500' },
                    { label: 'Cycle Goal', val: workingDays, color: 'bg-slate-300' },
                  ].map((s, i) => (
                    <div key={i}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-6 rounded-full ${s.color}`} />
                        <span className="text-lg font-black text-slate-900 tracking-tighter">{s.val} Units</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Score Evolution Trend */}
            <div className="premium-card p-8 group">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 group-hover:scale-110 transition-transform">
                  <BarChart3 size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Score Evolution</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Historical tracking</p>
                </div>
              </div>
              <div className="flex items-end justify-between h-32 gap-3">
                {performance.length === 0 ? (
                  <div className="w-full flex flex-col items-center justify-center text-slate-300 italic py-10 opacity-50">
                    <Activity size={24} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-widest mt-2">No historical data found</p>
                  </div>
                ) : (
                  [...performance].slice(0, 5).reverse().map((p, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                      <div className="w-full bg-slate-50 rounded-xl relative h-24 flex items-end border border-slate-100 shadow-inner overflow-hidden">
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 transition-all duration-1000 group-hover/bar:scale-x-110" 
                          style={{ height: `${p.performancePercentage}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {new Date(p.month + '-01').toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Detailed Context Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center gap-3 mb-2 px-2">
                <BrainCircuit size={18} className="text-indigo-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Intelligence Feed</h3>
              </div>
              <div className="space-y-4">
                {getInsights().map((item, i) => (
                  <div key={i} className="premium-card p-6 flex gap-5 hover:-translate-y-1 transition-all">
                    <div className={`p-3.5 rounded-2xl ${item.bg} ${item.color} h-fit shadow-sm`}>
                      <item.icon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{item.desc}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <Layout size={18} className="text-blue-600" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Operational Log</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Active Registry: <span className="text-slate-900">{tasks.length}</span>
                </div>
              </div>
              <div className="premium-card overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Objective</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Induction</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tasks.slice(0, 8).map((task) => {
                      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
                      return (
                        <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-1.5 h-6 rounded-full ${task.status === 'Done' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'}`} />
                              <span className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{task.title}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.dueDate || 'PENDING'}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                              task.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              isOverdue ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {task.status}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
