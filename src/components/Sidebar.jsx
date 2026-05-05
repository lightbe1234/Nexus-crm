import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  ReceiptText, LineChart, HelpCircle, Settings,
  LogOut, UserCog, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export default function Sidebar() {
  const { userRole, logout } = useAuth();
  const { settings } = useSettings();
  const isAdmin = userRole === 'Admin';

  const baseItems = [
    { name: 'Executive Overview', short: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Institutional Clients', short: 'Clients',   path: '/clients',   icon: Users },
    { name: 'Project Board',  short: 'Projects',  path: '/projects',  icon: FolderKanban },
    { name: 'Strategic Tasks',     short: 'Tasks',     path: '/tasks',     icon: CheckSquare },
    { name: 'Intelligence Reports',   short: 'Reports',   path: '/reports',   icon: LineChart },
  ];

  const adminItems = [
    { name: 'Talent Management', short: 'Employees', path: '/employees', icon: UserCog },
    { name: 'Revenue Ledger', short: 'Invoicing', path: '/finance',   icon: ReceiptText },
    { name: 'System Core',  short: 'Settings',  path: '/settings',  icon: Settings },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-[280px] z-[60] bg-slate-900 flex flex-col py-10 shadow-[20px_0_60px_rgba(0,0,0,0.2)] border-r border-slate-800">
      {/* Brand Identity */}
      <div className="px-8 mb-12">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <span className="font-black text-2xl text-white">{settings?.company?.name?.[0] || 'S'}</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-white text-xl font-black tracking-tighter uppercase leading-none truncate group-hover:text-blue-400 transition-colors">
              {settings?.company?.name?.split(' ')[0] || 'Stitch'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] truncate">
                {settings?.system?.name || 'CORE ERP'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Modules */}
      <div className="flex-1 px-5 space-y-1 overflow-y-auto custom-scrollbar-dark">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">Principal Modules</p>
        </div>
        
        {baseItems.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) =>
              `group flex items-center justify-between px-5 py-4 rounded-[22px] transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-4">
                  <item.icon size={20} strokeWidth={isActive ? 3 : 2} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'} />
                  <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>{item.short}</span>
                </div>
                <ChevronRight size={14} className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} strokeWidth={4} />
              </>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="px-4 pt-10 mb-4">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">Administrative Layer</p>
            </div>
            {adminItems.map(item => (
              <NavLink key={item.path} to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-5 py-4 rounded-[22px] transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 scale-[1.02]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-4">
                      <item.icon size={20} strokeWidth={isActive ? 3 : 2} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'} />
                      <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>{item.short}</span>
                    </div>
                    <ChevronRight size={14} className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} strokeWidth={4} />
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="mt-auto px-5 pt-8 space-y-2">
        <div className="bg-slate-800/40 border border-slate-800 rounded-[28px] p-5 mb-4 group hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <Zap size={14} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Support</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed">Institutional assistance available 24/7 for master config overrides.</p>
        </div>

        <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[22px] text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white transition-all duration-300 font-black text-[11px] uppercase tracking-widest shadow-sm">
          <LogOut size={18} strokeWidth={3} />
          Terminate Session
        </button>
      </div>
    </nav>
  );
}
