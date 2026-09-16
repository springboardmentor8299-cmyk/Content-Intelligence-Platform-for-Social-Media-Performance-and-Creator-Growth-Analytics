import React, { useState } from 'react';
import { 
  ChevronDown, 
  Shield, 
  User, 
  Briefcase, 
  TrendingUp, 
  Zap,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { switchRole } from '../api';

export default function Navbar({ 
  currentRole, 
  onRoleChange, 
  onOpenSettings,
  currentUser,
  onLogout
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleRoleSelect = async (role) => {
    try {
      const res = await switchRole(role);
      localStorage.setItem('creatoriq_token', res.data.access_token);
      onRoleChange(role, res.data);
      setShowRoleMenu(false);
    } catch (err) {
      console.error("Role switch failed:", err);
    }
  };

  const rolesList = [
    { id: 'creator', label: 'Creator', icon: User, desc: 'Full creator analytics & studio insights' },
    { id: 'agency', label: 'Agency', icon: Briefcase, desc: 'Talent roster & cross-channel management' },
    { id: 'marketing_team', label: 'Marketing Team', icon: TrendingUp, desc: 'Campaign performance & audience benchmarks' },
    { id: 'admin', label: 'Administrator', icon: Shield, desc: 'Full platform oversight & system settings' }
  ];

  const roleColors = {
    creator: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    agency: 'bg-purple-50 text-purple-700 border-purple-200',
    marketing_team: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    admin: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Creator Identity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs shadow-indigo-200">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 font-display">
                  Creator<span className="text-indigo-600">IQ</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-slate-100 text-slate-600 border border-slate-200 rounded-md">
                  M1 + M2
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">
                Creator Analytics & Content Dashboard
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          {/* Raw Talks Creator Workspace Indicator */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-800">Raw Talks With VK</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded font-semibold">
              Host: Vamshi Kurapati / VK
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">
              Demo Workspace
            </span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          
          {/* Role Switcher (RBAC Demonstration) */}
          <div className="relative">
            <button 
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-xs ${
                roleColors[currentRole] || 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span className="capitalize">Role: {currentRole.replace('_', ' ')}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white p-2 shadow-lg border border-slate-200 z-50">
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Role Persona
                </div>
                <div className="space-y-1 mt-1">
                  {rolesList.map((r) => {
                    const Icon = r.icon;
                    const active = currentRole === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleRoleSelect(r.id)}
                        className={`w-full flex items-start gap-3 p-2 rounded-lg text-left transition ${
                          active ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className={`p-1.5 rounded-md ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-800">
                            {r.label}
                            {active && <span className="text-[10px] text-indigo-600 font-normal">• Active</span>}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{r.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Account Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
            title="Account & Profile Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Pill */}
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-85 transition cursor-pointer text-left"
            title="Manage Profile"
          >
            <div className="w-8 h-8 rounded-full border border-indigo-200 overflow-hidden bg-indigo-50 flex items-center justify-center shrink-0">
              <img 
                src={currentUser?.avatar_url || "https://yt3.googleusercontent.com/QMXe3DvDHou2kGpuvaCwnlm6uGwdlG_LrzrT1HHG5XqaUGH49zYbKtwLbMxdGKf95-c1H16W=s900-c-k-c0x00ffffff-no-rj"} 
                alt={currentUser?.full_name || "Raw Talks With VK"} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-xs font-bold text-indigo-700">RT</span>';
                }}
              />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser?.full_name || "Raw Talks With VK"}
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                {currentUser?.email || "creator@creatoriq.io"}
              </div>
            </div>
          </button>

          {/* Quick Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>
      </div>
    </header>
  );
}
