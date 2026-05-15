import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToAllAttendance, subscribeToAllPerformance, deleteAttendanceRecord, deletePerformanceRecord, updateAttendanceRecord } from '../../services/employeePortal';
import { subscribeToEmployees } from '../../services/db';
import {
  Users, UserCheck, UserX, Clock, TrendingUp,
  Calendar, BarChart3, Award, Search, ChevronRight,
  ShieldCheck, Trash2, Edit2, X, CheckCircle2,
  Activity, Target, Layout, Filter, ArrowUpRight,
  MoreVertical, AlertCircle, RefreshCw, Zap,
  Sparkles, Shield, Box, Layers, Globe2, ChevronDown,
  LayoutGrid, Kanban, ListFilter
} from 'lucide-react';

const getPerfColor = (pct) => {
  if (pct >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', badge: 'bg-emerald-50 border-emerald-100 text-emerald-600', label: 'Exceptional' };
  if (pct >= 60) return { text: 'text-blue-600', bg: 'bg-blue-500', badge: 'bg-blue-50 border-blue-100 text-blue-600', label: 'Operational' };
  if (pct >= 40) return { text: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-50 border-amber-100 text-amber-600', label: 'Maintenance' };
  return { text: 'text-rose-600', bg: 'bg-rose-500', badge: 'bg-rose-50 border-rose-100 text-rose-600', label: 'Critical' };
};

export default function HROverview() {
  const { userRole } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [allPerformance, setAllPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmDelete, setConfirmDelete] = useState(null); 
  const [editAtt, setEditAtt] = useState(null); 
  const [attEditForm, setAttEditForm] = useState({});

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    setLoading(true);
    const unsubEmps = subscribeToEmployees((emps) => {
      setEmployees(emps);
      setLoading(false);
    });
    const unsubAtt = subscribeToAllAttendance(today, (att) => setTodayAttendance(att));
    const unsubPerf = subscribeToAllPerformance((perf) => setAllPerformance(perf));

    return () => { unsubEmps(); unsubAtt(); unsubPerf(); };
  }, [today]);

  const totalEmployees = employees.filter(e => e.status === 'Active').length;
  const presentToday = todayAttendance.filter(a => ['checked-in', 'checked-out', 'late'].includes(a.status)).length;
  const lateToday = todayAttendance.filter(a => a.status === 'late').length;
  const absentToday = Math.max(0, totalEmployees - presentToday);
  const checkedOutToday = todayAttendance.filter(a => a.status === 'checked-out').length;

  const employeeSummary = employees.filter(e => e.status === 'Active').map(emp => {
    const uid = emp.uid || emp.id;
    const todayRecord = todayAttendance.find(a => a.uid === uid);
    const perfRecord = allPerformance.find(p => p.uid === uid && p.month === currentMonth);
    return {
      ...emp, uid,
      todayStatus: todayRecord?.status || 'absent',
      checkInTime: todayRecord?.checkInTime?.slice(0, 5) || null,
      checkOutTime: todayRecord?.checkOutTime?.slice(0, 5) || null,
      totalHours: todayRecord?.totalHours || null,
      perfPct: perfRecord?.performancePercentage ?? 0,
      attPct: perfRecord?.attendancePercentage ?? 0,
      completedTasks: perfRecord?.completedTasks ?? 0,
      totalTasks: perfRecord?.totalTasks ?? 0,
    };
  });

  const filteredSummary = employeeSummary.filter(e =>
    e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase())
  );

  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
  const avgPerf = allPerformance.filter(p => p.month === currentMonth).length > 0
    ? Math.round(allPerformance.filter(p => p.month === currentMonth).reduce((a, b) => a + (b.performancePercentage || 0), 0) / allPerformance.filter(p => p.month === currentMonth).length)
    : 0;

  const attStatusConfig = {
    'checked-in':  { label: 'Active Shift', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500 animate-pulse' },
    'checked-out': { label: 'Finalized', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' },
    'late':        { label: 'Late Entry', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500' },
    'absent':      { label: 'Unchecked', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-300' },
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'attendance') await deleteAttendanceRecord(confirmDelete.id);
      else if (confirmDelete.type === 'performance') await deletePerformanceRecord(confirmDelete.id);
    } catch (err) { console.error(err); }
    setConfirmDelete(null);
  };

  const handleEditAtt = (att) => {
    setAttEditForm({ ...att });
    setEditAtt(att);
  };

  const saveEditAtt = async () => {
    if (!editAtt) return;
    try {
      await updateAttendanceRecord(editAtt.id, attEditForm);
    } catch (err) { console.error(err); }
    setEditAtt(null);
  };

  return (
    <div className="space-y-10 pb-10 animate-slide-up">
      {/* Institutional Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 w-fit px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
            <ShieldCheck size={12} className="animate-pulse" />
            <span>Personnel Intelligence Hub</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">HR <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Command</span></h1>
            <p className="text-slate-500 text-sm font-medium italic opacity-75 flex items-center gap-2 mt-2">
              <Calendar size={14} className="text-indigo-600" strokeWidth={3} />
              Operational Vector: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex flex-col text-right mr-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Density</p>
            <div className="flex items-center gap-2 text-emerald-500 justify-end">
              <TrendingUp size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-tighter">98.4% Engagement</span>
            </div>
          </div>
          <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
            <RefreshCw size={14} strokeWidth={3} /> Sync System Metrics
          </button>
        </div>
      </div>

      {/* Aggregate Matrix Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Active Personnel', value: totalEmployees, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Operational (In)', value: presentToday, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Offline (Abs)', value: absentToday, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
          { label: 'Team Efficiency', value: `${avgPerf}%`, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        ].map((kpi, i) => (
          <div key={i} className="premium-card p-8 group flex items-center gap-6 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.02] rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
            <div className={`p-5 rounded-[1.5rem] ${kpi.bg} ${kpi.color} ${kpi.border} border shadow-sm transition-all group-hover:scale-110 group-hover:shadow-lg`}>
              <kpi.icon size={24} strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{kpi.label}</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Attendance Flux */}
      <div className="premium-card p-10 group overflow-hidden relative border-slate-100/50 bg-white/50 backdrop-blur-xl transition-all hover:shadow-2xl hover:shadow-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 relative z-10">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
              Attendance Flux <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 italic">Real-time personnel distribution across sectors</p>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Execution rate</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{attendanceRate}%</p>
            </div>
            <div className="h-12 w-[1px] bg-slate-100" />
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 text-amber-500">Late Entries</p>
              <p className="text-3xl font-black text-amber-500 tracking-tighter">{lateToday}</p>
            </div>
          </div>
        </div>
        
        <div className="relative h-6 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 flex gap-1 p-1 shadow-inner">
          {totalEmployees > 0 && (
            <>
              <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out rounded-full" style={{ width: `${(checkedOutToday / totalEmployees) * 100}%` }}>
                <div className="w-full h-full bg-white/20 animate-pulse" />
              </div>
              <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-out rounded-full" style={{ width: `${((presentToday - checkedOutToday) / totalEmployees) * 100}%` }}>
                <div className="w-full h-full bg-white/20 animate-pulse" />
              </div>
              <div className="h-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-1000 ease-out rounded-full" style={{ width: `${(lateToday / totalEmployees) * 100}%` }}>
                <div className="w-full h-full bg-white/20 animate-pulse" />
              </div>
            </>
          )}
        </div>
        
        <div className="flex flex-wrap gap-10 mt-8 relative z-10">
          {[
            { label: 'Finalized', val: checkedOutToday, color: 'text-emerald-600', dot: 'bg-emerald-500' },
            { label: 'Active Session', val: presentToday - checkedOutToday, color: 'text-blue-600', dot: 'bg-blue-500' },
            { label: 'Late Entry', val: lateToday, color: 'text-amber-500', dot: 'bg-amber-400' },
            { label: 'Offline', val: absentToday, color: 'text-slate-400', dot: 'bg-slate-200' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${s.dot} shadow-lg`} />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</span>
                <span className={`text-lg font-black ${s.color} leading-none tracking-tighter`}>{s.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Interface Hub */}
      <div className="flex flex-col md:flex-row gap-6 items-center p-5 bg-white/50 backdrop-blur-xl border border-slate-200/50 rounded-[2.5rem] shadow-sm">
        <div className="flex gap-3 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/30">
          {[
            { id: 'overview', label: 'Registry', icon: LayoutGrid },
            { id: 'performance', label: 'Efficiency Rank', icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-y-[-2px]'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <tab.icon size={16} strokeWidth={2.5} className={activeTab === tab.id ? 'text-indigo-400' : ''} /> {tab.label}
            </button>
          ))}
        </div>
        <div className="relative group flex-1 w-full md:max-w-md ml-auto">
          <Search size={18} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            className="w-full bg-white border border-slate-200/50 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400"
            placeholder="QUERY PERSONNEL REGISTRY..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tab Content: Registry Overview */}
      {activeTab === 'overview' && (
        <div className="premium-card overflow-hidden animate-in slide-in-from-bottom-6 duration-700 bg-white/50 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Operative Identity</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Sector</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Session Start</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Session Close</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">State</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSummary.map((emp, idx) => {
                  const sc = attStatusConfig[emp.todayStatus] || attStatusConfig['absent'];
                  return (
                    <tr key={emp.uid || idx} className="hover:bg-slate-50/80 transition-all group animate-slide-up" style={{ animationDelay: `${idx * 0.03}s` }}>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-xl shadow-slate-900/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            {emp.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 tracking-tight uppercase group-hover:text-indigo-600 transition-colors leading-none mb-1.5">{emp.fullName}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{emp.role}</span>
                              <div className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{emp.employeeId || 'ID-TBD'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <Layers size={14} className="text-slate-300" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{emp.department || 'INTERNAL'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 tracking-widest uppercase">
                          <Clock size={12} className="text-slate-300" />
                          {emp.checkInTime || '—'}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 tracking-widest uppercase">
                          <Box size={12} className="text-slate-300" />
                          {emp.checkOutTime || '—'}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${sc.bg} ${sc.color} ${sc.border} shadow-sm group-hover:shadow-md transition-all`}>
                          <span className={`w-2 h-2 rounded-full ${sc.dot} shadow-lg`} />
                          {sc.label}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          {emp.todayStatus !== 'absent' && (
                            <>
                              <button onClick={() => { const att = todayAttendance.find(a => a.uid === emp.uid); if (att) handleEditAtt(att); }} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 rounded-xl transition-all shadow-sm">
                                <Edit2 size={16} strokeWidth={2.5} />
                              </button>
                              <button onClick={() => { const att = todayAttendance.find(a => a.uid === emp.uid); if (att) setConfirmDelete({ type: 'attendance', id: att.id, name: emp.fullName }); }} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl transition-all shadow-sm">
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Efficiency Leaderboard */}
      {activeTab === 'performance' && (
        <div className="premium-card overflow-hidden animate-in slide-in-from-bottom-6 duration-700 bg-white/50 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Tactical Rank</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Operative Identity</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Attendance Vector</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Directive Meta</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Efficiency Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSummary
                  .sort((a, b) => b.perfPct - a.perfPct)
                  .map((emp, idx) => {
                    const pc = getPerfColor(emp.perfPct);
                    return (
                      <tr key={emp.uid || idx} className="hover:bg-slate-50/80 transition-all group animate-slide-up" style={{ animationDelay: `${idx * 0.03}s` }}>
                        <td className="px-10 py-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-2xl transition-all duration-500 group-hover:scale-110 ${
                            idx === 0 ? 'bg-amber-400 text-white shadow-amber-500/30 rotate-3' :
                            idx === 1 ? 'bg-slate-300 text-white shadow-slate-400/30 -rotate-2' :
                            idx === 2 ? 'bg-orange-400 text-white shadow-orange-500/30 rotate-1' :
                            'bg-slate-50 text-slate-400 shadow-none border border-slate-100'
                          }`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                              {emp.fullName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{emp.fullName}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{emp.department} SECTOR</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="flex-1 min-w-[140px] h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                              <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000" style={{ width: `${emp.attPct}%` }}>
                                <div className="w-full h-full bg-white/20 animate-pulse" />
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-900 tracking-tighter uppercase">{emp.attPct}% Presence</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-500 transition-colors"><Box size={14} strokeWidth={2.5} /></div>
                            <span className="text-[10px] font-black text-slate-900 tracking-widest uppercase">{emp.completedTasks} / {emp.totalTasks} Done</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border ${pc.badge} shadow-sm group-hover:shadow-lg transition-all`}>
                            <Award size={14} strokeWidth={3} className="animate-bounce-slow" />
                            {emp.perfPct}% &bull; {pc.label}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Institutional Modals */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box-sm p-10 text-center">
            <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-rose-100">
              <Trash2 size={40} className="text-rose-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Terminate Record</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-12 italic px-4">
              Are you certain you wish to purge the <span className="text-rose-600 font-bold uppercase tracking-[0.1em]">{confirmDelete.type}</span> log for <span className="text-slate-900 font-black uppercase">{confirmDelete.name}</span>? This action is irreversible.
            </p>
            <div className="flex gap-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-secondary py-5">
                Cancel
              </button>
              <button onClick={confirmDeleteAction} className="flex-1 btn-primary py-5 bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-900/30 text-[10px] uppercase tracking-widest">
                Purge Record
              </button>
            </div>
          </div>
        </div>
      )}

      {editAtt && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] border border-indigo-100 shadow-sm">
                  <Edit2 size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Manual Override</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-2">Attendance log calibration protocol</p>
                </div>
              </div>
              <button onClick={() => setEditAtt(null)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-900 border border-transparent hover:border-slate-100">
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            
            <div className="modal-body p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Check-In Entry</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-xs font-black tracking-widest text-slate-900 focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-400 outline-none transition-all" value={attEditForm.checkInTime || ''} onChange={e => setAttEditForm(p => ({ ...p, checkInTime: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Check-Out Entry</label>
                  <div className="relative">
                    <Box size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 text-xs font-black tracking-widest text-slate-900 focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-400 outline-none transition-all" value={attEditForm.checkOutTime || ''} onChange={e => setAttEditForm(p => ({ ...p, checkOutTime: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">State Calibration</label>
                <div className="relative">
                  <Activity size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-12 py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-400 outline-none transition-all cursor-pointer" value={attEditForm.status || ''} onChange={e => setAttEditForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="checked-in">Operational (In)</option>
                    <option value="checked-out">Finalized (Out)</option>
                    <option value="late">Late Entry</option>
                  </select>
                  <ChevronDown size={16} strokeWidth={3} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 flex gap-6 shrink-0">
              <button onClick={() => setEditAtt(null)} className="flex-1 btn-secondary py-5">Discard Changes</button>
              <button onClick={saveEditAtt} className="flex-1 btn-primary py-5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95">
                <CheckCircle2 size={16} strokeWidth={3} /> Apply Vector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
