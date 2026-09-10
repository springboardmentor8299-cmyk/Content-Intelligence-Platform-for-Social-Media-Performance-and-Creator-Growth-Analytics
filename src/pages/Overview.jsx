import React from 'react';
import {
  Users,
  Eye,
  TrendingUp,
  DollarSign,
  Flame,
  Award,
  Sparkles,
  RefreshCw,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { ChartCard } from '../components/common/ChartCard';
import { PerformanceLineChart } from '../components/charts/PerformanceLineChart';
import { DataTable } from '../components/common/DataTable';
import {
  PERFORMANCE_SERIES,
  CONTENT_ITEMS,
  SPONSOR_DEALS,
} from '../utils/mockData';
import { useDashboard } from '../context/DashboardContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Overview = () => {
  const { realTimeSim, setRealTimeSim } = useDashboard();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. CREATOR PROFILE CARD */}
      <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Creator Profile Visual & Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <img
                src={user?.avatar || '/cat_boss.png'}
                alt={user?.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-200 dark:border-white/15 relative z-10 shadow-md"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <span className="absolute -bottom-2 -right-2 z-20 w-6 h-6 rounded-full bg-[#00C897] border-2 border-white dark:border-[#0A0E1A] flex items-center justify-center shadow-lg" title="Live Status: Online & Syncing">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </span>
            </div>

            {/* Title & Creator Attributes */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#00C897]/15 text-[#00C897] font-mono text-xs font-bold border border-[#00C897]/30 flex items-center gap-1.5">
                  <Zap size={13} className="fill-[#00C897]" />
                  Health Score: 96/100 (Peak Momentum)
                </span>
                <span className="px-3 py-1 rounded-full bg-[#4A7CF7]/15 text-[#4A7CF7] dark:text-[#00D4FF] font-mono text-xs font-bold border border-[#4A7CF7]/30">
                  {user?.tier || 'PRO Creator'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {user?.name || 'Mister Cat'} 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#8B9BB5] flex flex-wrap items-center gap-3">
                <span className="font-mono text-[#4A7CF7] dark:text-[#00D4FF] font-semibold">{user?.handle || '@cat_boss'}</span>
                <span>•</span>
                <span>{user?.niche || 'Feline Tech, AI & Creative Coding'}</span>
              </p>
            </div>
          </div>

          {/* Profile Actions & Real-Time Sync Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0 pt-2 lg:pt-0">
            <button
              onClick={() => setRealTimeSim(!realTimeSim)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                realTimeSim
                  ? 'bg-[#00C897] text-white border-[#00C897] shadow-[#00C897]/30 font-bold'
                  : 'bg-slate-100 dark:bg-[#131929] text-slate-800 dark:text-white border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-[#1F2840]'
              }`}
            >
              <RefreshCw size={14} className={realTimeSim ? 'animate-spin' : ''} />
              <span>{realTimeSim ? 'Pulse Active' : 'Enable Real-time Pulse'}</span>
            </button>

            <button
              onClick={() => navigate('/connect')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] text-white font-bold text-xs shadow-md border border-white/20 flex items-center gap-2 hover:opacity-95 transition-all"
            >
              <ExternalLink size={14} />
              <span>Manage Integrations</span>
            </button>
          </div>
        </div>

        {/* Profile Metrics Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/10 relative z-10">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131929] border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-[#8B9BB5]">Total Audience</span>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">1.48M</div>
            <span className="text-[10px] text-[#00C897] font-mono flex items-center gap-0.5">+14.8% this month</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131929] border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-[#8B9BB5]">Est. Monthly Rev</span>
            <div className="text-base sm:text-lg font-extrabold text-[#00C897] font-mono mt-0.5">$42,850</div>
            <span className="text-[10px] text-[#00C897] font-mono flex items-center gap-0.5">+22.4% payout speed</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131929] border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-[#8B9BB5]">Avg Engagement</span>
            <div className="text-base sm:text-lg font-extrabold text-[#4A7CF7] dark:text-[#00D4FF] font-mono mt-0.5">6.42%</div>
            <span className="text-[10px] text-[#4A7CF7] dark:text-[#00D4FF] font-mono flex items-center gap-0.5">Top 1% in Niche</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131929] border border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-[#8B9BB5]">Active Sponsor Deals</span>
            <div className="text-base sm:text-lg font-extrabold text-[#7C5CFC] font-mono mt-0.5">4 Brands</div>
            <span className="text-[10px] text-[#7C5CFC] font-mono flex items-center gap-0.5">$31,000 Pipeline</span>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard
          title="Total Reach & Audience"
          value="1,485,000"
          change="+14.8%"
          isPositive={true}
          icon={Users}
          color="#00C897"
          sparklineData={[1420, 1426, 1431, 1439, 1448, 1462, 1485]}
          tooltip="Combined follower count across YouTube, Instagram, Facebook, X, and LinkedIn."
        />
        <KpiCard
          title="Avg Engagement Rate"
          value="6.42%"
          change="+0.8%"
          isPositive={true}
          icon={TrendingUp}
          color="#00D4FF"
          sparklineData={[5.2, 5.8, 5.4, 6.9, 7.4, 6.1, 7.8, 8.5, 8.9]}
          tooltip="Average cross-platform likes, comments, and shares per impression."
        />
        <KpiCard
          title="Est. Monthly Revenue"
          value="$42,850"
          change="+22.4%"
          isPositive={true}
          icon={DollarSign}
          color="#00C897"
          sparklineData={[32000, 34500, 36000, 39200, 41000, 42850]}
          tooltip="Estimated gross revenue from sponsors, AdSense, and affiliate sales."
        />
        <KpiCard
          title="30-Day Video Views"
          value="895,000"
          change="+18.3%"
          isPositive={true}
          icon={Eye}
          color="#FFB800"
          sparklineData={[420, 580, 510, 760, 890, 920, 1150, 1240]}
          tooltip="Total video and post impressions registered in the current billing period."
        />
      </div>

      {/* 3. PERFORMANCE CHART COMPONENT */}
      <ChartCard
        title="Cross-Platform Performance Trajectory"
        subtitle="Historical daily aggregation of views, revenue, and engagement trends"
        headerBadge="30 Days Telemetry"
      >
        <PerformanceLineChart data={PERFORMANCE_SERIES} />
      </ChartCard>

      {/* Grid: Top Content Highlights & Deal Pipeline Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Top Content Quick Showcase */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame size={18} className="text-[#FFB800]" />
              <span>Top Performing Content</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-[#8B9BB5]">Last 14 Days</span>
          </div>

          <DataTable data={CONTENT_ITEMS.slice(0, 4)} />
        </div>

        {/* Right (1 col): Active Sponsor Deals & Quick Insight Cards */}
        <div className="space-y-6">
          {/* Sponsor Deals Card */}
          <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-5 space-y-4 border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#00C897]" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Sponsor Deals</h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#00C897]">
                $31,000 Pipeline
              </span>
            </div>

            <div className="space-y-3">
              {SPONSOR_DEALS.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131929] border border-slate-200 dark:border-white/10 flex items-center justify-between hover:border-[#00C897]/40 transition-all text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{deal.brand}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-[#00C897]/15 text-[#4A7CF7] dark:text-[#00D4FF] border border-[#00C897]/30">
                        {deal.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#8B9BB5] mt-0.5">{deal.deliverable}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#00C897] font-mono">{deal.amount}</span>
                    <p className="text-[10px] text-slate-500 dark:text-[#8B9BB5]">{deal.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Creator Insights */}
          <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-5 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#4A7CF7] dark:text-[#00D4FF]">
              <Sparkles size={16} />
              <h4 className="text-xs font-bold uppercase tracking-wider">CreatorIQ AI Insights</h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-white leading-relaxed">
              Your <strong>YouTube Longform videos</strong> generate 4.2x higher RPM compared to shortform content. Consider posting 1 additional longform video next week during your peak Thursday 6 PM slot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
