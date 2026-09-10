import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, Users, DollarSign, Sliders } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Content', path: '/content', icon: Video },
  { name: 'Audience', path: '/audience', icon: Users },
  { name: 'Revenue', path: '/revenue', icon: DollarSign },
  { name: 'Playground', path: '/playground', icon: Sliders },
];

export const BottomNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#0D1421] border-t border-slate-200 dark:border-white/10 px-3 flex items-center justify-around z-50 shadow-lg transition-colors">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-[#4A7CF7] font-bold scale-105'
                  : 'text-slate-500 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
