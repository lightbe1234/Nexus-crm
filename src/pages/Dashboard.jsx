import React, { useState, useEffect } from 'react';
import { getProjects, getClients, getActivities } from '../services/db';
import { seedDatabase } from '../utils/seedData';
import { useSettings } from '../contexts/SettingsContext';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Target, 
  ArrowUpRight, 
  Download, 
  Calendar,
  Database,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  Zap,
  Layers,
  Sparkles,
  Search
} from 'lucide-react';

export default function Dashboard() {
  const { settings } = useSettings();
  const [stats, setStats] = useState({ revenue: '124,500', activeProjects: 0, clients: 0, leads: 84, margin: '32.4%' });
  const [pipeline, setPipeline] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, clientsData, activitiesData] = await Promise.all([
          getProjects(),
          getClients(),
          getActivities()
        ]);
        
        setStats(prev => ({
          ...prev,
          activeProjects: projectsData.filter(p => p.status !== 'Completed').length,
          clients: clientsData.length,
        }));

        setPipeline(projectsData.filter(p => p.status !== 'Completed').slice(0, 5));
        setActivities(activitiesData.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSeed = async () => {
    setLoading(true);
    const success = await seedDatabase();
    if (success) {
      alert("Database seeded successfully! Please refresh the page.");
      window.location.reload();
    } else {
      alert("Failed to seed database.");
      setLoading(false);
    }
  };

  const kpis = [
    { label: 'Annual Revenue', value: stats.revenue, icon: TrendingUp, trend: '+14.2%', color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { label: 'Active Projects', value: stats.activeProjects, icon: Briefcase, trend: `${stats.clients} Clients`, color: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/20' },
    { label: 'Total Clients', value: stats.clients, icon: Users, trend: '+5 New', color: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { label: 'Profit Margin', value: stats.margin, icon: Target, trend: 'Healthy', color: 'from-orange-600 to-rose-600', shadow: 'shadow-orange-500/20' }
  ];

  return (
    <div className="space-y-10 animate-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
            <Sparkles size={12} strokeWidth={3} />
            <span>Executive Overview</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{settings.company.name}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-3 font-medium max-w-lg">
            Here's what's happening with your agency today. All metrics are synced with real-time project data.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleSeed} 
            disabled={loading} 
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:text-amber-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm disabled:opacity-50 group"
          >
            <Database size={16} className="group-hover:rotate-12 transition-transform" />
            {loading ? "Syncing..." : "Seed Data"}
          </button>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95">
            <Download size={16} />
            Export Insights
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200/60 p-7 rounded-[32px] relative overflow-hidden group hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 active:scale-95">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.color} opacity-[0.03] -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${kpi.color} text-white shadow-lg ${kpi.shadow} group-hover:scale-110 transition-transform duration-500`}>
                <kpi.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">Growth</span>
                <div className="flex items-center gap-1 text-emerald-500">
                  <ArrowUpRight size={14} strokeWidth={3} />
                  <span className="text-xs font-black tracking-tight">{kpi.trend}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                {idx === 0 ? settings.financial.currencySymbol : ''}{kpi.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics and Feed Section */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Chart Area */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200/60 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">Revenue Trajectory</h2>
              <p className="text-slate-400 text-xs font-medium">Visualizing monthly earnings and projected growth.</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer hover:bg-slate-100 transition-all">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annually</option>
              </select>
            </div>
          </div>
          
          <div className="h-80 w-full relative group px-2">
            {/* Chart Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-2">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-full h-px bg-slate-50"></div>)}
            </div>
            
            {/* SVG Chart */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="chart-gradient" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="chart-area-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path 
                d="M0,85 C10,80 20,40 30,65 C40,25 50,55 60,15 C70,25 80,5 90,12 L100,2" 
                fill="none" 
                stroke="url(#chart-gradient)" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                filter="url(#glow)"
                className="animate-pulse"
              />
              <path 
                d="M0,85 C10,80 20,40 30,65 C40,25 50,55 60,15 C70,25 80,5 90,12 L100,2 L100,100 L0,100 Z" 
                fill="url(#chart-area-gradient)" 
              />
              
              {/* Dynamic Points */}
              <circle cx="30" cy="65" r="3" fill="#2563eb" className="animate-bounce" />
              <circle cx="60" cy="15" r="3" fill="#4f46e5" className="animate-ping" />
              <circle cx="100" cy="2" r="3" fill="#6366f1" />
            </svg>
          </div>
          
          <div className="flex justify-between mt-8 px-4">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map(m => (
              <span key={m} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{m}</span>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="col-span-12 lg:col-span-4 bg-slate-900 rounded-[40px] p-10 flex flex-col shadow-xl shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full translate-x-1/3 translate-y-1/3 blur-[80px]"></div>
          
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h2 className="text-xl font-black text-white tracking-tighter leading-none mb-1">Live Intelligence</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Real-time system updates</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          </div>
          
          <div className="flex-1 space-y-8 relative z-10">
            {activities.length > 0 ? activities.map((act, idx) => (
              <div key={idx} className="flex gap-5 group cursor-pointer">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 border ${
                    act.type === 'Finance' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' 
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white'
                  }`}>
                    {act.type === 'Finance' ? <TrendingUp size={20} strokeWidth={2.5} /> : <Zap size={20} strokeWidth={2.5} />}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors leading-relaxed">
                    {act.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={12} className="text-slate-600" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      {act.type} · Just now
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600 mb-4 animate-pulse">
                  <Layers size={32} />
                </div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Awaiting Network Events...</p>
              </div>
            )}
          </div>
          
          <button className="mt-10 w-full py-4 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all relative z-10 border border-slate-700/50">
            View Analytics History
          </button>
        </div>

        {/* Pipeline Table Section */}
        <div className="col-span-12 bg-white border border-slate-200/60 rounded-[40px] shadow-sm overflow-hidden group/pipeline">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/20">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">Operational Pipeline</h2>
              <p className="text-slate-400 text-xs font-medium">Tracking high-priority project execution and milestone delivery.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  className="bg-white text-xs font-bold border border-slate-200 rounded-2xl pl-10 pr-6 py-3 w-full md:w-80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all shadow-sm" 
                  placeholder="Filter pipeline by project or status..." 
                  type="text"
                />
              </div>
            </div>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Initiative</th>
                  <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Tier</th>
                  <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution Phase</th>
                  <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Budget Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pipeline.length > 0 ? pipeline.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-400 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight leading-tight mb-1">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            ID-{p.id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/50 uppercase tracking-widest">{p.type}</span>
                    </td>
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progress || 35}%` }}></div>
                        </div>
                        <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100/50">
                          {p.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-10 text-right">
                      <p className="font-black text-slate-900 tracking-tight text-lg leading-none">
                        {settings.financial.currencySymbol}{(p.budget || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1.5">Approved</p>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                        <Database size={48} className="mb-4" />
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Pipeline Registry Empty</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center">
            <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
              Load More Projects
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
