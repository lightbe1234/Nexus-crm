import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function Layout() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 font-inter antialiased overflow-x-hidden">
      <Sidebar />
      <div className="ml-[260px]">
        <TopNav />
        <main className="mt-20 p-10 min-h-[calc(100vh-80px)] max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
