import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getTodayAttendance,
  subscribeToMyAttendance,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
} from '../../services/employeePortal';
import {
  Calendar, Clock, MapPin, CheckCircle2, AlertCircle, 
  Filter, UserCheck, LogIn, LogOut, Home, Coffee, Play, 
  Zap, ArrowRight, X, ClipboardList, Info, Globe
} from 'lucide-react';

const statusConfig = {
  'checked-in': { label: 'Active Session', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
  'checked-out': { label: 'Session Terminated', color: 'text-slate-500', bg: 'bg-slate-50', dot: 'bg-slate-400', shadow: 'shadow-slate-500/10' },
  'on-break': { label: 'Operational Pause', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
  'late': { label: 'Delayed Induction', color: 'text-rose-600', bg: 'bg-rose-50', dot: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
  'absent': { label: 'Non-Attendance', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500', shadow: 'shadow-red-500/20' },
};

export default function MyAttendance() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  
  const [todayAtt, setTodayAtt] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [runningTimer, setRunningTimer] = useState('00:00:00');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  
  const [checkInData, setCheckInData] = useState({
    location: 'Office',
    shift: 'Morning',
    notes: ''
  });

  const loadToday = useCallback(async () => {
    if (!uid) return;
    try {
      const today = await getTodayAttendance(uid);
      setTodayAtt(today);
    } catch (err) { console.error(err); }
  }, [uid]);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    setLoading(true);
    loadToday().finally(() => setLoading(false));

    const unsubAttendance = subscribeToMyAttendance(uid, (newAttendance) => {
      setHistory(newAttendance);
      const todayDate = new Date().toISOString().split('T')[0];
      const todayRecord = newAttendance.find(a => a.date === todayDate);
      setTodayAtt(todayRecord || null);
    });
    return () => unsubAttendance();
  }, [uid, loadToday]);

  useEffect(() => {
    let interval;
    if (todayAtt && (todayAtt.status === 'checked-in' || todayAtt.status === 'late') && todayAtt.checkInTime) {
      const start = new Date();
      const [h, m] = todayAtt.checkInTime.split(':');
      start.setHours(parseInt(h), parseInt(m), 0);
      const breakSeconds = (todayAtt.totalBreakMinutes || 0) * 60;

      interval = setInterval(() => {
        const now = new Date();
        const diff = now - start;
        const totalWorkedMs = Math.max(0, diff - (breakSeconds * 1000));
        const hh = Math.floor(totalWorkedMs / 3600000);
        const mm = Math.floor((totalWorkedMs % 3600000) / 60000);
        const ss = Math.floor((totalWorkedMs % 60000) / 1000);
        setRunningTimer(`${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`);
      }, 1000);
    } else if (todayAtt && todayAtt.status === 'on-break') {
      setRunningTimer('Paused');
    }
    return () => clearInterval(interval);
  }, [todayAtt]);

  const handleCheckIn = async () => {
    if (!uid || actionLoading) return;
    setActionLoading(true);
    try {
      const employeeData = { fullName: currentUser.displayName || currentUser.email || 'Employee', email: currentUser.email };
      await checkIn(uid, employeeData, checkInData.location, checkInData.shift);
      setShowCheckInModal(false);
    } catch (err) { alert(`Induction failed: ${err.message}`); }
    finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    if (!uid || !todayAtt || actionLoading) return;
    if (todayAtt.status === 'on-break') { alert("Please terminate the operational pause before session termination."); return; }
    
    const confirmMsg = "Terminate current session? All metrics will be finalized for the day.";
    if (!window.confirm(confirmMsg)) return;
    
    setActionLoading(true);
    try { await checkOut(todayAtt.id, todayAtt.checkInTime, todayAtt.totalBreakMinutes || 0); }
    catch (err) { alert(err.message || 'Termination failed'); }
    setActionLoading(false);
  };

  const handleStartBreak = async () => {
    if (!uid || !todayAtt || actionLoading) return;
    setActionLoading(true);
    try { await startBreak(todayAtt.id); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  const handleEndBreak = async () => {
    if (!uid || !todayAtt || actionLoading) return;
    setActionLoading(true);
    try { await endBreak(todayAtt.id, todayAtt.breakStartTime, todayAtt.totalBreakMinutes || 0); }
    catch (err) { alert(err.message); }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-6 animate-pulse p-4">
        <div className="h-20 bg-white rounded-2xl border border-slate-100 shadow-sm" />
        <div className="h-40 bg-slate-900 rounded-3xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 shadow-sm" />)}
        </div>
      </div>
    );
  }

  const filteredHistory = history.filter(h => !dateFilter || h.date === dateFilter);
  const presentDays = history.filter(h => ['checked-in', 'checked-out', 'late'].includes(h.status)).length;
  const lateDays = history.filter(h => h.status === 'late').length;
  const totalDays = history.length;
  const avgHours = history.reduce((acc, curr) => acc + (parseFloat(curr.totalHours) || 0), 0) / (presentDays || 1);

  return (
    <div className="space-y-8 pb-10 animate-slide-up">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100">
            <UserCheck size={12} />
            <span>Talent Presence Hub</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Induction <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">& Attendance</span></h1>
          <p className="text-slate-500 text-sm font-medium">Manage your institutional induction cycle and operational hours.</p>
        </div>
        
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-300 transition-colors">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl transition-transform group-hover:scale-110">
            <Calendar size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Metric Date</p>
            <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Control Panel (Status Card) */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] blur-2xl opacity-[0.05] group-hover:opacity-[0.1] transition-opacity"></div>
        <div className="relative bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-800 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Status Registry</p>
              
              {todayAtt ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center lg:items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${statusConfig[todayAtt.status]?.dot} ${todayAtt.status === 'checked-in' || todayAtt.status === 'late' ? 'animate-pulse' : ''} shadow-[0_0_12px_rgba(16,185,129,0.5)]`} />
                      <span className={`text-2xl font-black tracking-tight ${statusConfig[todayAtt.status]?.color}`}>
                        {statusConfig[todayAtt.status]?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                      <span className="flex items-center gap-2"><LogIn size={14} className="text-slate-500" /> Induction: {todayAtt.checkInTime?.slice(0,5) || '--:--'}</span>
                      {todayAtt.checkOutTime ? (
                        <span className="flex items-center gap-2"><LogOut size={14} className="text-slate-500" /> Termination: {todayAtt.checkOutTime.slice(0,5)}</span>
                      ) : (
                        <span className="flex items-center gap-2 text-blue-400 bg-blue-400/5 px-2 py-1 rounded-lg border border-blue-400/10">
                          <Clock size={14} /> {runningTimer}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {todayAtt.totalHours && (
                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                      <Zap size={16} className="text-amber-400" />
                      <span className="text-sm font-black text-white">{todayAtt.totalHours} Operational Hours Finalized</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-4xl font-black text-slate-500 tracking-tighter italic opacity-40">System Idle</p>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Awaiting daily talent induction</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 flex-wrap justify-center lg:justify-end">
              {!todayAtt ? (
                <button
                  onClick={() => setShowCheckInModal(true)}
                  disabled={actionLoading}
                  className="group relative flex items-center gap-4 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <LogIn size={20} strokeWidth={3} />
                  {actionLoading ? 'Inducting...' : 'Initiate Session'}
                </button>
              ) : todayAtt.status !== 'checked-out' ? (
                <>
                  {todayAtt.status === 'on-break' ? (
                    <button
                      onClick={handleEndBreak}
                      disabled={actionLoading}
                      className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                    >
                      <Play size={18} strokeWidth={3} />
                      {actionLoading ? 'Processing...' : 'Resume Operations'}
                    </button>
                  ) : (
                    <button
                      onClick={handleStartBreak}
                      disabled={actionLoading}
                      className="flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-900/20 active:scale-95"
                    >
                      <Coffee size={18} strokeWidth={3} />
                      {actionLoading ? 'Processing...' : 'Operational Pause'}
                    </button>
                  )}
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-white/5 active:scale-95 border border-white/20"
                  >
                    <LogOut size={18} strokeWidth={3} />
                    {actionLoading ? 'Terminating...' : 'Session Termination'}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4 px-10 py-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-900/10">
                  <div className="p-2 bg-emerald-500 rounded-full text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 size={20} strokeWidth={3} />
                  </div>
                  Daily Cycle Finalized
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Cumulative Registry', value: totalDays, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Induction Presence', value: presentDays, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Delayed Induction', value: lateDays, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
          { label: 'Mean Op Hours', value: `${avgHours.toFixed(1)}h`, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-6 group relative overflow-hidden">
            <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} ${stat.border} border shadow-sm mb-4 transition-transform group-hover:scale-110 w-fit`}>
              <stat.icon size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Induction Logs Table */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClipboardList size={20} className="text-slate-400" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Institutional logs</h2>
          </div>
          
          <div className="flex items-center gap-3 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="pl-3 text-slate-400"><Filter size={14} /></div>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-transparent text-xs font-black text-slate-700 uppercase tracking-widest outline-none cursor-pointer"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"><X size={14} className="text-slate-400" /></button>
            )}
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Induction Time</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Termination</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Op Hours</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status registry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredHistory.map((h, i) => (
                  <tr key={h.id} className="hover:bg-blue-50/20 transition-all group animate-slide-right" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <p className="text-sm font-bold text-slate-900 tracking-tight">
                          {new Date(h.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-bold">{h.checkInTime || '--:--'}</td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-bold">{h.checkOutTime || '--:--'}</td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-100/50 px-3 py-1.5 rounded-xl">
                        {h.totalHours ? `${h.totalHours}H` : '--'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusConfig[h.status]?.bg} ${statusConfig[h.status]?.color} ${statusConfig[h.status]?.bg.replace('bg-', 'border-').replace('-50', '-100/50')}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[h.status]?.dot}`} />
                        {statusConfig[h.status]?.label}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <Calendar size={32} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Registry analysis: empty</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">Institutional induction logs are currently unpopulated.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Induction Modal - Premium Centered */}
      {showCheckInModal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center relative shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 text-blue-600">
                  <Zap size={20} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational induction</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Initiate Session</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Configure institutional parameters for today's deployment.</p>
              </div>
              <button onClick={() => setShowCheckInModal(false)} className="relative z-10 p-3 hover:bg-white rounded-2xl transition-colors border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            <div className="modal-body p-8 space-y-8">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  <MapPin size={12} className="text-blue-500" />
                  Deployment Environment
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'Office', icon: Home, desc: 'Institutional HQ' },
                    { id: 'Remote', icon: Globe, desc: 'External Sync' }
                  ].map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => setCheckInData({ ...checkInData, location: loc.id })}
                      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all group ${
                        checkInData.location === loc.id 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-900/5' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <loc.icon size={24} strokeWidth={2.5} className={`${checkInData.location === loc.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                      <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-widest">{loc.id}</p>
                        <p className="text-[10px] opacity-70 font-bold mt-0.5">{loc.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  <Clock size={12} className="text-blue-500" />
                  Operational tier (Shift)
                </label>
                <div className="relative">
                  <select 
                    className="erp-select pr-10 italic"
                    value={checkInData.shift}
                    onChange={e => setCheckInData({ ...checkInData, shift: e.target.value })}
                  >
                    <option value="Morning">Morning Stratum (09:00 - 18:00)</option>
                    <option value="Afternoon">Afternoon Stratum (13:00 - 21:00)</option>
                    <option value="Night">Nocturnal Stratum (21:00 - 06:00)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ArrowRight size={16} strokeWidth={3} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  <Info size={12} className="text-blue-500" />
                  Induction notes
                </label>
                <textarea
                  className="erp-input h-28 resize-none py-4"
                  placeholder="Define institutional objectives for this session..."
                  value={checkInData.notes}
                  onChange={e => setCheckInData({ ...checkInData, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
              <button
                onClick={() => setShowCheckInModal(false)}
                className="flex-1 btn-secondary py-4"
              >
                Discard
              </button>
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="flex-[2] btn-primary py-4 text-sm font-black uppercase tracking-[0.15em] bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {actionLoading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm induction
                    <ArrowRight size={18} strokeWidth={3} />
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
