import React, { useState, useEffect } from 'react';
import { 
  subscribeToProjects, 
  subscribeToClients, 
  subscribeToInvoices,
  subscribeToActivities,
  deleteProject,
  deleteClient,
  deleteInvoice 
} from '../services/db';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, Users, Briefcase, Target, ArrowUpRight, 
  Download, Calendar, Database, ChevronRight, 
  CheckCircle2, Clock, Zap, Sparkles, Search, Trash2,
  Filter, MoreHorizontal, Activity, ArrowRight,
  ShieldCheck, Globe, Layers, Box, DollarSign
} from 'lucide-react';
import ActivityFeed from '../components/ActivityFeed';

export default function Dashboard() {
  const { settings } = useSettings();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Admin';
  const sym = settings?.financial?.currencySymbol || '$';
  
  const [stats, setStats] = useState({ 
    revenue: 124500, 
    activeProjects: 0, 
    clients: 0, 
    leads: 84, 
    margin: 32.4 
  });
  
  const [pipeline, setPipeline] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [registryTab, setRegistryTab] = useState('projects'); // projects, clients, invoices

  useEffect(() => {
    setLoading(true);
    const unsubProjects = subscribeToProjects((projectsData) => {
      setStats(prev => ({
        ...prev,
        activeProjects: projectsData.filter(p => p.status !== 'Completed').length,
      }));
      setPipeline(projectsData);
      setLoading(false);
    });

    const unsubClients = subscribeToClients((clientsData) => {
      setStats(prev => ({ ...prev, clients: clientsData.length }));
      setClients(clientsData);
    });

    const unsubInvoices = subscribeToInvoices((invoicesData) => {
      setInvoices(invoicesData);
    });

    return () => { unsubProjects(); unsubClients(); unsubInvoices(); };
  }, []);

  const getClientName = (id) => clients.find(c => c.id === id)?.name || 'Unknown Client';

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'project') await deleteProject(confirmDelete.id);
      if (confirmDelete.type === 'client') await deleteClient(confirmDelete.id);
      if (confirmDelete.type === 'invoice') await deleteInvoice(confirmDelete.id);
      setConfirmDelete(null);
    } catch (err) { console.error(err); }
  };

  const kpis = [
    { label: 'Annual Yield', value: stats.revenue, prefix: sym, suffix: '', icon: TrendingUp, trend: '+14.2%', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Active Pipeline', value: stats.activeProjects, prefix: '', suffix: '', icon: Briefcase, trend: `${stats.clients} Entities`, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Stakeholders', value: stats.clients, prefix: '', suffix: '', icon: Users, trend: '+5 New', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Profit Momentum', value: stats.margin, prefix: '', suffix: '%', icon: Target, trend: 'Optimal', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
  ];

  return (
    <div className="space-y-10 animate-slide-up pb-10">
      {/* Executive Command Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 w-fit px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
            <Sparkles size={12} className="animate-pulse" />
            <span>Executive Command Center</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
              Agency <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligence</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium italic opacity-75">
              Institutional synchronization with {settings?.company?.name || 'Stitch ERP'} operational data.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex flex-col items-end mr-6 border-r border-slate-100 pr-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Status</span>
            <span className="text-xs font-black text-emerald-600 flex items-center gap-2 uppercase tracking-tighter mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Fully Synchronized
            </span>
          </div>
          <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm">
            <Calendar size={14} /> Schedule
          </button>
          <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
            <Download size={14} /> Export Insight
          </button>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="premium-card p-8 group relative overflow-hidden transition-all hover:-translate-y-2">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.bg.replace('bg-', 'from-')} to-transparent opacity-10 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150`} />
            
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color} ${kpi.border} border shadow-sm transition-transform group-hover:scale-110`}>
                <kpi.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">
                <ArrowUpRight size={12} strokeWidth={3} />
                {kpi.trend}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                {kpi.prefix}{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}{kpi.suffix}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Analytics Hub */}
      <div className="grid grid-cols-12 gap-8">
        {/* Revenue Performance Architecture */}
        <div className="col-span-12 lg:col-span-8 premium-card p-10 flex flex-col group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.02] rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          
          <div className="flex justify-between items-start mb-12">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Yield Projection Architecture</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Strategic fiscal disbursement modeling</p>
            </div>
            <div className="flex bg-slate-50 p-1.5 rounded-[1rem] border border-slate-100 shadow-inner">
              {['7D', '1M', '3M', '1Y'].map(t => (
                <button key={t} className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${t === '1M' ? 'bg-white text-blue-600 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          {/* Enhanced SVG Data Visualization */}
          <div className="flex-1 h-80 w-full relative mb-8">
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-20">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-[1px] bg-slate-300 border-dashed" />)}
            </div>
            
            <svg className="absolute inset-0 w-full h-full drop-shadow-[0_10px_15px_rgba(37,99,235,0.1)]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="yield-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d="M0,80 C10,78 20,60 30,65 C40,70 50,40 60,45 C70,50 80,20 90,25 C95,20 100,5 100,5 L100,100 L0,100 Z" 
                fill="url(#yield-gradient)" 
                className="animate-in fade-in duration-1000"
              />
              <path 
                d="M0,80 C10,78 20,60 30,65 C40,70 50,40 60,45 C70,50 80,20 90,25 C95,20 100,5 100,5" 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="4" 
                strokeLinecap="round"
                className="animate-slide-up duration-1000"
              />
              {[30, 60, 90].map((x, i) => (
                <g key={i} className="animate-pulse">
                  <circle cx={x} cy={x === 30 ? 65 : x === 60 ? 45 : 25} r="5" fill="white" stroke="#2563eb" strokeWidth="2.5" />
                  <circle cx={x} cy={x === 30 ? 65 : x === 60 ? 45 : 25} r="2" fill="#2563eb" />
                </g>
              ))}
            </svg>
          </div>
          
          <div className="flex justify-between items-center px-6 pt-6 border-t border-slate-50">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map(m => (
              <span key={m} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m}</span>
            ))}
          </div>
        </div>

        {/* Real-time Activity Hub */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="flex-1 bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/40 relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl transition-transform group-hover:scale-110 duration-1000" />
            <ActivityFeed isAdmin={isAdmin} isDark={true} />
          </div>
        </div>

        {/* Institutional Project Registry */}
        <div className="col-span-12 premium-card overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 bg-white">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Institutional Registry</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Operational initiative tracking and lifecycle management</p>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-inner w-fit">
                {[
                  { id: 'projects', label: 'Initiatives', icon: Box },
                  { id: 'clients', label: 'Partners', icon: Users },
                  { id: 'invoices', label: 'Fiscal Assets', icon: DollarSign }
                ].map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setRegistryTab(t.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${registryTab === t.id ? 'bg-white text-blue-600 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <t.icon size={12} strokeWidth={3} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative group flex-1 md:w-96">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400" 
                  placeholder={`QUERY ${registryTab.toUpperCase()}...`} 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {registryTab === 'projects' ? 'Initiative Phase' : registryTab === 'clients' ? 'Institutional Identity' : 'Fiscal Document'}
                  </th>
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {registryTab === 'projects' ? 'Deployment Tier' : registryTab === 'clients' ? 'Market Sector' : 'Reference'}
                  </th>
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {registryTab === 'projects' ? 'Weight' : registryTab === 'clients' ? 'Status' : 'State'}
                  </th>
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                    {registryTab === 'projects' ? 'Fiscal Value' : registryTab === 'clients' ? 'Annual Yield' : 'Balance Due'}
                  </th>
                  {isAdmin && <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Control</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {(registryTab === 'projects' ? pipeline : registryTab === 'clients' ? clients : invoices)
                  .filter(item => {
                    const search = searchQuery.toLowerCase();
                    if (registryTab === 'projects') return item.name?.toLowerCase().includes(search);
                    if (registryTab === 'clients') return item.name?.toLowerCase().includes(search) || item.industry?.toLowerCase().includes(search);
                    if (registryTab === 'invoices') {
                      const cName = getClientName(item.clientId);
                      return cName.toLowerCase().includes(search) || item.id?.toLowerCase().includes(search);
                    }
                    return true;
                  })
                  .slice(0, 10).map((item, i) => {
                    const itemName = registryTab === 'invoices' ? getClientName(item.clientId) : item.name;
                    const itemSub = registryTab === 'invoices' 
                      ? `INV-${new Date(item.date).getFullYear()}-${item.id.slice(-4).toUpperCase()}` 
                      : `ID-${item.id.slice(-6).toUpperCase()}`;

                    return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all group animate-slide-right" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl ${registryTab === 'invoices' ? 'bg-indigo-600' : 'bg-slate-900'} text-white flex items-center justify-center font-black text-xl shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform`}>
                          {itemName?.[0]?.toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase text-xs">
                            {itemName}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-lg leading-none tracking-[0.2em]">
                              {itemSub}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <span className={`inline-flex px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border shadow-sm ${
                        registryTab === 'projects' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        registryTab === 'clients' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {registryTab === 'projects' ? item.type : registryTab === 'clients' ? item.industry : item.projectName}
                      </span>
                    </td>
                    <td className="py-6 px-10">
                      {registryTab === 'projects' ? (
                        <div className="space-y-3 max-w-[180px]">
                          <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.status}</span>
                            <span className="text-[10px] font-black text-blue-600">{item.progress || 0}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-px">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all duration-1000 ease-out" style={{ width: `${item.progress || 0}%` }} />
                          </div>
                        </div>
                      ) : (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          item.status === 'Active' || item.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          item.status === 'Onboarding' || item.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' || item.status === 'Paid' ? 'bg-emerald-500' : 'bg-current animate-pulse'}`} />
                          {item.status}
                        </div>
                      )}
                    </td>
                    <td className="py-6 px-10 text-right">
                      <p className="text-sm font-black text-slate-900 tracking-tight">
                        {sym}{(registryTab === 'projects' ? item.budget : registryTab === 'clients' ? item.retainer : item.total || 0).toLocaleString()}
                      </p>
                    </td>
                    {isAdmin && (
                      <td className="py-6 px-10">
                        <div className="flex justify-center items-center">
                          <button 
                            onClick={() => setConfirmDelete({ id: item.id, name: itemSub, type: registryTab.slice(0, -1) })}
                            className="p-3.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-100 shadow-sm"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ); })}
                {(!loading && (registryTab === 'projects' ? pipeline : registryTab === 'clients' ? clients : invoices).length === 0) && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="py-32 text-center bg-slate-50/20">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-200 border border-slate-100">
                          <Database size={40} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Registry Analysis Terminated</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-widest">No matching institutional records located.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-slate-50/50 flex justify-center border-t border-slate-100">
            <button className="group text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 hover:text-blue-700 transition-all flex items-center gap-3">
              Institutional Matrix Access
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Standardized Institutional Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box-sm text-center p-8">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-rose-100">
              <Trash2 size={32} className="text-rose-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">Terminate Initiative?</h2>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-4 italic">
              Are you sure you want to delete <strong className="text-slate-900 font-black uppercase tracking-tight">{confirmDelete.name}</strong>? This will remove all institutional records permanently.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 py-3 px-6 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 py-3 px-6 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/30 border border-rose-500 active:scale-95"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
