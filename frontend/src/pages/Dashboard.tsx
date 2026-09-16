import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Link } from 'react-router';
import { Download, Eye, Activity, DollarSign, Users, TrendingUp, TrendingDown, RefreshCw, Calendar, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

import { useAuth } from '@/contexts/AuthContext';
import AgencyDashboard from './agency/AgencyDashboard';
import MarketingDashboard from './marketing/MarketingDashboard';
import AdminDashboard from './admin/AdminDashboard';

const TIME_RANGES = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' },
  { label: 'All Time', value: 'all' },
];

export default function Dashboard() {
  const { profile } = useAuth();

  if (profile?.role === 'agency') {
    return <AgencyDashboard />;
  }
  if (profile?.role === 'marketing_team') {
    return <MarketingDashboard />;
  }
  if (profile?.role === 'admin') {
    return <AdminDashboard />;
  }

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchOverview(timeRange);
  }, [timeRange]);


  const fetchOverview = async (range = timeRange) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/analytics/overview?time_range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load overview analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const kpiIcons: Record<string, any> = {
    total_views: { icon: Eye, bg: 'bg-blue-50', color: 'text-blue-600' },
    engagement_rate: { icon: Activity, bg: 'bg-purple-50', color: 'text-purple-600' },
    actual_revenue: { icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    est_revenue: { icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    total_followers: { icon: Users, bg: 'bg-slate-50', color: 'text-slate-600' },
  };

  const HeaderActions = () => (
    <>
      <button 
        onClick={() => fetchOverview(timeRange)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
        <Download className="h-4 w-4" />
        Export
      </button>
    </>
  );

  const kpis = data?.kpis || [];
  const performanceTrends = data?.performance_trends || [];
  const platformDistribution = data?.platform_distribution || [];
  const recentContent = data?.recent_content || [];

  return (
    <DashboardLayout
      title="Overview Dashboard"
      subtitle="Real-time performance metrics across all connected platforms."
      headerActions={<HeaderActions />}
    >
      <div className="flex flex-col gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading && !data ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 border shadow-sm animate-pulse h-32" style={{ borderColor: 'var(--color-border)' }} />
            ))
          ) : (
            kpis.map((kpi: any) => {
              const meta = kpiIcons[kpi.id] || { icon: Eye, bg: 'bg-blue-50', color: 'text-blue-600' };
              const Icon = meta.icon;
              return (
                <div
                  key={kpi.id}
                  className="bg-white rounded-xl p-6 border shadow-sm hover:shadow transition-shadow"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-foreground-secondary)' }}>
                      {kpi.label}
                    </span>
                    <div className={`p-2 rounded-lg ${meta.bg}`}>
                      <Icon className={`h-5 w-5 ${meta.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                    {kpi.value}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {kpi.is_positive
                      ? <TrendingUp className="h-4 w-4 text-green-600" />
                      : <TrendingDown className="h-4 w-4 text-red-500" />
                    }
                    <span className={`text-xs font-semibold ${kpi.is_positive ? 'text-green-600' : 'text-red-500'}`}>
                      {kpi.change}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>{kpi.description}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Performance Trends */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border shadow-sm"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Performance Trends</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>Aggregated views across all connected platforms</p>
              </div>

              {/* Date Filter Buttons */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                {TIME_RANGES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTimeRange(t.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      timeRange === t.value
                        ? 'bg-white text-blue-600 shadow-sm font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={performanceTrends} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000000 ? `${v / 1000000}M` : v >= 1000 ? `${v / 1000}K` : String(v)} />
                <Tooltip
                  contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`, 'Views']}
                />
                <Area type="monotone" dataKey="views" stroke="#1d4ed8" strokeWidth={2}
                  fill="url(#viewsGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white rounded-xl p-6 border shadow-sm"
            style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-foreground)' }}>Platform Distribution</h3>
            <p className="text-xs mb-5" style={{ color: 'var(--color-foreground-muted)' }}>Audience share by network</p>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={platformDistribution} barCategoryGap={20}>
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, 'Share']} />
                <Bar dataKey="share" radius={[4, 4, 0, 0]}>
                  {platformDistribution.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color || '#2563eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              {platformDistribution.map((p: any) => (
                <div key={p.platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: p.color || '#2563eb' }} />
                    <span className="text-xs" style={{ color: 'var(--color-foreground-secondary)' }}>{p.platform}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>
                    {p.followers} followers ({p.share}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Top Performing Content</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>Latest videos and posts from your connected accounts</p>
            </div>
            <Link to="/content" className="text-sm font-medium text-blue-600 hover:underline">View All</Link>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {recentContent.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No videos found on your connected channels yet. Connect or upload videos to see real-time analytics.
              </div>
            ) : (
              recentContent.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block flex-shrink-0 group/img">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-16 h-12 rounded object-cover border group-hover/img:opacity-80 transition-opacity"
                          style={{ borderColor: 'var(--color-border)' }}
                        />
                      ) : (
                        <div className="w-16 h-12 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                          {item.platform}
                        </div>
                      )}
                    </a>
                  ) : (
                    item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-12 rounded object-cover border flex-shrink-0"
                        style={{ borderColor: 'var(--color-border)' }}
                      />
                    ) : (
                      <div className="w-16 h-12 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                        {item.platform}
                      </div>
                    )
                  )}
                  <div className="flex-1 min-w-0">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm truncate group-hover:text-blue-600 transition-colors flex items-center gap-1.5"
                        style={{ color: 'var(--color-foreground)' }}
                      >
                        {item.title}
                        <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                      </a>
                    ) : (
                      <h4 className="font-medium text-sm truncate group-hover:text-blue-600 transition-colors"
                        style={{ color: 'var(--color-foreground)' }}>
                        {item.title}
                      </h4>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 font-semibold">
                        {item.platform}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                        Published {item.published_at}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-8 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{item.views}</div>
                      <div className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>Views</div>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{item.likes}</div>
                      <div className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>Likes</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600">{item.engagement_rate}%</div>
                      <div className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>Eng. Rate</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
