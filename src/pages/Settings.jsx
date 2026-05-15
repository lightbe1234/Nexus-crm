import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { updateSettings } from '../services/db';
import { 
  Building2, 
  Settings as SettingsIcon, 
  DollarSign, 
  ShieldCheck, 
  Bell, 
  Workflow, 
  LayoutGrid, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Clock,
  UserCheck,
  ChevronRight,
  Database,
  Lock,
  Palette,
  Eye,
  Mail,
  Zap,
  Fingerprint
} from 'lucide-react';

export default function Settings() {
  const { settings, refreshSettings, loading: settingsLoading } = useSettings();
  const [activeTab, setActiveTab] = useState('company');
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  if (settingsLoading || !formData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading Configuration...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateSettings(formData);
      await refreshSettings();
      setMessage({ type: 'success', text: 'Institutional configuration updated successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Configuration update failed. Verify administrative credentials.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'company', label: 'Institutional Profile', icon: Building2 },
    { id: 'general', label: 'System Core', icon: SettingsIcon },
    { id: 'financial', label: 'Fiscal Parameters', icon: DollarSign },
    { id: 'notifications', label: 'Alert Protocols', icon: Bell },
    { id: 'security', label: 'Access Control', icon: ShieldCheck },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Agency Name</label>
                <div className="relative group">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.company.name} onChange={e => handleChange('company', 'name', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Official Email</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.company.email} onChange={e => handleChange('company', 'email', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Phone Number</label>
                <div className="relative group">
                  <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.company.phone} onChange={e => handleChange('company', 'phone', e.target.value)} />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Physical Address</label>
                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-24 resize-none" value={formData.company.address} onChange={e => handleChange('company', 'address', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Website</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.company.website} onChange={e => handleChange('company', 'website', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Tax ID</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.company.taxId} onChange={e => handleChange('company', 'taxId', e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 'general':
        return (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">System Name</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.system.name} onChange={e => handleChange('system', 'name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Language</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer" value={formData.system.language} onChange={e => handleChange('system', 'language', e.target.value)}>
                  <option value="en">English (US)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Timezone</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer" value={formData.system.timezone} onChange={e => handleChange('system', 'timezone', e.target.value)}>
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Date Format</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer" value={formData.system.dateFormat} onChange={e => handleChange('system', 'dateFormat', e.target.value)}>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'financial':
        return (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Currency</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={formData.financial.currency} onChange={e => handleChange('financial', 'currency', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Currency Symbol</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={formData.financial.currencySymbol} onChange={e => handleChange('financial', 'currencySymbol', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Tax Rate (%)</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={formData.financial.taxRate} onChange={e => handleChange('financial', 'taxRate', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Invoice Prefix</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={formData.financial.invoicePrefix} onChange={e => handleChange('financial', 'invoicePrefix', e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'email', label: 'Automated SMTP Alerts', desc: 'Execute institutional email triggers on system state change.', icon: Mail },
                { id: 'inApp', label: 'Real-time Signal Feed', desc: 'Activate UI toast alerts and terminal indicators.', icon: Bell },
                { id: 'taskAlerts', label: 'Recruitment Notifications', desc: 'Alert personnel upon strategic task allocation.', icon: UserCheck },
                { id: 'dueReminders', label: 'Maturity Threshold Alerts', desc: 'Trigger reminders 24h prior to milestone deadlines.', icon: Clock },
              ].map(opt => (
                <div key={opt.id} className="premium-card p-5 group hover:border-blue-300 flex items-center justify-between transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shadow-sm">
                      <opt.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleChange('notifications', opt.id, !formData.notifications[opt.id])}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.notifications[opt.id] ? 'bg-blue-600 shadow-md shadow-blue-600/20' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.notifications[opt.id] ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Access Control Layer</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Master Security Protocol</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Role-Based Access Enforcement', status: 'Enabled', icon: UserCheck },
                  { label: 'Multi-Factor Verification Protocol', status: 'Enterprise Only', icon: Fingerprint },
                  { label: 'Encrypted Credential Storage', status: 'Active', icon: Lock },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-slate-500" />
                      <span className="text-sm font-medium text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 rounded-md text-blue-400 border border-slate-700">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="premium-card p-6 group hover:border-rose-400 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                    <Zap size={18} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Emergency Lockdown</h4>
                </div>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">Instantly revoke all active sessions and enter read-only mode for the entire ecosystem.</p>
                <button className="w-full py-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-600 hover:text-white transition-all shadow-sm">Execute Protocol</button>
              </div>
              
              <div className="premium-card p-6 group hover:border-blue-400 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                    <Database size={18} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Audit Log Registry</h4>
                </div>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">Consolidate and export all administrative actions and security-sensitive modifications.</p>
                <button className="w-full py-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all shadow-sm">Export Registry</button>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-20 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">Module Synchronization Required</div>;
    }
  };

  return (
    <div className="h-screen flex flex-col space-y-6 overflow-hidden pb-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
            <LayoutGrid size={14} />
            <span>Master Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Fine-tuning the institutional architecture and operational protocols.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold text-sm shadow-sm active:scale-95 disabled:opacity-50"
        >
          {saving ? <Clock className="animate-spin" size={16} /> : <Save size={16} />}
          {saving ? 'Synchronizing...' : 'Authorize Updates'}
        </button>
      </div>

      {message && (
        <div className={`mx-1 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' : 'bg-rose-50 text-rose-700 border border-rose-100/50'}`}>
          <div className={`p-1.5 rounded-lg ${message.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          </div>
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="flex-1 flex gap-6 items-start px-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 space-y-2 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'} />
                <span className={`text-sm font-semibold ${activeTab === tab.id ? 'text-blue-600' : ''}`}>{tab.label}</span>
              </div>
              <ChevronRight size={16} className={`transition-all ${activeTab === tab.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
            </button>
          ))}
          <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 relative overflow-hidden">
             <Palette size={32} className="absolute -bottom-2 -right-2 text-slate-100 -rotate-12" />
             <p className="text-xs font-semibold text-slate-500 mb-1 relative z-10">Branding Suite</p>
             <p className="text-sm font-medium text-slate-700 relative z-10">Configure agency logos, color tokens, and typography.</p>
             <button className="mt-4 text-sm font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all relative z-10">
               Access Designer <ChevronRight size={16} />
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
            <div className="p-3 bg-white shadow-sm rounded-xl text-blue-600 border border-slate-100">
              {React.createElement(tabs.find(t => t.id === activeTab)?.icon || SettingsIcon, { size: 24 })}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Active Configuration Module</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
