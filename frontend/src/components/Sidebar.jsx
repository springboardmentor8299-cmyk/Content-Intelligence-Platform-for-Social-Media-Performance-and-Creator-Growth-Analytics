import React from 'react';
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  TrendingUp,
  Share2, 
  Settings,
  Info
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab, role, onOpenSettings }) {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'content', label: 'Content Analytics', icon: Film },
    { id: 'audience', label: 'Audience Analytics', icon: Users },
    { id: 'growth', label: 'Growth & Trends', icon: TrendingUp },
    { id: 'integrations', label: 'Social Integrations', icon: Share2 },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    if (id === 'settings') {
      onOpenSettings();
    } else {
      onSelectTab(id);
    }
  };

  return (
    <aside className="w-60 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Creator Navigation
        </div>
        <nav className="mt-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Demo Integrity Badge */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          <span>Demo Environment</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          Demonstrating Milestone 1 & 2 creator analytics with realistic seeded Telugu podcast data.
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>Active Role</span>
          <span className="capitalize font-semibold text-indigo-700">{role.replace('_', ' ')}</span>
        </div>
      </div>
    </aside>
  );
}
