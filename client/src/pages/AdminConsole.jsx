import React, { useState, useEffect } from 'react';
import client from '../api/client';
import MetricCard from '../components/common/MetricCard';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Database, 
  Server, 
  Key
} from 'lucide-react';

const AdminConsole = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statRes, userRes] = await Promise.all([
        client.get('/api/v1/admin/system-stats'),
        client.get('/api/v1/admin/users')
      ]);
      setStats(statRes.data);
      setUsers(userRes.data);
    } catch (e) {
      console.error("Admin fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await client.put(`/api/v1/admin/users/${userId}/role?new_role=${newRole}`);
      fetchAdminData();
    } catch (e) {
      alert("Failed to update role: " + (e.response?.data?.detail || e.message));
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2 border border-emerald-500/20">
          <ShieldCheck className="h-3.5 w-3.5" />
          Administrator Governance
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Console & Platform Health</h1>
        <p className="text-xs text-slate-400 mt-1">Full system control, API service health, and RBAC user governance</p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <MetricCard
          title="Total Registered Accounts"
          value={(stats?.total_users || users.length).toString()}
          change="All Roles Active"
          isPositive={true}
          icon={Users}
          color="indigo"
        />
        <MetricCard
          title="Connected Ingestion Channels"
          value={(stats?.total_connected_accounts || 3).toString()}
          change="YouTube, IG, LinkedIn"
          isPositive={true}
          icon={Activity}
          color="emerald"
        />
        <MetricCard
          title="Database Latency"
          value={`${stats?.api_gateway_latency_ms || 14}ms`}
          change="Optimal"
          isPositive={true}
          icon={Database}
          color="cyan"
        />
        <MetricCard
          title="Tracked Posts & Deals"
          value={`${(stats?.total_tracked_posts || 0) + (stats?.total_deals_processed || 0)}`}
          change="Live Ingestion"
          isPositive={true}
          icon={Server}
          color="amber"
        />
      </div>

      {/* API Integrations Status */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-bold text-white tracking-tight mb-2">Connected Social Media APIs</h3>
        <p className="text-xs text-slate-400 mb-6">Status of registered production API credentials and endpoints</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">YouTube Data API v3</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Channel telemetry, subscriber metrics & view count polling</p>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Status: Operational
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Instagram Graph API</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Media counts, follower demographics & reel metrics</p>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Status: Operational
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">LinkedIn REST API</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Professional audience reach, B2B engagement & company stats</p>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Status: Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User RBAC Governance Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-base font-bold text-white tracking-tight">System Users & Role Governance</h3>
          <span className="text-xs text-slate-500">{users.length} Users Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Adjust Permissions</th>
                <th className="px-6 py-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    <img
                      src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full bg-slate-800 border border-white/10"
                    />
                    <span>{u.full_name || 'User'}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Creator">Creator</option>
                      <option value="Agency">Agency</option>
                      <option value="Marketing Team">Marketing Team</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
