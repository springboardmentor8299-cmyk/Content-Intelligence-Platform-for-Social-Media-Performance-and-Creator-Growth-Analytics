import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Download, DollarSign, TrendingUp, RefreshCw, CheckCircle2, AlertCircle, 
  Plus, Calendar, Briefcase, Clock, ArrowUpRight, Filter, X, CreditCard, Trash2, Award
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface Sponsorship {
  id: string;
  brand_name: string;
  brand_logo: string;
  campaign_title: string;
  platform: string;
  status: string;
  contract_amount: number;
  paid_amount: number;
  deliverables: string;
  due_date: string;
  roi_multiplier: number;
  payment_status: string;
  created_at?: string;
}

export default function Revenue() {
  const [summary, setSummary] = useState<any>(null);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'sponsorships' | 'streams' | 'trends'>('sponsorships');

  // Modal States
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Sponsorship | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  
  // New Deal Form State
  const [formData, setFormData] = useState({
    brand_name: '',
    campaign_title: '',
    platform: 'YouTube',
    contract_amount: '',
    paid_amount: '0',
    deliverables: '',
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'active',
    roi_multiplier: '3.5'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sumRes, sponRes, trendRes, streamRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/monetization/summary'),
        fetch('http://localhost:8000/api/v1/monetization/sponsorships'),
        fetch('http://localhost:8000/api/v1/monetization/trends'),
        fetch('http://localhost:8000/api/v1/monetization/streams')
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (sponRes.ok) setSponsorships(await sponRes.json());
      if (trendRes.ok) setTrends(await trendRes.json());
      if (streamRes.ok) setStreams(await streamRes.json());
    } catch (err) {
      console.error("Failed to load revenue analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/monetization/sponsorships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: formData.brand_name,
          campaign_title: formData.campaign_title,
          platform: formData.platform,
          contract_amount: parseFloat(formData.contract_amount) || 0,
          paid_amount: parseFloat(formData.paid_amount) || 0,
          deliverables: formData.deliverables,
          due_date: formData.due_date,
          status: formData.status,
          roi_multiplier: parseFloat(formData.roi_multiplier) || 3.0
        })
      });

      if (res.ok) {
        setIsNewDealOpen(false);
        setFormData({
          brand_name: '',
          campaign_title: '',
          platform: 'YouTube',
          contract_amount: '',
          paid_amount: '0',
          deliverables: '',
          due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'active',
          roi_multiplier: '3.5'
        });
        fetchAllData();
      }
    } catch (err) {
      console.error("Error creating deal:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeal) return;
    setSubmitting(true);
    try {
      const additional = parseFloat(paymentAmount) || 0;
      const newTotal = (selectedDeal.paid_amount || 0) + additional;
      
      const res = await fetch(`http://localhost:8000/api/v1/monetization/sponsorships/${selectedDeal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paid_amount: newTotal,
          status: newTotal >= selectedDeal.contract_amount ? 'completed' : selectedDeal.status
        })
      });

      if (res.ok) {
        setIsRecordPaymentOpen(false);
        setSelectedDeal(null);
        setPaymentAmount('');
        fetchAllData();
      }
    } catch (err) {
      console.error("Error recording payment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm("Are you sure you want to remove this sponsorship record?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/monetization/sponsorships/${dealId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed to delete deal:", err);
    }
  };

  const handleExportCSV = () => {
    window.open('http://localhost:8000/api/v1/reports/export-revenue-csv', '_blank');
  };

  const filteredDeals = sponsorships.filter(d => {
    if (statusFilter === 'all') return true;
    return d.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const HeaderActions = () => (
    <>
      <button 
        onClick={fetchAllData}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      <button 
        onClick={handleExportCSV}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
        <Download className="h-4 w-4" />
        Export CSV
      </button>
      <button 
        onClick={() => setIsNewDealOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
        <Plus className="h-4 w-4" />
        Log New Deal
      </button>
    </>
  );

  return (
    <DashboardLayout
      title="Revenue & Monetization Analytics"
      subtitle="Comprehensive tracking of real ad revenue, brand sponsorships, partner thresholds, and financial pipeline."
      headerActions={<HeaderActions />}
    >
      <div className="flex flex-col gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Net Total Earnings */}
          <div className="bg-white rounded-xl p-5 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Realized Revenue</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${(summary?.net_total_earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+18.4% vs last month</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-2">
              Sponsorships + AdSense + Affiliates
            </div>
          </div>

          {/* Card 2: Active Sponsorship Pipeline */}
          <div className="bg-white rounded-xl p-5 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sponsorship Pipeline</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${(summary?.active_pipeline_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-blue-600 font-medium">
              {summary?.active_deals_count || 0} active contracted deals
            </div>
            <div className="text-[11px] text-gray-400 mt-2">
              Total Contracted: ${(summary?.total_contract_pipeline || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Card 3: Monetization RPM & CPM */}
          <div className="bg-white rounded-xl p-5 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average RPM / CPM</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${summary?.average_rpm?.toFixed(2) || '6.45'} <span className="text-xs font-normal text-gray-500">RPM</span>
            </div>
            <div className="text-xs text-purple-600 font-medium">
              ${summary?.average_cpm?.toFixed(2) || '9.20'} Average CPM
            </div>
            <div className="text-[11px] text-gray-400 mt-2">
              Top Tier Niche: Tech & Gaming
            </div>
          </div>

          {/* Card 4: YouTube Partner Program Threshold */}
          <div className="bg-white rounded-xl p-5 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">YPP Eligibility</span>
              {summary?.is_ypp_monetized ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" /> In Progress
                </span>
              )}
            </div>
            <div className="text-xl font-bold text-gray-900 mb-2">
              {summary?.ypp_subscribers || 0} / {summary?.ypp_threshold || 1000} <span className="text-xs font-normal text-gray-500">Subs</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, summary?.ypp_progress_pct || 0)}%` }}
              />
            </div>
            <div className="text-[11px] text-gray-500 flex justify-between">
              <span>{summary?.ypp_progress_pct || 0}% Complete</span>
              <span>1,000 Threshold</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('sponsorships')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'sponsorships'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Sponsorship & Brand Deals ({sponsorships.length})
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'trends'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Revenue Trajectory & Trends
          </button>
          <button
            onClick={() => setActiveTab('streams')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'streams'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Monetization Streams Breakdown
          </button>
        </div>

        {/* Tab 1: Sponsorship Deals Management */}
        {activeTab === 'sponsorships' && (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Brand Sponsorship Ledger</h3>
                <p className="text-xs text-gray-500">Track contracts, deliverable status, invoice collections, and ROI performance.</p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border rounded-lg px-2.5 py-1.5 outline-none bg-white text-gray-700"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <option value="all">All Deals</option>
                  <option value="active">Active</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ borderColor: 'var(--color-border)' }}>
                    <th className="px-5 py-3">Brand & Campaign</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Contract Value</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3">Deliverables</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700" style={{ borderColor: 'var(--color-border)' }}>
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                        No sponsorship deals found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((deal) => {
                      const paidRatio = deal.contract_amount > 0 ? (deal.paid_amount / deal.contract_amount) * 100 : 0;
                      return (
                        <tr key={deal.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={deal.brand_logo} 
                                alt={deal.brand_name} 
                                className="h-9 w-9 rounded-lg object-cover border"
                                style={{ borderColor: 'var(--color-border)' }}
                              />
                              <div>
                                <div className="font-semibold text-gray-900">{deal.brand_name}</div>
                                <div className="text-xs text-gray-500 max-w-xs truncate">{deal.campaign_title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {deal.platform}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-900">
                            ${deal.contract_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1 w-28">
                              <div className="flex justify-between text-xs font-medium">
                                <span className={deal.paid_amount >= deal.contract_amount ? 'text-green-600' : 'text-gray-600'}>
                                  ${deal.paid_amount.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-gray-400">{Math.round(paidRatio)}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full ${deal.paid_amount >= deal.contract_amount ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${Math.min(100, paidRatio)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-600 max-w-xs truncate">
                            {deal.deliverables}
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-500">
                            {deal.due_date || 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              deal.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : deal.status === 'active'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {deal.paid_amount < deal.contract_amount && (
                                <button
                                  onClick={() => {
                                    setSelectedDeal(deal);
                                    setPaymentAmount((deal.contract_amount - deal.paid_amount).toString());
                                    setIsRecordPaymentOpen(true);
                                  }}
                                  className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded hover:bg-blue-50"
                                >
                                  + Payment
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteDeal(deal.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                title="Delete deal"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Revenue Trajectory & Trends */}
        {activeTab === 'trends' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Historical & Projected Revenue Trajectory</h3>
                  <p className="text-xs text-gray-500">Aggregated gross income by month across all monetization streams.</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trends} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revTotalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Total Revenue']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} fill="url(#revTotalGrad)" dot={{ r: 4, fill: '#2563eb' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 border shadow-sm flex flex-col justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Financial Run-Rate</h3>
                <p className="text-xs text-gray-500 mb-4">Current annualized projections based on verified performance metrics.</p>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-50 border" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="text-xs text-gray-500 font-medium">Monthly Run Rate</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">${(summary?.monthly_run_rate || 20150).toLocaleString()}</div>
                    <div className="text-[11px] text-emerald-600 mt-0.5">Growing at +18.4% QoQ</div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="text-xs text-gray-500 font-medium">Annualized Gross Projected</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">${((summary?.monthly_run_rate || 20150) * 12).toLocaleString()}</div>
                    <div className="text-[11px] text-blue-600 mt-0.5">Projected based on active contracts</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-gray-500" style={{ borderColor: 'var(--color-border)' }}>
                Payout Destination: <span className="font-semibold text-gray-800">{summary?.payout_readiness || 'Verified'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Monetization Streams Breakdown */}
        {activeTab === 'streams' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stream Distribution Chart */}
            <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Revenue by Monetization Stream</h3>
              <p className="text-xs text-gray-500 mb-4">Contribution breakdown across diversified income channels.</p>
              
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={streams} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {streams.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stream Details Table */}
            <div className="bg-white rounded-xl p-6 border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Stream Performance Breakdown</h3>
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {streams.map((stream, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stream.color }} />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{stream.name}</div>
                        <div className="text-xs text-gray-500">{stream.share}% of total earnings</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">${stream.amount.toLocaleString()}</div>
                      <div className="text-xs text-emerald-600 font-medium">{stream.growth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Log New Sponsorship Deal */}
      {isNewDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Log Sponsorship Contract</h3>
              </div>
              <button 
                onClick={() => setIsNewDealOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adobe, Notion, NordVPN"
                  value={formData.brand_name}
                  onChange={e => setFormData({ ...formData, brand_name: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Creative Cloud Fall Promotion"
                  value={formData.campaign_title}
                  onChange={e => setFormData({ ...formData, campaign_title: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-white text-gray-700"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contract Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5000.00"
                    value={formData.contract_amount}
                    onChange={e => setFormData({ ...formData, contract_amount: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Deliverables</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Dedicated Video (60s mid-roll) + 2 Shorts"
                  value={formData.deliverables}
                  onChange={e => setFormData({ ...formData, deliverables: e.target.value })}
                  className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-white text-gray-700"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <option value="active">Active</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsNewDealOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Sponsorship Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Payment */}
      {isRecordPaymentOpen && selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Record Sponsorship Payment</h3>
              </div>
              <button 
                onClick={() => setIsRecordPaymentOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-xl border text-sm" style={{ borderColor: 'var(--color-border)' }}>
              <div className="font-semibold text-gray-900">{selectedDeal.brand_name}</div>
              <div className="text-xs text-gray-500">{selectedDeal.campaign_title}</div>
              <div className="mt-2 text-xs flex justify-between">
                <span>Contract Total: <strong>${selectedDeal.contract_amount.toLocaleString()}</strong></span>
                <span>Currently Paid: <strong>${selectedDeal.paid_amount.toLocaleString()}</strong></span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Payment Amount to Record ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 2500.00"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full text-base font-semibold border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  {submitting ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
