import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Users,
  DollarSign,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Overview', path: '/', icon: LayoutDashboard, badge: null },
  { name: 'Content Analytics', path: '/content', icon: Video, badge: 'Live' },
  { name: 'Audience', path: '/audience', icon: Users, badge: null },
  { name: 'Revenue', path: '/revenue', icon: DollarSign, badge: '+22.4%' },
  { name: 'Playground', path: '/playground', icon: Sliders, badge: 'V1.4' },
];

export const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebarCollapse } = useDashboard();
  const { user, logout } = useAuth();

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-0 left-0 h-screen bg-white dark:bg-[#0D1421] border-r border-slate-200 dark:border-white/10 transition-all duration-300 z-40 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4A7CF7] to-[#00D4FF] flex items-center justify-center shadow-md shrink-0 border border-white/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                CreatorIQ
              </span>
              <span className="text-[10px] text-[#4A7CF7] dark:text-[#00D4FF] tracking-widest font-mono uppercase font-semibold">
                Analytics OS
              </span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebarCollapse}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 transition-all"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-[#6B7B95] uppercase tracking-wider font-mono">
          {!isSidebarCollapsed ? 'Main Menu' : '•••'}
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] text-white shadow-md font-semibold'
                    : 'text-slate-600 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                }`
              }
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                {!isSidebarCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </div>

              {!isSidebarCollapsed && item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                    item.badge.includes('+')
                      ? 'bg-[#00C897]/15 text-[#00C897] border-[#00C897]/30'
                      : 'bg-[#4A7CF7]/15 text-[#4A7CF7] dark:text-[#00D4FF] border-[#4A7CF7]/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Quick Creator Pulse Widget */}
      {!isSidebarCollapsed && (
        <div className="mx-4 my-3 p-4 rounded-2xl bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-white/10 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-[#4A7CF7] dark:text-[#00D4FF] font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00C897] animate-ping" />
            <TrendingUp size={14} />
            <span>Channel Health: Prime</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-[#8B9BB5]">
            Monthly Reach: <span className="text-slate-900 dark:text-white font-bold font-mono">1.48M</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#4A7CF7] via-[#00D4FF] to-[#7C5CFC] h-full w-[84%]" />
          </div>
        </div>
      )}

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-[#4A7CF7]/50 shrink-0 shadow-sm"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80';
            }}
          />
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-500 dark:text-[#8B9BB5] truncate">{user?.handle}</span>
            </div>
          )}
        </div>
        {!isSidebarCollapsed && (
          <button
            onClick={logout}
            className="p-2 text-slate-500 dark:text-[#8B9BB5] hover:text-[#FF4757] hover:bg-[#FF4757]/15 rounded-xl transition-all"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
};
