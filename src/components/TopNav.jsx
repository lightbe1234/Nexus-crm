import React from 'react';
import { Search, Bell, Settings, Command } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

export default function TopNav() {
  const { currentUser, userRole } = useAuth();
  const { collapsed, isHidden, toggleHidden } = useSidebar();
  const sidebarW = isHidden ? 0 : (collapsed ? 72 : 280);

  return (
    <header
      className="w-full h-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-6 transition-all duration-300"
    >
      {/* Left side: Hamburger + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button 
          onClick={toggleHidden}
          className="text-slate-400 hover:text-blue-600 hover:bg-slate-100 p-2 rounded-lg transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <div className="relative flex items-center group w-full">
          <Search className="absolute left-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
        <input
          type="text"
          placeholder="Search projects, clients, tasks..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none text-slate-700 transition-all placeholder:text-slate-400 font-medium shadow-sm"
        />
          <div className="absolute right-3 flex items-center gap-1 text-[11px] font-semibold text-slate-400 border border-slate-200 rounded-md px-1.5 py-0.5 bg-white pointer-events-none shadow-sm">
            <Command size={11} />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all w-9 h-9 rounded-lg flex items-center justify-center">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>
        <button className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all w-9 h-9 rounded-lg flex items-center justify-center">
          <Settings size={18} />
        </button>

        <div className="w-px h-7 bg-slate-100" />

        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-none">
              {currentUser?.name?.split(' ')[0] || 'User'}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">{userRole}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
            <span className="font-bold text-blue-700 text-sm">
              {currentUser?.email?.[0].toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
