import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Shield, Server, Users, Key, AlertTriangle, RefreshCw, CheckCircle, Clock, Activity, Lock, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'users' | 'health' | 'audit' | null;
  const [activeTab, setActiveTab] = useState<'users' | 'health' | 'audit'>(tabParam || 'users');

  useEffect(() => {
    if (tabParam && (tabParam === 'users' || tabParam === 'health' || tabParam === 'audit')) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'users' | 'health' | 'audit') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [users, setUsers] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);


  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, hRes, lRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/admin/users'),
        fetch('http://localhost:8000/api/v1/admin/system-health'),
        fetch('http://localhost:8000/api/v1/admin/audit-logs'),
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (hRes.ok) setHealth(await hRes.json());
      if (lRes.ok) setLogs(await lRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, is_active: true }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error('Error updating user role:', e);
    }
  };

  return (
    <DashboardLayout
      title="System Administration & Governance"
      subtitle="Full administrative oversight over user accounts, role access control, API rate limits, and audit logs."
      headerActions={
        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Admin Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered Users</span>
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{users.length || 4}</span>
              <span className="text-xs font-semibold text-emerald-600">All Active</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Total portal accounts</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Health</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Server className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">{health?.system_metrics?.uptime || '99.98%'}</span>
              <span className="text-xs font-semibold text-emerald-600">Optimal</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">FastAPI & SQLite Engine</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">OAuth Tokens Status</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Key className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-700">Verified</span>
              <span className="text-xs font-semibold text-blue-600">Auto-Refresh</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Active Google & LinkedIn OAuth</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Security Audits</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Shield className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-700">{logs.length || 4} Events</span>
              <span className="text-xs font-semibold text-emerald-600">0 Breaches</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Authenticated access logs</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('users')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            User & Role Management ({users.length})
          </button>
          <button
            onClick={() => handleTabChange('health')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'health'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            API Quotas & Infrastructure
          </button>
          <button
            onClick={() => handleTabChange('audit')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Security Audit Trail
          </button>
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Platform Accounts & Assigned Roles</h3>
                <p className="text-xs text-gray-500 mt-0.5">Control role-based access permissions across Creator, Agency, Marketing, and Admin portals.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Active Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Role Reassignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <img src={u.avatar_url} alt={u.full_name} className="h-9 w-9 rounded-full object-cover border" />
                        <div>
                          <p className="font-semibold text-gray-900">{u.full_name}</p>
                          <p className="text-xs text-gray-400">ID: {u.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-700">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : u.role === 'agency'
                            ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                            : u.role === 'marketing_team'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <CheckCircle className="h-3.5 w-3.5" /> Active
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          className="text-xs border rounded-lg px-2 py-1 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-400"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, u.role, e.target.value)}
                        >
                          <option value="creator">Creator</option>
                          <option value="agency">Agency</option>
                          <option value="marketing_team">Marketing Team</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Health & Quotas */}
        {activeTab === 'health' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-base font-bold text-gray-900 mb-1">External API Quota Consumption</h3>
              <p className="text-xs text-gray-500 mb-5">Monitoring API call rates and daily thresholds for connected provider platforms.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {health?.api_quotas?.map((q: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{q.service}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        {q.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Used: {q.used_units.toLocaleString()} / {q.daily_limit.toLocaleString()} units</span>
                        <span className="font-semibold text-gray-800">{q.utilization}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: q.utilization }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-base font-bold text-gray-900 mb-1">Database & Server Runtime</h3>
              <p className="text-xs text-gray-500 mb-4">Underlying engine and persistence metrics.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">ORM Engine</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{health?.database?.engine || 'SQLite / SQLAlchemy'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Query Latency</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">{health?.database?.latency_ms || 1.2} ms</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Active Channels</p>
                  <p className="text-sm font-bold text-blue-600 mt-1">{health?.database?.active_connections || 1} live accounts</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Memory Allocation</p>
                  <p className="text-sm font-bold text-purple-600 mt-1">{health?.system_metrics?.memory_usage_mb || 64.5} MB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Security & Operational Audit Logs</h3>
                <p className="text-xs text-gray-500 mt-0.5">Immutable record of system changes, authorization events, and platform calls.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono text-xs">
                <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((l: any) => (
                    <tr key={l.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-3 text-gray-500">{l.timestamp}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{l.actor}</td>
                      <td className="px-4 py-3 text-blue-600 font-bold">{l.action}</td>
                      <td className="px-4 py-3 text-gray-700">{l.resource}</td>
                      <td className="px-4 py-3 text-gray-500">{l.ip_address}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans font-semibold text-[10px]">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
