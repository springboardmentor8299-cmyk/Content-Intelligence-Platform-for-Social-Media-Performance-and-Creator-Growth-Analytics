import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Video,
  Users,
  DollarSign,
  Briefcase,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const currentRole = user?.role || "Creator";

  // Navigation schema filtered by RBAC feature matrix
  const navItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Creator', 'Agency', 'Marketing Team', 'Administrator']
    },
    {
      name: 'Content Analytics',
      path: '/content',
      icon: Video,
      roles: ['Creator', 'Agency', 'Marketing Team', 'Administrator']
    },
    {
      name: 'Audience & Growth',
      path: '/audience',
      icon: Users,
      roles: ['Creator', 'Agency', 'Marketing Team', 'Administrator']
    },
    {
      name: 'Revenue & Deals',
      path: '/revenue',
      icon: DollarSign,
      roles: ['Creator', 'Agency', 'Marketing Team', 'Administrator']
    },
    {
      name: 'Agency Workspace',
      path: '/agency',
      icon: Briefcase,
      roles: ['Agency', 'Administrator']
    },
    {
      name: 'Admin Governance',
      path: '/admin',
      icon: ShieldCheck,
      roles: ['Administrator']
    }
  ];

  const visibleNav = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className="w-64 h-screen bg-[#0d1322] border-r border-white/5 flex flex-col justify-between select-none fixed left-0 top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              Creator<span className="text-indigo-400">IQ</span>
            </span>
            <span className="text-[10px] block font-semibold text-slate-500 tracking-wider uppercase">
              Intelligence OS
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 mt-2">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/30 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Badge Indicator */}
      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">Active RBAC Profile</span>
        </div>
        <div className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {currentRole}
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Permissions tuned dynamically per RBAC matrix.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
