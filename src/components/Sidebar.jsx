import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  ReceiptText, LineChart, Settings,
  LogOut, UserCog, ChevronRight, Zap,
  Clock, ListTodo, TrendingUp, ShieldCheck,
  Home, Sparkles, Globe, Shield,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSidebar } from '../contexts/SidebarContext';

function SidebarLink({ item, accentClass = 'bg-blue-600', shadowClass = 'shadow-blue-600/20', collapsed }) {
  return (
    <NavLink
      to={item.path}
      title={item.short}
      className={({ isActive }) =>
        `group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 ${
          isActive
            ? `${accentClass} text-white shadow-lg ${shadowClass} scale-[1.02]`
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`shrink-0 p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
              <item.icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'}
              />
            </div>
            {!collapsed && (
              <span className={`text-sm font-semibold tracking-tight truncate ${isActive ? 'text-white' : ''}`}>
                {item.short}
              </span>
            )}
          </div>
          {!collapsed && (
            <ChevronRight
              size={14}
              className={`shrink-0 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}`}
              strokeWidth={3}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { userRole, logout } = useAuth();
  const { settings } = useSettings();
  const { collapsed, toggle, isHidden } = useSidebar();
  const isAdmin = userRole === 'Admin';
  const isEmployee = userRole === 'Employee';

  const sidebarW = isHidden ? 0 : (collapsed ? 72 : 280);

  const baseItems = [
    { short: 'Dashboard',  path: '/dashboard',  icon: LayoutDashboard },
    { short: 'Clients',    path: '/clients',    icon: Users },
    { short: 'Projects',   path: '/projects',   icon: FolderKanban },
    { short: 'Tasks',      path: '/tasks',      icon: CheckSquare },
    { short: 'Reports',    path: '/reports',    icon: LineChart },
  ];

  const adminItems = [
    { short: 'HR Control', path: '/admin/hr-overview', icon: ShieldCheck },
    { short: 'Employees',  path: '/employees',          icon: UserCog },
    { short: 'Invoicing',  path: '/finance',            icon: ReceiptText },
    { short: 'Settings',   path: '/settings',           icon: Settings },
  ];

  const employeeItems = [
    { short: 'Dashboard',   path: '/employee/dashboard',   icon: Home },
    { short: 'Attendance',  path: '/employee/attendance',  icon: Clock },
    { short: 'My Tasks',    path: '/employee/tasks',       icon: ListTodo },
    { short: 'Performance', path: '/employee/performance', icon: TrendingUp },
  ];

  return (
    <nav
      className="fixed left-0 top-0 h-full z-[60] bg-slate-900 flex flex-col shadow-[20px_0_60px_rgba(0,0,0,0.4)] border-r border-slate-800 transition-all duration-300 overflow-hidden"
      style={{ width: sidebarW }}
    >
      {/* Brand Header */}
      <div className={`flex items-center py-6 border-b border-slate-800/50 ${collapsed ? 'px-3 justify-center' : 'px-5 gap-3'}`}>
        {/* Logo icon */}
        <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/20">
          <span className="font-black text-lg text-white italic">
            {settings?.company?.name?.[0] || 'S'}
          </span>
        </div>

        {/* Brand text — only when expanded */}
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h2 className="text-white text-base font-bold tracking-tighter truncate">
              {settings?.company?.name?.split(' ')[0] || 'Stitch'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">
                {settings?.system?.name || 'CORE ERP'}
              </span>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={toggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition-all ${collapsed ? 'mt-1' : ''}`}
        >
          {collapsed
            ? <PanelLeftOpen size={16} strokeWidth={2.5} />
            : <PanelLeftClose size={16} strokeWidth={2.5} />
          }
        </button>
      </div>

      {/* Navigation */}
      <div className={`flex-1 pt-4 space-y-1 overflow-y-auto custom-scrollbar-dark scroll-smooth ${collapsed ? 'px-2' : 'px-3'}`}>

        {/* Principal (Admin) */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <div className="px-3 mb-2 mt-2 flex items-center gap-2 opacity-50">
                <Globe size={10} className="text-blue-400" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Principal</p>
              </div>
            )}
            <div className="space-y-0.5">
              {baseItems.map(item => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  accentClass="bg-blue-600"
                  shadowClass="shadow-blue-600/30"
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        )}

        {/* Employee Portal */}
        {isEmployee && (
          <div>
            {!collapsed && (
              <div className="px-3 mb-2 mt-2 flex items-center gap-2 opacity-50">
                <Sparkles size={10} className="text-amber-400" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Portal</p>
              </div>
            )}
            <div className="space-y-0.5">
              {employeeItems.map(item => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  accentClass="bg-blue-600"
                  shadowClass="shadow-blue-600/30"
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        )}

        {/* Governance (Admin) */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <div className="px-3 mb-2 mt-6 flex items-center gap-2 opacity-50">
                <Shield size={10} className="text-indigo-400" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Governance</p>
              </div>
            )}
            {collapsed && <div className="my-3 mx-2 h-px bg-slate-800" />}
            <div className="space-y-0.5">
              {adminItems.map(item => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  accentClass="bg-slate-700"
                  shadowClass="shadow-slate-900/40"
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`mt-auto pt-4 border-t border-slate-800/50 space-y-2 ${collapsed ? 'px-2 pb-4' : 'px-3 pb-5'}`}>
        {!collapsed && (
          <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-3 group hover:border-blue-500/30 transition-all duration-500">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-blue-500/10 rounded-xl text-blue-400">
                <Zap size={12} strokeWidth={3} />
              </div>
              <span className="text-[10px] font-bold text-slate-300 tracking-tight">
                {isEmployee ? 'Support' : 'Enterprise Intel'}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
              {isEmployee
                ? 'Access institutional assistance via the help desk.'
                : 'Secured via CORE encryption protocol.'}
            </p>
          </div>
        )}

        <button
          onClick={logout}
          title="Sign out"
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 font-bold text-xs uppercase tracking-wider ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} strokeWidth={2.5} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </nav>
  );
}
