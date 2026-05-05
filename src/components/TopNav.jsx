import React from 'react';
import { Search, Bell, HelpCircle, Settings, Command } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function TopNav() {
  const { currentUser, userRole } = useAuth();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-260px)] h-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-10 transition-all">
      <div className="flex-1 max-w-lg relative flex items-center group">
        <Search className="absolute left-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search for metrics, projects or clients..." 
          className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none text-slate-700 transition-all placeholder:text-slate-400 font-medium shadow-inner" 
        />
        <div className="absolute right-4 flex items-center gap-1 text-[10px] font-black text-slate-400 border border-slate-200 rounded-lg px-2 py-1 bg-white pointer-events-none shadow-sm">
          <Command size={10} />
          <span>K</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center relative group">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
          <button className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center">
            <Settings size={22} />
          </button>
        </div>
        
        <div className="w-px h-8 bg-slate-100"></div>
        
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="flex flex-col text-right">
            <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              {currentUser?.name?.split(' ')[0] || 'User'}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{userRole}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center font-black text-slate-700 text-lg border border-slate-100">
              {currentUser?.email?.[0].toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
