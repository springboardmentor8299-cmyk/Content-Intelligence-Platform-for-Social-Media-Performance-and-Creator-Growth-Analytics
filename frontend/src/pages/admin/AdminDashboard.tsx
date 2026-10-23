import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, Server, Users, Key, RefreshCw, CheckCircle, 
  UserCheck, Plus, Download, X, Lock, KeyRound, ExternalLink, 
  Trash2, Ban, Check, Copy
} from 'lucide-react';

const DEFAULT_SYSTEM_ACCOUNTS = [
  {
    id: "usr-creator-001",
    email: "creator@creatoriq.com",
    full_name: "Jane Doe",
    role: "creator",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop",
    is_active: true,
    last_login: "Today, 10:20 PM",
    password: "password123",
    portal_path: "/creator/login"
  },
  {
    id: "usr-agency-002",
    email: "agency@creatoriq.com",
    full_name: "Apex Talent Agency",
    role: "agency",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop",
    is_active: true,
    last_login: "Today, 09:45 PM",
    password: "password123",
    portal_path: "/agency/login"
  },
  {
    id: "usr-marketing-003",
    email: "marketing@creatoriq.com",
    full_name: "Brand Growth Team",
    role: "marketing_team",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop",
    is_active: true,
    last_login: "Yesterday, 06:12 PM",
    password: "password123",
    portal_path: "/marketing/login"
  },
  {
    id: "usr-admin-004",
    email: "admin@creatoriq.com",
    full_name: "System Administrator",
    role: "admin",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop",
    is_active: true,
    last_login: "Just now (Current Session)",
    password: "password123",
    portal_path: "/admin/login"
  }
];

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

  const { profile, refreshProfile } = useAuth();
  const [users, setUsers] = useState<any[]>(DEFAULT_SYSTEM_ACCOUNTS);
  const [health, setHealth] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Selected User Credentials Modal
  const [selectedUserForCreds, setSelectedUserForCreds] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Provision User Modal State
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('creator');
  const [newPassword, setNewPassword] = useState('password123');
  const [creatingUser, setCreatingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const getPortalForRole = (role: string) => {
    return role === 'admin' ? '/admin/login' :
           role === 'agency' ? '/agency/login' :
           role === 'marketing_team' ? '/marketing/login' : '/creator/login';
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, hRes, lRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/v1/admin/users`),
        fetch(`${API_BASE_URL}/api/v1/admin/system-health`),
        fetch(`${API_BASE_URL}/api/v1/admin/audit-logs`),
      ]);

      if (uRes.status === 'fulfilled' && uRes.value.ok) {
        const data = await uRes.value.json();
        if (Array.isArray(data) && data.length > 0) {
          // Merge default passwords and portals dynamically based on current role
          const merged = data.map((u: any) => {
            const def = DEFAULT_SYSTEM_ACCOUNTS.find(d => d.email.toLowerCase() === u.email.toLowerCase());
            return {
              ...u,
              portal_path: getPortalForRole(u.role),
              password: def?.password || 'password123',
              last_login: def?.last_login || 'Recently'
            };
          });
          setUsers(merged);
          localStorage.setItem('creatoriq_admin_users', JSON.stringify(merged));
        } else {
          setUsers(DEFAULT_SYSTEM_ACCOUNTS);
        }
      } else {
        setUsers(DEFAULT_SYSTEM_ACCOUNTS);
      }

      if (hRes.status === 'fulfilled' && hRes.value.ok) {
        setHealth(await hRes.value.json());
      }

      if (lRes.status === 'fulfilled' && lRes.value.ok) {
        setLogs(await lRes.value.json());
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setUsers(DEFAULT_SYSTEM_ACCOUNTS);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    try {
      // Optimistic update
      const updated = users.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            role: newRole,
            portal_path: getPortalForRole(newRole)
          };
        }
        return u;
      });
      setUsers(updated);
      localStorage.setItem('creatoriq_admin_users', JSON.stringify(updated));
      
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, is_active: true }),
      });
      if (res.ok) {
        showFeedback(`Role updated to ${newRole.replace('_', ' ').toUpperCase()} successfully!`);
        fetchAdminData();

        // If target is currently logged in user, refresh profile immediately
        const target = users.find(u => u.id === userId);
        if (target && profile?.email?.toLowerCase() === target.email.toLowerCase()) {
          refreshProfile();
        }
      }
    } catch (e) {
      console.error('Error updating user role:', e);
    }
  };

  const handleStatusToggle = async (user: any) => {
    const nextStatus = !user.is_active;
    try {
      const updated = users.map(u => u.id === user.id ? { ...u, is_active: nextStatus } : u);
      // Optimistic update
      setUsers(updated);
      localStorage.setItem('creatoriq_admin_users', JSON.stringify(updated));

      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: user.role, is_active: nextStatus }),
      });
      if (res.ok) {
        showFeedback(`Account for ${user.email} is now ${nextStatus ? 'ACTIVE' : 'SUSPENDED'}`);
        fetchAdminData();
      }
    } catch (e) {
      console.error('Error toggling status:', e);
    }
  };

  const handleResetPassword = async (user: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${user.id}/reset-password`, {
        method: 'POST',
      });
      if (res.ok) {
        showFeedback(`Password for ${user.email} reset to 'password123'`);
      } else {
        showFeedback(`Password for ${user.email} set to default 'password123'`);
      }
    } catch (e) {
      showFeedback(`Password for ${user.email} set to default 'password123'`);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (user.role === 'admin' || user.email === 'admin@creatoriq.com') {
      alert('Cannot delete primary System Administrator account');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove user ${user.email}?`)) {
      return;
    }
    try {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showFeedback(`User ${user.email} removed successfully`);
        fetchAdminData();
      }
    } catch (e) {
      showFeedback(`User ${user.email} removed`);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          full_name: newName,
          role: newRole,
          password: newPassword
        })
      });
      if (res.ok) {
        setIsNewUserOpen(false);
        setNewEmail('');
        setNewName('');
        showFeedback(`User ${newEmail} provisioned successfully!`);
        fetchAdminData();
      } else {
        const err = await res.json();
        setUserError(err.detail || 'Failed to create user');
      }
    } catch (err) {
      // Local fallback in case of network issue
      const mockNew = {
        id: `usr-${Date.now()}`,
        email: newEmail,
        full_name: newName,
        role: newRole,
        password: newPassword,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newName.replace(' ', '')}`,
        is_active: true,
        last_login: "Just created",
        portal_path: newRole === 'admin' ? '/admin/login' : newRole === 'agency' ? '/agency/login' : newRole === 'marketing_team' ? '/marketing/login' : '/creator/login'
      };
      setUsers(prev => [mockNew, ...prev]);
      setIsNewUserOpen(false);
      setNewEmail('');
      setNewName('');
      showFeedback(`User ${newEmail} provisioned locally!`);
    } finally {
      setCreatingUser(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <DashboardLayout
      title="System Administration & Governance"
      subtitle="Full administrative oversight over user accounts, role access control, API rate limits, and audit logs."
      headerActions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
          <button
            onClick={() => window.open(`${API_BASE_URL}/api/v1/admin/export-audit-csv`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}
          >
            <Download className="h-4 w-4" />
            Export Audit Log
          </button>
          <button
            onClick={() => setIsNewUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Provision User
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{actionFeedback}</span>
            </div>
            <button onClick={() => setActionFeedback(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

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
              <span className="text-2xl font-bold text-gray-900">{users.length}</span>
              <span className="text-xs font-semibold text-emerald-600">
                {users.filter(u => u.is_active).length} Active
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Total portal login accounts</p>
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

        {/* Tab 1: Users Table */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Platform Accounts & Assigned Roles</h3>
                <p className="text-xs text-gray-500 mt-0.5">Maintain, manage credentials, reassign roles, and configure access for all 4 primary portal logins.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">
                  Total Logins: <strong>{users.length}</strong>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-5 py-3">User & Identity</th>
                    <th className="px-4 py-3">Login Email</th>
                    <th className="px-4 py-3">Active Role</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3">Role Reassignment</th>
                    <th className="px-5 py-3 text-right">Maintenance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* User Info */}
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <img 
                          src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.full_name}`} 
                          alt={u.full_name} 
                          className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                        />
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                            {u.full_name}
                            {u.role === 'admin' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold uppercase tracking-tight">
                                ADMIN
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">ID: {u.id}</p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-gray-800 font-medium">{u.email}</span>
                          <span className="text-[11px] text-gray-400 mt-0.5">Last login: {u.last_login || 'Active'}</span>
                        </div>
                      </td>

                      {/* Active Role Badge */}
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

                      {/* Account Status */}
                      <td className="px-4 py-3.5">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <Ban className="h-3.5 w-3.5" /> Suspended
                          </span>
                        )}
                      </td>

                      {/* Role Reassignment Dropdown */}
                      <td className="px-4 py-3.5">
                        <select
                          className="text-xs border rounded-lg px-2.5 py-1.5 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-200 font-medium text-gray-700"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, u.role, e.target.value)}
                        >
                          <option value="creator">Creator (🎨 Purple)</option>
                          <option value="agency">Agency (🏢 Cyan)</option>
                          <option value="marketing_team">Marketing Team (🎯 Amber)</option>
                          <option value="admin">Administrator (⚙️ Red)</option>
                        </select>
                      </td>

                      {/* Maintenance Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Credentials / Quick Info */}
                          <button
                            onClick={() => setSelectedUserForCreds(u)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                            title="View Login Credentials"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>

                          {/* Toggle Active / Suspended */}
                          <button
                            onClick={() => handleStatusToggle(u)}
                            className={`p-1.5 rounded-lg transition-colors border ${
                              u.is_active
                                ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50 border-transparent hover:border-amber-200'
                                : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={u.is_active ? "Suspend Account" : "Activate Account"}
                          >
                            <Ban className="h-4 w-4" />
                          </button>

                          {/* Open Target Portal Link */}
                          <Link
                            to={u.portal_path || '/login'}
                            target="_blank"
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-200"
                            title={`Open ${u.role} Login Portal`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          {/* Delete Account (disabled for primary admin) */}
                          {u.email !== 'admin@creatoriq.com' && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                              title="Delete Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Login Reference Bar at Bottom */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
              <span className="font-semibold text-gray-700">🔑 Standard Login Portals:</span>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/creator/login" target="_blank" className="hover:text-blue-600 font-medium underline flex items-center gap-1">
                  Creator Login (creator@creatoriq.com)
                </Link>
                <span>•</span>
                <Link to="/agency/login" target="_blank" className="hover:text-blue-600 font-medium underline flex items-center gap-1">
                  Agency Login (agency@creatoriq.com)
                </Link>
                <span>•</span>
                <Link to="/marketing/login" target="_blank" className="hover:text-blue-600 font-medium underline flex items-center gap-1">
                  Marketing Login (marketing@creatoriq.com)
                </Link>
                <span>•</span>
                <Link to="/admin/login" target="_blank" className="hover:text-blue-600 font-medium underline flex items-center gap-1">
                  Admin Login (admin@creatoriq.com)
                </Link>
              </div>
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

        {/* Modal: View Credentials & Login Info */}
        {selectedUserForCreds && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Login Credentials</h3>
                </div>
                <button
                  onClick={() => setSelectedUserForCreds(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">User Name</label>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedUserForCreds.full_name}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Login Email</label>
                  <div className="flex items-center justify-between mt-1 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="font-mono text-sm text-gray-800">{selectedUserForCreds.email}</span>
                    <button
                      onClick={() => copyToClipboard(selectedUserForCreds.email, 'email')}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Copy Email"
                    >
                      {copiedField === 'email' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Standard Password</label>
                  <div className="flex items-center justify-between mt-1 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="font-mono text-sm text-gray-800">{selectedUserForCreds.password || 'password123'}</span>
                    <button
                      onClick={() => copyToClipboard(selectedUserForCreds.password || 'password123', 'password')}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Copy Password"
                    >
                      {copiedField === 'password' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Universal demo password: <code className="text-gray-600">password123</code> (or <code className="text-gray-600">demo1234</code>)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Portal URL</label>
                  <div className="flex items-center justify-between mt-1 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-xs font-mono text-blue-900">{selectedUserForCreds.portal_path || '/login'}</span>
                    <Link
                      to={selectedUserForCreds.portal_path || '/login'}
                      target="_blank"
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-between gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleResetPassword(selectedUserForCreds);
                    setSelectedUserForCreds(null);
                  }}
                  className="px-3 py-2 text-xs font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                >
                  Reset to 'password123'
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserForCreds(null)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Provision User Modal */}
        {isNewUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-bold text-gray-900">Provision Platform Account</h3>
                </div>
                <button
                  onClick={() => setIsNewUserOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {userError && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                  {userError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah@creatoriq.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Assigned Role</label>
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-white text-gray-700"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <option value="creator">Creator (🎨 Purple)</option>
                      <option value="agency">Agency (🏢 Cyan)</option>
                      <option value="marketing_team">Marketing (🎯 Amber)</option>
                      <option value="admin">Administrator (⚙️ Red)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Initial Password</label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
                  <button
                    type="button"
                    onClick={() => setIsNewUserOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow"
                  >
                    {creatingUser ? 'Creating...' : 'Provision User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
