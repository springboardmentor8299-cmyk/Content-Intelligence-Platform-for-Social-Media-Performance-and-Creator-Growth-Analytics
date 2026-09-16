import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, Eye, DollarSign, TrendingUp, Award, Download, RefreshCw, BarChart2, CheckCircle, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function AgencyDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'roster' | 'benchmarks' | 'payouts' | null;
  const [activeTab, setActiveTab] = useState<'roster' | 'benchmarks' | 'payouts'>(tabParam || 'roster');

  useEffect(() => {
    if (tabParam && (tabParam === 'roster' || tabParam === 'benchmarks' || tabParam === 'payouts')) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'roster' | 'benchmarks' | 'payouts') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [summary, setSummary] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchAgencyData();
  }, []);

  const fetchAgencyData = async () => {
    setLoading(true);
    try {
      const [sumRes, benchRes, payRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/creators/roster/summary'),
        fetch('http://localhost:8000/api/v1/creators/benchmark'),
        fetch('http://localhost:8000/api/v1/creators/payouts'),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (benchRes.ok) setBenchmarks(await benchRes.json());
      if (payRes.ok) setPayouts(await payRes.json());
    } catch (err) {
      console.error('Failed to load agency data:', err);
    } finally {
      setLoading(false);
    }
  };

  const creators = benchmarks?.creators || [];

  return (
    <DashboardLayout
      title="Agency Management Portal"
      subtitle="Unified talent roster tracking, performance benchmarking, and consolidated financial payouts."
      headerActions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAgencyData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors">
            <Download className="h-4 w-4" />
            Export Roster Report
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Roster KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Creators Managed</span>
              <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{summary?.total_creators || 4}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="h-3.5 w-3.5" /> 100% Active
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Exclusive Talent Agency Roster</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Combined Reach</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Eye className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {summary?.combined_followers ? `${(summary.combined_followers / 1000).toFixed(1)}K` : '981.5K'}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +16.7%
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Total cross-platform audience</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Creator Revenue</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ${summary?.gross_creator_revenue?.toLocaleString() || '70,900'}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +22.4%
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Monthly aggregate talent revenue</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Agency Net Commission</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-700">
                ${summary?.agency_net_commission?.toLocaleString() || '12,444'}
              </span>
              <span className="text-xs font-semibold text-purple-600">Avg 17.5%</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Retained agency contract margin</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('roster')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'roster'
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Talent Roster ({creators.length})
          </button>
          <button
            onClick={() => handleTabChange('benchmarks')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'benchmarks'
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Performance Benchmarking
          </button>
          <button
            onClick={() => handleTabChange('payouts')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'payouts'
                ? 'border-cyan-600 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Financial Payouts & Commission
          </button>
        </div>

        {/* Tab Content: Roster */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Managed Creator Profiles</h3>
                <p className="text-xs text-gray-500 mt-0.5">Overview of active talent roster contracts, engagement, and reach.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-5 py-3">Creator</th>
                    <th className="px-4 py-3">Niche</th>
                    <th className="px-4 py-3">Total Followers</th>
                    <th className="px-4 py-3">Monthly Views</th>
                    <th className="px-4 py-3">Avg ER</th>
                    <th className="px-4 py-3">Monthly Revenue</th>
                    <th className="px-4 py-3">Contract Status</th>
                    <th className="px-4 py-3">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {creators.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="h-9 w-9 rounded-full object-cover border" />
                        <div>
                          <p className="font-semibold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.handle}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">{c.niche}</td>
                      <td className="px-4 py-3.5 text-gray-900 font-semibold">{c.total_followers.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-gray-600">{(c.monthly_views / 1000000).toFixed(1)}M</td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                          {c.avg_engagement}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900">${c.monthly_revenue.toLocaleString()}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                          <CheckCircle className="h-3 w-3 text-cyan-600" />
                          {c.contract_status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">{c.commission_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Benchmarking */}
        {activeTab === 'benchmarks' && (
          <div className="flex flex-col gap-6">
            {/* Benchmark Comparison Chart */}
            <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-base font-bold text-gray-900 mb-1">Roster Revenue & Engagement Benchmark</h3>
              <p className="text-xs text-gray-500 mb-6">Compare talent earnings vs average audience engagement across platforms.</p>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={creators} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" stroke="#0891b2" fontSize={12} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="monthly_revenue" name="Monthly Revenue ($)" fill="#0891b2" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="avg_engagement" name="Engagement Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Benchmark Highs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {benchmarks?.benchmarks?.map((b: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border p-4 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{b.metric}</p>
                  <p className="text-xl font-bold text-cyan-800 mt-2">{b.top_value}</p>
                  <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                    <span>Top: <strong className="text-gray-900">{b.top_performer}</strong></span>
                    <span className="text-gray-400">Roster Avg: {b.agency_avg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Payouts */}
        {activeTab === 'payouts' && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Talent Payout Statements</h3>
                <p className="text-xs text-gray-500 mt-0.5">Calculated net creator payouts after agency commission withholding.</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                Next Payout Cycle: Sep 30, 2026
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-5 py-3">Creator</th>
                    <th className="px-4 py-3">Gross Earnings</th>
                    <th className="px-4 py-3">Commission %</th>
                    <th className="px-4 py-3">Agency Fee</th>
                    <th className="px-4 py-3">Net Creator Payout</th>
                    <th className="px-4 py-3">Scheduled Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payouts.map((p: any) => (
                    <tr key={p.creator_id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <img src={p.avatar} alt={p.creator_name} className="h-8 w-8 rounded-full object-cover border" />
                        <div>
                          <p className="font-semibold text-gray-900">{p.creator_name}</p>
                          <p className="text-xs text-gray-400">{p.handle}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900">${p.gross_earnings.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-gray-600 font-medium">{p.commission_rate}%</td>
                      <td className="px-4 py-3.5 font-semibold text-purple-700">${p.agency_fee.toLocaleString()}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-700">${p.net_payout.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">{p.payout_date}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status}
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
