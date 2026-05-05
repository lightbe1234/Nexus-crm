import React, { useState, useEffect } from 'react';
import { getClients, addClient } from '../services/db';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Globe, 
  ArrowUpRight,
  TrendingUp,
  Building2,
  ChevronRight,
  X,
  Target,
  DollarSign,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function Clients() {
  const { settings } = useSettings();
  const sym = settings.financial.currencySymbol;

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newClient, setNewClient] = useState({ name: '', industry: '', contactName: '', contactRole: '', status: 'Lead', retainer: 0 });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await addClient(newClient);
      setShowModal(false);
      setNewClient({ name: '', industry: '', contactName: '', contactRole: '', status: 'Lead', retainer: 0 });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col space-y-10 overflow-hidden pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
            <Users size={12} strokeWidth={3} />
            <span>Relationship Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Client Portfolio</h1>
          <p className="text-slate-500 text-sm mt-3 font-medium">Consolidated directory of institutional partners and active accounts.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] hover:border-blue-400 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 group">
            <Filter size={16} className="group-hover:rotate-12 transition-transform" />
            Filter Tier
          </button>
          
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white rounded-[20px] hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={3} />
            Onboard Client
          </button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="flex-1 bg-white border border-slate-200/60 rounded-[48px] shadow-sm overflow-hidden flex flex-col group/table">
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/20">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">Institutional Registry</h2>
            <p className="text-slate-400 text-xs font-medium">Tracking account status, industry positioning, and contract value.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                className="bg-white text-xs font-bold border border-slate-200 rounded-2xl pl-12 pr-6 py-4 w-full md:w-80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all shadow-sm" 
                placeholder="Search portfolio by company or contact..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-100">
                <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Institutional Identity</th>
                <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Market Sector</th>
                <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Primary Liaison</th>
                <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Account Status</th>
                <th className="py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Retainer Value</th>
                <th className="py-5 px-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-blue-50/30 transition-all group/row">
                  <td className="py-7 px-10">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black shadow-inner group-hover/row:bg-blue-600 group-hover/row:text-white group-hover/row:border-blue-500 transition-all duration-300 text-lg">
                        {client.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 tracking-tight leading-tight mb-1">{client.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Globe size={10} strokeWidth={3} />
                          UID-{client.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-7 px-10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 rounded-lg">
                        <Building2 size={12} strokeWidth={2.5} className="text-slate-500" />
                      </div>
                      <span className="text-xs font-black tracking-tight text-slate-600">{client.industry}</span>
                    </div>
                  </td>
                  <td className="py-7 px-10">
                    <div>
                      <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{client.contactName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.contactRole}</p>
                    </div>
                  </td>
                  <td className="py-7 px-10">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border ${
                      client.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                        : client.status === 'Onboarding'
                          ? 'bg-blue-50 text-blue-600 border-blue-100/50'
                          : 'bg-amber-50 text-amber-600 border-amber-100/50'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-7 px-10 text-right">
                    <p className="font-black text-slate-900 tracking-tighter text-xl leading-none">
                      {sym}{(client.retainer || 0).toLocaleString()}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Monthly Committed</p>
                  </td>
                  <td className="py-7 px-10 text-right">
                    <button className="p-3 hover:bg-white rounded-2xl text-slate-300 hover:text-slate-900 transition-all shadow-sm">
                      <MoreHorizontal size={20} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Building2 size={56} strokeWidth={1} className="mb-4" />
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Portfolio Registry Empty</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Modal Section */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-12 rounded-[48px] shadow-2xl w-full max-w-2xl border border-white/20 animate-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Onboard Client</h2>
                <p className="text-slate-500 text-sm font-medium mt-3">Register a new institutional partner within the agency ecosystem.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
                <X size={28} strokeWidth={3} />
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Company Nomenclature</label>
                  <div className="relative group">
                    <Building2 size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300" 
                      placeholder="e.g. Acme Corp Institutional"
                      value={newClient.name} 
                      onChange={e => setNewClient({...newClient, name: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Market Industry</label>
                  <div className="relative group">
                    <Zap size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300" 
                      placeholder="e.g. Technology & SaaS"
                      value={newClient.industry} 
                      onChange={e => setNewClient({...newClient, industry: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Lifecycle Stage</label>
                  <div className="relative group">
                    <ShieldCheck size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-10 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all appearance-none cursor-pointer"
                      value={newClient.status} 
                      onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                    >
                      <option value="Lead">Potential Lead</option>
                      <option value="Onboarding">Integration Phase</option>
                      <option value="Active">Strategic Partner</option>
                    </select>
                    <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Point of Contact</label>
                  <div className="relative group">
                    <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300" 
                      placeholder="e.g. John Doe"
                      value={newClient.contactName} 
                      onChange={e => setNewClient({...newClient, contactName: e.target.value})} 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Committed Retainer ({sym})</label>
                  <div className="relative group">
                    <DollarSign size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all" 
                      value={newClient.retainer} 
                      onChange={e => setNewClient({...newClient, retainer: Number(e.target.value)})} 
                    />
                  </div>
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
                  Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
