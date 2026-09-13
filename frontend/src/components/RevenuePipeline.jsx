import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles,
  PieChart as PieIcon,
  Briefcase
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { fetchRevenueSummary, fetchDeals, createDeal } from '../api';

export default function RevenuePipeline() {
  const [summary, setSummary] = useState(null);
  const [deals, setDeals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [dealForm, setDealForm] = useState({
    title: '',
    brand_name: '',
    amount: '',
    source: 'sponsorship',
    status: 'pending'
  });

  const loadRevenue = async () => {
    setLoading(true);
    try {
      const [sumRes, dealsRes] = await Promise.all([
        fetchRevenueSummary(),
        fetchDeals(statusFilter)
      ]);
      setSummary(sumRes.data);
      setDeals(dealsRes.data);
    } catch (err) {
      console.error("Revenue loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, [statusFilter]);

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      await createDeal({
        ...dealForm,
        amount: parseFloat(dealForm.amount) || 0
      });
      setShowModal(false);
      setDealForm({
        title: '',
        brand_name: '',
        amount: '',
        source: 'sponsorship',
        status: 'pending'
      });
      loadRevenue();
    } catch (err) {
      console.error("Failed to create deal:", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending Payout</span>;
      case 'contracted':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Contract Signed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  if (loading || !summary) {
    return (
      <div className="p-12 glass-panel rounded-2xl border border-white/10 text-center text-indigo-400 animate-pulse">
        Calculating revenue models & sponsorship pipelines...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white font-display">Monetization & Sponsorship Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking Brand Collaborations, Ad Revenue, Affiliates, and Subscriptions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sponsorship Deal</span>
        </button>
      </div>

      {/* Revenue Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Total Gross Earnings</span>
          <div className="text-2xl font-extrabold text-white mt-1 font-display">
            ${summary.total_revenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">+18.2% vs last month</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-xs text-slate-400 font-medium">Deposited & Paid</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-display">
            ${summary.total_paid.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">In bank account</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <span className="text-xs text-slate-400 font-medium">Pending Payout</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-display">
            ${summary.total_pending.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Scheduled within 30 days</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5">
          <span className="text-xs text-slate-400 font-medium">Contracted Pipeline</span>
          <div className="text-2xl font-extrabold text-indigo-400 mt-1 font-display">
            ${summary.total_contracted.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Committed future deliverables</span>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white">Monthly Revenue Stream Trends ($)</h3>
            <p className="text-xs text-slate-400">Cross-channel sponsorship vs ad revenue trajectory</p>
          </div>
          <span className="text-xs text-indigo-300 font-bold">2026 Season</span>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.monthly_trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip 
                formatter={(val) => [`$${val.toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="sponsorships" name="Sponsorships" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ads" name="Ad Revenue" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="affiliate" name="Affiliates" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deals Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Active Deals & Revenue Ledger</h3>
            <p className="text-xs text-slate-400">All brand agreements, invoices, and payouts</p>
          </div>

          {/* Status Filter */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/5 text-xs">
            {['all', 'paid', 'pending', 'contracted'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                  statusFilter === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">Deal / Campaign</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Channel / Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {deal.title}
                  </td>
                  <td className="py-3.5 px-4 text-indigo-300 font-medium">
                    {deal.brand_name || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-400">
                    {deal.source.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-white font-display text-sm">
                    ${deal.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(deal.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400">
                    {new Date(deal.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative">
            <h3 className="text-base font-bold text-white font-display">Record New Sponsorship Deal</h3>
            <p className="text-xs text-slate-400 mt-1">Track upcoming contract deliverables and payouts</p>

            <form onSubmit={handleCreateDeal} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 60s Dedicated YouTube Video Sponsor"
                  value={dealForm.title}
                  onChange={(e) => setDealForm({...dealForm, title: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Notion, OpenAI, Linear"
                  value={dealForm.brand_name}
                  onChange={(e) => setDealForm({...dealForm, brand_name: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Deal Amount ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={dealForm.amount}
                    onChange={(e) => setDealForm({...dealForm, amount: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Source</label>
                  <select
                    value={dealForm.source}
                    onChange={(e) => setDealForm({...dealForm, source: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="sponsorship">Sponsorship</option>
                    <option value="brand_deal">Brand Collaboration</option>
                    <option value="ad_revenue">Ad Revenue</option>
                    <option value="affiliate">Affiliate</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Payout Status</label>
                <select
                  value={dealForm.status}
                  onChange={(e) => setDealForm({...dealForm, status: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="pending">Pending Payout</option>
                  <option value="contracted">Contract Signed</option>
                  <option value="paid">Paid & Deposited</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
