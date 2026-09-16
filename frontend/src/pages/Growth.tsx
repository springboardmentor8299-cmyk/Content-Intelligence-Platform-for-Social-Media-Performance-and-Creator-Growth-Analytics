import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Download, TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Growth() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrowth();
  }, []);

  const fetchGrowth = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/analytics/overview');
      if (res.ok) {
        setOverview(await res.json());
      }
    } catch (err) {
      console.error("Failed to load growth data:", err);
    } finally {
      setLoading(false);
    }
  };

  const trends = overview?.performance_trends || [];
  const platforms = overview?.platform_distribution || [];
  const totalFollowers = overview?.kpis?.find((k: any) => k.id === 'total_followers')?.value || '0';

  const HeaderActions = () => (
    <>
      <button 
        onClick={fetchGrowth}
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

  return (
    <DashboardLayout
      title="Growth & Trend Analysis"
      subtitle="Real-time predictive insights and trajectory modeling based on active channels."
      headerActions={<HeaderActions />}
    >
      <div className="flex flex-col gap-6">
        {/* Reach Prediction + Content Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Reach Prediction Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border shadow-sm"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Reach & Impression Trajectory</h3>
                <p className="text-xs mt-0.5 text-gray-500">Live trajectory across active connected channels</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trends} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [v.toLocaleString(), 'Views/Reach']} />
                <Area type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2}
                  fill="url(#reachGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Connected Channels Growth */}
          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-base font-semibold mb-1 text-gray-900">Audience Share</h3>
            <p className="text-xs mb-5 text-gray-500">Live platform breakdown</p>
            <div className="mb-4">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-gray-900">{totalFollowers}</span>
                <span className="mb-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Combined</span>
              </div>
              <p className="text-xs mt-2 text-gray-500">
                Audience count synced from verified social APIs.
              </p>
            </div>
            <div className="flex flex-col gap-4 mt-6">
              {platforms.length === 0 ? (
                <div className="text-xs text-gray-400">No platforms connected yet.</div>
              ) : (
                platforms.map((p: any) => (
                  <div key={p.platform}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700">{p.platform}</span>
                      <span className="text-sm font-semibold text-blue-600">{p.followers} followers ({p.share}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-full rounded-full transition-all" style={{ width: `${p.share}%`, background: p.color || '#2563eb' }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
