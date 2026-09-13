import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PlatformFilter from './components/PlatformFilter';
import KPICards from './components/KPICards';
import TrendsChart from './components/TrendsChart';
import ContentTable from './components/ContentTable';
import ContentComparison from './components/ContentComparison';
import GrowthTrends from './components/GrowthTrends';
import AudienceInsights from './components/AudienceInsights';
import SocialIntegrations from './components/SocialIntegrations';
import AccountSettingsModal from './components/AccountSettingsModal';
import AuthPage from './components/AuthPage';
import { fetchOverview, fetchTrends, fetchContent, fetchUserProfile, switchRole } from './api';
import { 
  RefreshCw, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Clock, 
  Compass, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  Zap,
  Film
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentRole, setCurrentRole] = useState('creator');

  // Dashboard Navigation State (6 core items)
  const [currentTab, setCurrentTab] = useState('overview'); // overview, content, audience, growth, integrations
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [days, setDays] = useState(30);

  // Data State
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState([1, 2]); // default top 2 for comparison

  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Check stored JWT token on startup
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('creatoriq_token');
    if (!token) {
      setCurrentUser(null);
      setAuthChecking(false);
      return;
    }

    try {
      const res = await fetchUserProfile();
      setCurrentUser(res.data);
      setCurrentRole(res.data.role || 'creator');
    } catch (err) {
      console.warn("Stored token validation failed:", err);
      localStorage.removeItem('creatoriq_token');
      setCurrentUser(null);
    } finally {
      setAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setCurrentUser(null);
      setDataError('Session expired. Please sign in again.');
    };
    window.addEventListener('creatoriq:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('creatoriq:unauthorized', handleUnauthorized);
  }, [checkAuth]);

  // Load Main Analytics Data
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setDataError(null);
    try {
      const [overviewRes, trendsRes, contentRes] = await Promise.all([
        fetchOverview(selectedPlatform),
        fetchTrends(days, selectedPlatform),
        fetchContent({ platform: selectedPlatform })
      ]);
      setOverview(overviewRes.data);
      setTrends(trendsRes.data.trends || []);
      setContentList(contentRes.data || []);
      
      // If comparison has invalid items, select first two
      if (contentRes.data.length >= 2 && selectedComparisonIds.length === 0) {
        setSelectedComparisonIds([contentRes.data[0].id, contentRes.data[1].id]);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setDataError("Unable to load analytics from server. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedPlatform, days, selectedComparisonIds.length]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, selectedPlatform, days, currentRole, loadData]);

  // Auth Handlers
  const handleLoginSuccess = (token, user) => {
    setCurrentUser(user);
    setCurrentRole(user.role || 'creator');
    setDataError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('creatoriq_token');
    setCurrentUser(null);
    setCurrentTab('overview');
    setOverview(null);
    setTrends([]);
    setContentList([]);
  };

  const handleRoleChange = async (newRole) => {
    try {
      const res = await switchRole(newRole);
      localStorage.setItem('creatoriq_token', res.data.access_token);
      setCurrentRole(newRole);
      
      const userRes = await fetchUserProfile();
      setCurrentUser(userRes.data);
    } catch (err) {
      console.error("Role switch error:", err);
    }
  };

  // Content Comparison Handlers
  const handleToggleComparison = (id) => {
    if (selectedComparisonIds.includes(id)) {
      setSelectedComparisonIds(selectedComparisonIds.filter(x => x !== id));
    } else {
      if (selectedComparisonIds.length >= 4) {
        alert("You can compare up to 4 items simultaneously.");
        return;
      }
      setSelectedComparisonIds([...selectedComparisonIds, id]);
    }
  };

  const handleSelectForComparisonFromTable = (id) => {
    handleToggleComparison(id);
  };

  // Content Analytics Aggregates (Milestone 2 Content Metrics)
  const contentStats = useMemo(() => {
    if (!contentList || contentList.length === 0) return null;
    const views = contentList.reduce((acc, x) => acc + (x.views || 0), 0);
    const likes = contentList.reduce((acc, x) => acc + (x.likes || 0), 0);
    const comments = contentList.reduce((acc, x) => acc + (x.comments || 0), 0);
    const shares = contentList.reduce((acc, x) => acc + (x.shares || 0), 0);
    const saves = contentList.reduce((acc, x) => acc + (x.saves || 0), 0);
    const watchTime = contentList.reduce((acc, x) => acc + (x.watch_time_hours || 0), 0);
    const reach = contentList.reduce((acc, x) => acc + (x.reach || 0), 0);
    const avgEng = (contentList.reduce((acc, x) => acc + (x.engagement_rate || 0), 0) / contentList.length).toFixed(2);

    return { views, likes, comments, shares, saves, watchTime, reach, avgEng, totalPosts: contentList.length };
  }, [contentList]);

  // 1. Initial Authentication Check Loader
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-pulse">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-indigo-700 font-semibold tracking-wide">
            Initializing CreatorIQ Environment...
          </span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Render AuthPage
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Authenticated: Render Main 6-Tab Application
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <Navbar 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange} 
        onOpenSettings={() => setShowSettingsModal(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Sidebar Navigation (Exact 6 Items) */}
        <Sidebar 
          currentTab={currentTab} 
          onSelectTab={(tab) => setCurrentTab(tab)} 
          role={currentRole}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        {/* Primary Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-hidden">
          
          {/* Top Control Bar: Platform Filter & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <PlatformFilter 
              selectedPlatform={selectedPlatform} 
              onSelectPlatform={(p) => setSelectedPlatform(p)} 
            />

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                title="Refresh Analytics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Error Banner if API fails */}
          {dataError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-3 text-rose-700 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{dataError}</span>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Role Context Notification Bar (Agency / Marketing / Admin personas) */}
          {currentRole !== 'creator' && (
            <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-900 capitalize">
                    {currentRole.replace('_', ' ')} Persona View Active
                  </div>
                  <div className="text-[11px] text-indigo-700 mt-0.5">
                    {currentRole === 'agency' && 'Managing channel portfolio for Raw Talks With VK across regional Telugu podcast & video channels.'}
                    {currentRole === 'marketing_team' && 'Viewing campaign benchmarks, engagement health, and audience reach.'}
                    {currentRole === 'admin' && 'Administrator privileges: verified JWT session, role switching, and database status.'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRoleChange('creator')}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                Switch to Creator
              </button>
            </div>
          )}

          {/* TAB 1: MAIN DASHBOARD */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              {/* Creator Welcome Banner */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Creator Performance Overview</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-display tracking-tight">
                      Welcome back, {currentUser.full_name} 👋
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      Channel reach expanded by <strong className="text-emerald-600 font-semibold">+24.5%</strong> this period. Your recent podcast conversation with startup founders is pacing in your top 5% of uploads.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => setCurrentTab('content')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                    >
                      <Film className="w-4 h-4 text-indigo-600" />
                      <span>Content Analytics</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('audience')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Audience Insights</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Core M1/M2 KPI Cards (Followers, Views, Reach, Engagement Rate) */}
              <KPICards data={overview} />

              {/* Section 1: Content Performance Trends Chart */}
              <TrendsChart 
                trendsData={trends} 
                days={days} 
                onDaysChange={(d) => setDays(d)} 
              />

              {/* Section 2: Cross-Platform Breakdown Cards */}
              {overview?.platforms && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 font-display">Supported Platforms</h3>
                    <button 
                      onClick={() => setCurrentTab('integrations')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Manage Social Integrations →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {overview.platforms.map((p) => (
                      <div
                        key={p.platform}
                        onClick={() => setSelectedPlatform(p.platform)}
                        className={`p-4 rounded-xl border transition cursor-pointer bg-white shadow-2xs ${
                          selectedPlatform === p.platform
                            ? 'border-indigo-600 ring-1 ring-indigo-600'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 capitalize">{p.platform}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {p.engagement_rate}%
                          </span>
                        </div>
                        <div className="mt-2 text-lg font-extrabold text-slate-900 font-display">
                          {p.followers >= 1000 ? `${(p.followers / 1000).toFixed(0)}k` : p.followers}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {(p.views / 1000).toFixed(0)}k views • {p.posts_count} items
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Top Performing Content */}
              <ContentTable 
                contentList={contentList} 
                onSelectForComparison={handleSelectForComparisonFromTable} 
                selectedComparisonIds={selectedComparisonIds} 
              />
            </div>
          )}

          {/* TAB 2: CONTENT ANALYTICS */}
          {currentTab === 'content' && (
            <div className="space-y-6">
              {/* Content Analytics Header */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Film className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 font-display">Content Analytics</h2>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Milestone 2
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Comprehensive tracking across views, likes, comments, shares, saves, watch time, and engagement.
                    </p>
                  </div>
                </div>

                {/* Content Metrics Summary Strip (M2 Content KPI requirement) */}
                {contentStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6 pt-5 border-t border-slate-100 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3 text-indigo-600" /> Views
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-1 font-display">
                        {(contentStats.views / 1000).toFixed(0)}k
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 text-rose-600" /> Likes
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-1 font-display">
                        {(contentStats.likes / 1000).toFixed(1)}k
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <MessageSquare className="w-3 h-3 text-sky-600" /> Comments
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-1 font-display">
                        {contentStats.comments.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <Share2 className="w-3 h-3 text-emerald-600" /> Shares
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-1 font-display">
                        {(contentStats.shares / 1000).toFixed(1)}k
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <Bookmark className="w-3 h-3 text-amber-600" /> Saves
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-1 font-display">
                        {(contentStats.saves / 1000).toFixed(1)}k
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-purple-600" /> Watch Time
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-1 font-display">
                        {(contentStats.watchTime / 1000).toFixed(1)}k h
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <Compass className="w-3 h-3 text-blue-600" /> Reach
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-1 font-display">
                        {(contentStats.reach / 1000).toFixed(0)}k
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600" /> Eng. Rate
                      </div>
                      <div className="text-base font-extrabold text-emerald-700 mt-1 font-display">
                        {contentStats.avgEng}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Performance & Engagement Trends Chart */}
              <TrendsChart 
                trendsData={trends} 
                days={days} 
                onDaysChange={(d) => setDays(d)} 
              />

              {/* Content Items Table */}
              <ContentTable 
                contentList={contentList} 
                onSelectForComparison={handleSelectForComparisonFromTable} 
                selectedComparisonIds={selectedComparisonIds} 
              />

              {/* Content Comparison Workflow */}
              <ContentComparison 
                allContent={contentList} 
                selectedIds={selectedComparisonIds} 
                onToggleSelect={handleToggleComparison} 
                onClear={() => setSelectedComparisonIds([])} 
              />
            </div>
          )}

          {/* TAB 3: AUDIENCE ANALYTICS */}
          {currentTab === 'audience' && (
            <AudienceInsights platform={selectedPlatform} />
          )}

          {/* TAB 4: GROWTH & TRENDS */}
          {currentTab === 'growth' && (
            <GrowthTrends platform={selectedPlatform} />
          )}

          {/* TAB 5: SOCIAL INTEGRATIONS */}
          {currentTab === 'integrations' && (
            <SocialIntegrations />
          )}

        </main>
      </div>

      {/* Account Settings Modal */}
      <AccountSettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        onProfileUpdated={async () => {
          try {
            const res = await fetchUserProfile();
            setCurrentUser(res.data);
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </div>
  );
}
