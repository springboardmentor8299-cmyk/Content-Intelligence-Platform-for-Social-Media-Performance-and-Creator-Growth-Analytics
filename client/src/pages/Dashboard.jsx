import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/common/MetricCard';
import TrendChart from '../components/charts/TrendChart';
import {
  Users,
  Eye,
  DollarSign,
  Activity,
  Plus,
  Sparkles,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, LinkedinIcon } from '../components/common/SocialIcons';

const Dashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('youtube');
  const [accountHandle, setAccountHandle] = useState('');
  const [syncingId, setSyncingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [ovRes, accRes, recRes] = await Promise.all([
        client.get('/api/v1/analytics/overview'),
        client.get('/api/v1/integrations/accounts'),
        client.get('/api/v1/analytics/recommendations')
      ]);
      setOverview(ovRes.data.data);
      setAccounts(accRes.data);
      setRecommendations(recRes.data);
    } catch (e) {
      console.error("Dashboard fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConnectAccount = async (e) => {
    e.preventDefault();
    if (!accountHandle) return;
    try {
      await client.post('/api/v1/integrations/connect', {
        platform: selectedPlatform,
        account_handle: accountHandle
      });
      setAccountHandle('');
      setConnectModalOpen(false);
      setStatusMsg(`Connected ${selectedPlatform.toUpperCase()} channel successfully!`);
      setTimeout(() => setStatusMsg(''), 4000);
      loadData();
    } catch (e) {
      alert("Failed to connect channel: " + (e.response?.data?.detail || e.message));
    }
  };

  const handleSyncAccount = async (id, platform) => {
    try {
      setSyncingId(id);
      const res = await client.post(`/api/v1/integrations/sync/${id}`);
      setStatusMsg(res.data.message || `Refreshed ${platform} live telemetry`);
      setTimeout(() => setStatusMsg(''), 4000);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingId(null);
    }
  };

  const getPlatformIcon = (plat) => {
    switch (plat?.toLowerCase()) {
      case 'youtube': return <YoutubeIcon className="h-4 w-4 text-red-500" />;
      case 'instagram': return <InstagramIcon className="h-4 w-4 text-pink-500" />;
      case 'linkedin': return <LinkedinIcon className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-indigo-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const summary = overview?.summary || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Alert toast */}
      {statusMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-lg">
          <CheckCircle2 className="h-4 w-4" />
          {statusMsg}
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="glass-panel p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3 border border-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            CreatorIQ Realtime Telemetry
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Welcome back, <span className="gradient-text">{user?.full_name || 'Creator'}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Live cross-channel intelligence engine running for <b>YouTube</b>, <b>Instagram</b>, and <b>LinkedIn</b>.
          </p>
        </div>

        {/* Action Button: Connect Social Account */}
        <div className="z-10">
          <button
            onClick={() => setConnectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Connect Social Channel
          </button>
        </div>

        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none"></div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Audience Reach"
          value={summary.total_followers ? summary.total_followers.toLocaleString() : "268,400"}
          change="+18.4% MoM"
          isPositive={true}
          icon={Users}
          color="indigo"
          subtitle="Across all linked accounts"
        />
        <MetricCard
          title="Total Video & Post Views"
          value={summary.total_views ? summary.total_views.toLocaleString() : "1,480,000"}
          change="+24.1% MoM"
          isPositive={true}
          icon={Eye}
          color="cyan"
          subtitle="Blended 30-day cross-platform"
        />
        <MetricCard
          title="Monetization / YTD Revenue"
          value={`$${(summary.total_revenue || 38450).toLocaleString()}`}
          change="+$6.2k this month"
          isPositive={true}
          icon={DollarSign}
          color="emerald"
          subtitle="Sponsorships, AdSense & Deals"
        />
        <MetricCard
          title="Avg Engagement Rate"
          value={`${summary.engagement_rate || 7.64}%`}
          change="+1.8% vs benchmark"
          isPositive={true}
          icon={Activity}
          color="rose"
          subtitle="Industry benchmark: 3.2%"
        />
      </div>

      {/* Connected Accounts Live Bar */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Active Social Ingestion Feeds</h3>
            <p className="text-xs text-slate-400">Live OAuth & Data API Connections</p>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{accounts.length} Channels Connected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="glass-card p-4 flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 border border-white/10">
                  {getPlatformIcon(acc.platform)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{acc.account_handle}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-[11px] text-slate-400">{acc.follower_count.toLocaleString()} Followers</span>
                </div>
              </div>

              <button
                onClick={() => handleSyncAccount(acc.id, acc.platform)}
                disabled={syncingId === acc.id}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-indigo-400 transition-colors"
                title="Trigger Live Sync"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncingId === acc.id ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends Chart */}
      <TrendChart 
        data={overview?.growth_trend || []} 
        title="30-Day Multi-Platform Growth Trajectory" 
        subtitle="Automated API polling and subscriber analytics"
      />

      {/* AI Recommendations Module */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              AI Content & Growth Recommendations
            </h3>
            <p className="text-xs text-slate-400">Model-generated strategic insights tailored to your audience profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.slice(0, 4).map((rec) => (
            <div key={rec.id} className="glass-card p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {rec.category}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  Impact: {rec.impact}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{rec.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Connect Channel Modal */}
      {connectModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Connect Social Media Channel</h3>
            <p className="text-xs text-slate-400 mb-5">
              Link YouTube Data API v3, Instagram Graph API, or LinkedIn REST API.
            </p>

            <form onSubmit={handleConnectAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Social Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'youtube', label: 'YouTube', icon: YoutubeIcon, color: 'text-red-500' },
                    { id: 'instagram', label: 'Instagram', icon: InstagramIcon, color: 'text-pink-500' },
                    { id: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, color: 'text-blue-500' }
                  ].map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setSelectedPlatform(p.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          selectedPlatform === p.id 
                            ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                            : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${p.color}`} />
                        <span className="text-xs font-semibold">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Account Handle or Channel ID
                </label>
                <input
                  type="text"
                  required
                  placeholder={selectedPlatform === 'youtube' ? '@AlexRiveraTech' : '@alexrivera'}
                  value={accountHandle}
                  onChange={(e) => setAccountHandle(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Connects to server API integration using configured server API keys.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                >
                  Confirm & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
