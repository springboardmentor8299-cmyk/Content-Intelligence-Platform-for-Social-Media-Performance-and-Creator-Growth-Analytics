import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useDashboard } from '../../context/DashboardContext';

export const Layout = () => {
  const { isSidebarCollapsed } = useDashboard();

  return (
    <div className="min-h-screen bg-[#F4F6FC] dark:bg-[#0A0E1A] text-[#0F172A] dark:text-white flex flex-col font-sans selection:bg-[#4A7CF7] selection:text-white transition-colors duration-300">
      {/* Fixed Sidebar for Desktop/Tablet */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        } pb-20 md:pb-8`}
      >
        {/* Sticky Header */}
        <Header />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <BottomNav />
    </div>
  );
};
