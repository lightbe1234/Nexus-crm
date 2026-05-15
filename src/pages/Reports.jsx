import React, { useState, useEffect } from 'react';
import { getInvoices, getProjects, getClients } from '../services/db';
import { useSettings } from '../contexts/SettingsContext';
import { 
  TrendingUp, DollarSign, Briefcase, Users, 
  ArrowUpRight, ArrowDownRight, Calendar,
  BarChart3, PieChart, Download, Filter,
  ChevronRight, Target, Zap, Globe, Layers,
  Sparkles, Activity, ShieldCheck, Box,
  ArrowRight, Search, RefreshCw
} from 'lucide-react';

export default function Reports() {
  const { settings } = useSettings();
  const sym = settings?.financial?.currencySymbol || '$';

  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inv, proj, cl] = await Promise.all([getInvoices(), getProjects(), getClients()]);
      setInvoices(inv);
      setProjects(proj);
      setClients(cl);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const paidRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const averageDealSize = projects.length > 0 ? (totalRevenue / projects.length) : 0;

  const stats = [
    { name: 'Gross Revenue', value: `${sym}${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, trend: '+12.5%', trendUp: true, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { name: 'Realized Cash', value: `${sym}${(paidRevenue / 1000).toFixed(1)}k`, icon: TrendingUp, trend: '+8.2%', trendUp: true, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { name: 'Active Board', value: projects.length, icon: Briefcase, trend: '+2 Items', trendUp: true, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { name: 'Avg Deal Velocity', value: `${sym}${(averageDealSize / 1000).toFixed(1)}k`, icon: Target, trend: 'Optimal', trendUp: true, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  return (
    <div className="space-y-10 pb-10 animate-slide-up">
      {/* Premium Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100">
            <BarChart3 size={12} />
            <span>Fiscal Analytics</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Revenue <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligence</span></h1>
          <p className="text-slate-500 text-sm font-medium italic opacity-75">Institutional growth vectors and settlement analysis.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm">
            <Calendar size={14} /> Current Quarter
          </button>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
            <Download size={14} /> Export Insight
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-50 rounded-[2rem]" />)}
        </div>
      ) : (
        <>
          {/* KPI Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="premium-card p-6 group flex items-center gap-5 relative overflow-hidden transition-all hover:-translate-y-1">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} ${stat.border} border shadow-sm transition-transform group-hover:scale-110`}>
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.name}</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</h3>
                    <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stat.trendUp ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                      {stat.trend}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Yield Trajectory Chart */}
            <div className="lg:col-span-8 premium-card p-10 group relative overflow-hidden">
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-1">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Yield Trajectory</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Month-over-month capital accumulation</p>
                </div>
                <div className="flex gap-4">
                  {[
                    { label: 'Actuals', color: 'bg-blue-600' },
                    { label: 'Forecast', color: 'bg-slate-200' },
                  ].map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${l.color} shadow-sm`} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="h-80 w-full flex items-end gap-4 relative">
                <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-20">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-[1px] bg-slate-300 border-dashed" />)}
                </div>
                {[45, 60, 55, 80, 70, 95, 85, 100, 110, 90, 120, 130].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar relative z-10">
                    <div className="w-full relative h-full flex items-end justify-center">
                      {/* Projection Bar */}
                      <div className="absolute bottom-0 w-full bg-slate-50 rounded-xl group-hover/bar:bg-slate-100 transition-colors border border-slate-100" style={{ height: `${h * 0.7}%` }} />
                      {/* Actual Bar */}
                      <div className="absolute bottom-0 w-3/4 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-xl transition-all duration-700 shadow-[0_0_15px_rgba(59,130,246,0.3)]" style={{ height: `${h * 0.4}%` }} />
                      
                      {/* Hover Tooltip */}
                      <div className="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest pointer-events-none">
                        {sym}{(h * 2.5).toFixed(1)}k
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Distribution */}
            <div className="lg:col-span-4 bg-slate-900 rounded-[2.5rem] p-10 flex flex-col shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl transition-transform group-hover:scale-110 duration-1000" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl" />
              
              <div className="flex items-center gap-4 mb-12 relative z-10">
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <PieChart size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Stakeholder Tiering</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic mt-1">Portfolio segmentation</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-10 relative z-10">
                {[
                  { label: 'Strategic Accounts', count: 4, percentage: 65, color: 'bg-blue-500', shadow: 'shadow-blue-500/40' },
                  { label: 'Growth Mid-Tier', count: 8, percentage: 25, color: 'bg-indigo-500', shadow: 'shadow-indigo-500/40' },
                  { label: 'Institutional Leads', count: 12, percentage: 10, color: 'bg-slate-700', shadow: 'shadow-slate-700/40' },
                ].map((tier, i) => (
                  <div key={i} className="space-y-3 group/tier">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/tier:text-white transition-colors">{tier.label}</span>
                      <span className="text-xs font-black text-white bg-white/5 px-3 py-1 rounded-lg border border-white/5">{tier.count} ORG</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-px">
                      <div className={`h-full ${tier.color} ${tier.shadow} rounded-full transition-all duration-1000 shadow-[0_0_10px]`} style={{ width: `${tier.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-blue-600 rounded-[2rem] relative overflow-hidden group/card shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover/card:scale-110 transition-transform" />
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Projected Net Yield</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-white tracking-tighter leading-none">+{sym}140.2k</h3>
                  <div className="p-3 bg-white/10 rounded-xl text-white">
                    <TrendingUp size={20} strokeWidth={3} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-blue-200 uppercase tracking-widest">
                  <Activity size={10} /> 24% MOM MOMENTUM
                </div>
              </div>
            </div>
          </div>
          
          {/* Transactional Intelligence Ledger */}
          <div className="premium-card overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white">
              <div className="space-y-1">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transactional Intelligence</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Auditing fiscal disbursements and settlements</p>
              </div>
              <button className="flex items-center gap-3 px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100 group">
                Full Financial Ledger <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Initiative</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Settlement Quantum</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategic State</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.slice(0, 6).map((inv, idx) => (
                    <tr key={inv.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-slate-900/20 group-hover:scale-110 transition-transform">
                            {inv.client?.[0] || 'S'}
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{inv.client || 'Institutional Partner'}</span>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">INV-{inv.id?.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-5 text-right">
                        <p className="text-sm font-black text-slate-900 tracking-tight">
                          {sym}{(inv.amount || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-10 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          inv.status === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                          {inv.status === 'Paid' ? 'Finalized' : 'In Transit'}
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} strokeWidth={3} className="text-blue-500" />
                          {inv.date || '—'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
