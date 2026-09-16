import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Download, TrendingUp, Heart, Users, RefreshCw, BarChart2, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Audience() {
  const [overview, setOverview] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ovRes, demoRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/analytics/overview'),
        fetch('http://localhost:8000/api/v1/analytics/demographics')
      ]);
      if (ovRes.ok) setOverview(await ovRes.json());
      if (demoRes.ok) setDemographics(await demoRes.json());
    } catch (err) {
      console.error("Failed to load audience data:", err);
    } finally {
      setLoading(false);
    }
  };

  const followersKpi = overview?.kpis?.find((k: any) => k.id === 'total_followers');
  const totalFollowers = followersKpi?.value || '0';
  const erKpi = overview?.kpis?.find((k: any) => k.id === 'engagement_rate');
  const avgEr = erKpi?.value || '0.0%';

  const ageGroups = demographics?.age_groups || [];
  const countries = demographics?.top_countries || [];

  const HeaderActions = () => (
    <>
      <button 
        onClick={fetchData}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
        <Download className="h-4 w-4" />
        Export Report
      </button>
    </>
  );

  return (
    <DashboardLayout
      title="Audience Analytics"
      subtitle="Deep dive into demographic, geographic, and behavioral data across connected channels."
      headerActions={<HeaderActions />}
    >
      <div className="flex flex-col gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                TOTAL AUDIENCE SIZE
              </span>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-gray-900">{totalFollowers}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">Real combined audience from connected accounts</div>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                CONNECTED PLATFORMS
              </span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-gray-900">
                {overview?.platform_distribution?.length || 0} Active
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">Live OAuth channels connected</div>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                AVG. ENGAGEMENT RATE
              </span>
              <Heart className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-gray-900">{avgEr}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">Calculated from recent published content</div>
          </div>
        </div>

        {/* Age/Gender + Geo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Age Distribution */}
          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Age Distribution</h3>
            </div>
            {ageGroups.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageGroups} barCategoryGap={16}>
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Share']} />
                  <Bar dataKey="percentage" fill="#2563eb" radius={[4, 4, 0, 0]} name="Percentage" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg bg-gray-50/50">
                <BarChart2 className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-600">No demographic data available</p>
                <p className="text-xs text-gray-400 mt-1">Requires YouTube Analytics API audience reporting permissions.</p>
              </div>
            )}
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Geographic Distribution</h3>
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">Top Countries</span>
            </div>
            {countries.length > 0 ? (
              <div className="flex flex-col gap-4">
                {countries.map((g: any) => (
                  <div key={g.country}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{g.country}</span>
                      <span className="text-sm font-semibold text-gray-900">{g.share}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${g.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg bg-gray-50/50">
                <Globe className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-600">No geographic data available</p>
                <p className="text-xs text-gray-400 mt-1">Country metrics will populate as viewer locations are recorded.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
