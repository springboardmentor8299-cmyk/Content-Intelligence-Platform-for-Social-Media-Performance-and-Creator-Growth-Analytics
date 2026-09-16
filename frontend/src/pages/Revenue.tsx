import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Download, DollarSign, TrendingUp, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Revenue() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/analytics/overview');
      if (res.ok) {
        setOverview(await res.json());
      }
    } catch (err) {
      console.error("Failed to load revenue data:", err);
    } finally {
      setLoading(false);
    }
  };

  const revenueKpi = overview?.kpis?.find((k: any) => k.id === 'actual_revenue' || k.id === 'est_revenue');
  const actualRev = revenueKpi?.value || '$0.00';
  const totalFollowersKpi = overview?.kpis?.find((k: any) => k.id === 'total_followers');
  const followersCount = parseInt(totalFollowersKpi?.value || '0', 10);
  const isMonetized = followersCount >= 1000;

  const trends = overview?.performance_trends || [];

  const revenueData = trends.map((t: any) => ({
    period: t.date,
    revenue: t.revenue || 0
  }));

  const HeaderActions = () => (
    <>
      <button 
        onClick={fetchRevenue}
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
      title="Revenue Analytics"
      subtitle="Real-time actual monetization revenue derived from live connected channels and verified partner payouts."
      headerActions={<HeaderActions />}
    >
      <div className="flex flex-col gap-6">
        {/* Revenue KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Actual Revenue</span>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold mb-2 text-gray-900">{actualRev}</div>
            <div className="text-xs text-gray-500">
              {isMonetized ? "Verified active monetization payout" : "Actual payout ($0.00 until 1,000 subscriber YPP threshold)"}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Monetization Status</span>
              {isMonetized ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
            </div>
            <div className="text-2xl font-bold mb-2 text-gray-900">
              {isMonetized ? "Monetized (YPP)" : "Threshold Pending"}
            </div>
            <div className="text-xs text-gray-500">
              {isMonetized ? "AdSense monetization active" : "Requires 1,000 subscribers for YouTube Partner Program"}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Connected Revenue Channels</span>
              <span className="text-xl">📡</span>
            </div>
            <div className="text-3xl font-bold mb-2 text-gray-900">
              {overview?.platform_distribution?.length || 0} Connected
            </div>
            <div className="text-xs text-gray-500">Active monetization data streams</div>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-base font-semibold mb-4 text-gray-900">Actual Revenue Trajectory</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${v.toFixed(2)}`, 'Actual Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
