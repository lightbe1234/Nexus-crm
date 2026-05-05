import React, { useState, useEffect } from 'react';
import { getInvoices, getProjects, getClients } from '../services/db';
import { useSettings } from '../contexts/SettingsContext';
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  ChevronRight,
  Target,
  Zap,
  Globe,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Reports() {
  const { settings } = useSettings();
  const sym = settings.financial.currencySymbol;

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
    { name: 'Gross Revenue', value: `${sym}${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, trend: '+12.5%', trendUp: true, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { name: 'Realized Cash', value: `${sym}${(paidRevenue / 1000).toFixed(1)}k`, icon: TrendingUp, trend: '+8.2%', trendUp: true, color: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { name: 'Active Board', value: projects.length, icon: Briefcase, trend: '+2 Items', trendUp: true, color: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/20' },
    { name: 'Avg Deal Velocity', value: `${sym}${(averageDealSize / 1000).toFixed(1)}k`, icon: Target, trend: 'Optimal', trendUp: true, color: 'from-orange-600 to-rose-600', shadow: 'shadow-orange-500/20' },
  ];

  return (
    <div className="h-screen flex flex-col space-y-10 overflow-hidden pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
            <BarChart3 size={12} strokeWidth={3} />
            <span>Analytical Intelligence</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Revenue Analytics</h1>
          <p className="text-slate-500 text-sm mt-3 font-medium">Quantifying institutional growth and fiscal performance metrics.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] hover:border-blue-400 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 group">
            <Calendar size={16} className="group-hover:rotate-12 transition-transform" />
            Current Quarter
          </button>
          
          <button className="flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white rounded-[20px] hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 whitespace-nowrap">
            <Download size={18} strokeWidth={3} />
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1 space-y-10">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={stat.name} className="bg-white border border-slate-200/60 p-7 rounded-[32px] relative overflow-hidden group hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-[0.03] -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {stat.trendUp ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                  {stat.trend}
                </div>
              </div>
              
              <div className="relative z-10">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.name}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Revenue Distribution Chart */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200/60 rounded-[48px] p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">Yield Trajectory</h2>
                <p className="text-slate-400 text-xs font-medium">Visualizing year-to-date capital accumulation and project yields.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Actuals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projection</span>
                </div>
              </div>
            </div>
            
            <div className="h-80 w-full flex items-end gap-5 px-4 relative">
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-px bg-slate-50"></div>)}
              </div>
              {[45, 60, 55, 80, 70, 95, 85, 100, 110, 90, 120, 130].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative z-10">
                  <div className="w-full relative h-full flex items-end">
                    <div className="absolute bottom-0 w-full bg-slate-100 rounded-t-xl group-hover:bg-slate-200 transition-colors" style={{ height: `${h * 0.7}%` }}></div>
                    <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-xl transition-all duration-700 group-hover:bg-indigo-600 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:scale-y-105" style={{ height: `${h * 0.4}%` }}></div>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Distribution Card */}
          <div className="col-span-12 lg:col-span-4 bg-slate-900 rounded-[48px] p-10 flex flex-col shadow-xl shadow-slate-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-[80px]"></div>
            
            <div className="flex items-center gap-3 mb-10 relative z-10">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                <PieChart size={20} strokeWidth={3} />
              </div>
              <h2 className="text-xl font-black text-white tracking-tighter leading-none">Stakeholder Tiering</h2>
            </div>
            
            <div className="flex-1 space-y-10 relative z-10">
              {[
                { label: 'Strategic Accounts', count: 4, percentage: 65, color: 'bg-blue-500 shadow-blue-500/20' },
                { label: 'Growth Mid-Tier', count: 8, percentage: 25, color: 'bg-indigo-400 shadow-indigo-400/20' },
                { label: 'Institutional Leads', count: 12, percentage: 10, color: 'bg-slate-700 shadow-slate-700/20' },
              ].map((tier) => (
                <div key={tier.label} className="space-y-3 group/tier">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-black uppercase tracking-widest group-hover/tier:text-white transition-colors">{tier.label}</span>
                    <span className="font-black text-white bg-white/5 px-2.5 py-1 rounded-lg text-[10px]">{tier.count} Org.</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                    <div className={`h-full ${tier.color} rounded-full shadow-lg transition-all duration-1000 group-hover/tier:scale-x-105 origin-left`} style={{ width: `${tier.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-blue-600 rounded-[32px] shadow-2xl shadow-blue-600/20 relative overflow-hidden group/cta">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover/cta:scale-150 transition-transform duration-700"></div>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Projected Net Yield</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-white tracking-tighter">+{sym}140.2k</p>
              </div>
              <p className="text-blue-200 text-xs font-bold mt-4 flex items-center gap-2">
                <TrendingUp size={16} strokeWidth={3} />
                24% Momentum Boost
              </p>
            </div>
          </div>
        </div>
        
        {/* Ledger Insight Section */}
        <div className="bg-white border border-slate-200/60 rounded-[48px] shadow-sm overflow-hidden mb-10 group/ledger">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">Transactional Intelligence</h2>
              <p className="text-slate-400 text-xs font-medium">Auditing recent high-value fiscal disbursements and settlements.</p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
              Complete Financial Ledger
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Initiative</th>
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Settlement Quantum</th>
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategic State</th>
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-blue-50/30 transition-all group/row">
                    <td className="py-7 px-10">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-400 group-hover/row:bg-blue-600 group-hover/row:text-white transition-all duration-300">
                          {inv.client?.[0] || 'A'}
                        </div>
                        <span className="font-black text-slate-900 tracking-tight leading-none">{inv.client || 'Strategic Partner'}</span>
                      </div>
                    </td>
                    <td className="py-7 px-10 text-right">
                      <p className="font-black text-slate-900 tracking-tighter text-xl leading-none">
                        {sym}{(inv.amount || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="py-7 px-10">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border ${
                        inv.status === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                          : 'bg-amber-50 text-amber-600 border-amber-100/50'
                      }`}>
                        {inv.status === 'Paid' ? 'Finalized' : 'In Transit'}
                      </span>
                    </td>
                    <td className="py-7 px-10">
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <Calendar size={14} className="text-slate-300" strokeWidth={2.5} />
                        <span className="text-xs font-black tracking-tight">{inv.date || '—'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
