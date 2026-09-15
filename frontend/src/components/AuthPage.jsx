import React, { useState } from 'react';
import { 
  Zap, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';
import { loginUser, registerUser, fetchUserProfile } from '../api';

export default function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('creator@creatoriq.io');
  const [password, setPassword] = useState('Creator@123');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('creator');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const demoAccounts = [
    {
      role: 'creator',
      label: 'Creator',
      name: 'Raw Talks With VK',
      email: 'creator@creatoriq.io',
      password: 'Creator@123',
      icon: User,
      badge: 'Sample Creator',
      color: 'border-indigo-200 bg-indigo-50/70 hover:bg-indigo-50 text-indigo-900',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      role: 'agency',
      label: 'Agency',
      name: 'Apex Talent Media',
      email: 'agency@creatoriq.io',
      password: 'Agency@123',
      icon: Briefcase,
      badge: 'Talent Roster',
      color: 'border-purple-200 bg-purple-50/70 hover:bg-purple-50 text-purple-900',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      role: 'marketing_team',
      label: 'Marketing Team',
      name: 'Sarah Chen',
      email: 'marketing@creatoriq.io',
      password: 'Marketing@123',
      icon: TrendingUp,
      badge: 'Campaign ROI',
      color: 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50 text-emerald-900',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      role: 'admin',
      label: 'Administrator',
      name: 'CreatorIQ Admin',
      email: 'admin@creatoriq.io',
      password: 'Admin@123',
      icon: Shield,
      badge: 'System Admin',
      color: 'border-amber-200 bg-amber-50/70 hover:bg-amber-50 text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-700'
    }
  ];

  const handleQuickLogin = async (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email: acc.email, password: acc.password });
      const token = res.data.access_token;
      localStorage.setItem('creatoriq_token', token);
      
      const userRes = await fetchUserProfile();
      onLoginSuccess(token, userRes.data);
    } catch (err) {
      console.error("Quick login failed:", err);
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        await registerUser({
          email,
          password,
          full_name: fullName,
          role
        });
        setSuccessMessage('Account registered successfully! Signing in...');
        
        const loginRes = await loginUser({ email, password });
        const token = loginRes.data.access_token;
        localStorage.setItem('creatoriq_token', token);
        const userRes = await fetchUserProfile();
        onLoginSuccess(token, userRes.data);
      } else {
        const res = await loginUser({ email, password });
        const token = res.data.access_token;
        localStorage.setItem('creatoriq_token', token);
        const userRes = await fetchUserProfile();
        onLoginSuccess(token, userRes.data);
      }
    } catch (err) {
      console.error("Auth submit error:", err);
      const msg = err.response?.data?.detail || (isRegister ? 'Registration failed. Email may already be registered.' : 'Invalid email or password.');
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 mb-3">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">
            Creator<span className="text-indigo-600">IQ</span>
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
            Milestone 1 + 2
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Creator Analytics & Content Performance Dashboard
        </p>
      </div>

      {/* Main Auth Container Card */}
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Toggle Mode */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Raw Talks With VK"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="creator@creatoriq.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Account Persona / Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 transition cursor-pointer"
              >
                <option value="creator">Creator (Analytics & Studio)</option>
                <option value="agency">Agency (Talent Management)</option>
                <option value="marketing_team">Marketing Team (Campaign ROI)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>{isRegister ? 'Register & Enter Dashboard' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins Section */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Mentor Demo Accounts
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 1-Click Login
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={loading}
                  className={`p-2.5 rounded-xl border text-left transition hover:shadow-xs flex flex-col justify-between cursor-pointer ${acc.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{acc.label}</span>
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 truncate font-medium">
                    {acc.name}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${acc.badgeColor}`}>
                      {acc.badge}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {acc.password}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer disclaimer */}
      <div className="mt-6 text-center text-slate-400 text-xs max-w-sm">
        CreatorIQ • Creator Analytics & Content Performance Dashboard
        <div className="text-[11px] text-slate-400 mt-0.5">Raw Talks With VK • Creator Analytics Workspace</div>
      </div>
    </div>
  );
}
