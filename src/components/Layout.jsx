import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';

function LayoutInner() {
  const { collapsed, isHidden } = useSidebar();
  const sidebarW = isHidden ? 0 : (collapsed ? 72 : 280);

  return (
    <div className="bg-[#F8FAFC] h-screen overflow-hidden text-slate-900 antialiased">
      <Sidebar />
      <div
        className="h-screen flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarW }}
      >
        <TopNav />
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-20 custom-scrollbar">
          <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  );
}
