import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { 
  FileSpreadsheet, 
  FileText, 
  LogOut, 
  ChevronDown, 
  CheckCircle2, 
  Radio
} from 'lucide-react';

const Topbar = () => {
  const { user, logout, switchRoleDemo } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const demoRoles = [
    { role: 'Creator', email: 'creator@creatoriq.com', label: 'Content Creator (Alex)' },
    { role: 'Agency', email: 'agency@creatoriq.com', label: 'Influencer Agency' },
    { role: 'Marketing Team', email: 'marketing@creatoriq.com', label: 'Marketing Team' },
    { role: 'Administrator', email: 'admin@creatoriq.com', label: 'Administrator' }
  ];

  const handleExport = async (type) => {
    try {
      setExporting(true);
      const url = type === 'pdf' ? '/api/v1/reports/export-pdf' : '/api/v1/reports/export-csv';
      const res = await client.get(url, { responseType: 'blob' });
      
      const blob = new Blob([res.data], { type: type === 'pdf' ? 'application/pdf' : 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `CreatorIQ_Report_${new Date().toISOString().slice(0,10)}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showNotification(`Downloaded ${type.toUpperCase()} executive export`);
    } catch (e) {
      console.error("Export error", e);
      showNotification("Export generation failed");
    } finally {
      setExporting(false);
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRoleSwitch = async (email) => {
    setRoleMenuOpen(false);
    await switchRoleDemo(email);
    navigate('/dashboard', { replace: true });
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8 ml-64">
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-18 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          {notification}
        </div>
      )}

      {/* Live System Status indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>APIs Live: YouTube &bull; Instagram &bull; LinkedIn</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        {/* Reports Download dropdown */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
            title="Download Executive PDF"
          >
            <FileText className="h-3.5 w-3.5 text-rose-400" />
            <span>PDF Export</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
            title="Download CSV Metrics"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>CSV Export</span>
          </button>
        </div>

        {/* Demo Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Role: {user?.role || 'Switch'}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#111827] border border-white/10 shadow-2xl p-2 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 mb-1">
                Switch Interactive Role (RBAC)
              </div>
              {demoRoles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => handleRoleSwitch(r.email)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    user?.role === r.role ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{r.label}</span>
                  {user?.role === r.role && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Pill & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`}
            alt="Avatar"
            className="h-8 w-8 rounded-full border border-indigo-500/30 bg-slate-800"
          />
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-white leading-tight">{user?.full_name || 'Creator'}</span>
            <span className="block text-[10px] text-slate-400">{user?.email}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
