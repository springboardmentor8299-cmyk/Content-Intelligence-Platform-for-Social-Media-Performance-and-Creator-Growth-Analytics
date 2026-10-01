import React, { useState, useEffect } from 'react';
import client from '../api/client';
import MetricCard from '../components/common/MetricCard';
import { 
  DollarSign, 
  Briefcase, 
  Plus, 
  Clock, 
  Tag 
} from 'lucide-react';

const RevenueAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: '',
    source_type: 'Sponsorship',
    amount: '',
    brand_name: '',
    status: 'Completed'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, recRes] = await Promise.all([
        client.get('/api/v1/revenue/summary'),
        client.get('/api/v1/revenue/records')
      ]);
      setSummary(sumRes.data);
      setRecords(recRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDeal = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/v1/revenue/records', {
        ...newDeal,
        amount: parseFloat(newDeal.amount)
      });
      setModalOpen(false);
      setNewDeal({ title: '', source_type: 'Sponsorship', amount: '', brand_name: '', status: 'Completed' });
      fetchData();
    } catch (e) {
      alert("Failed to add deal: " + (e.response?.data?.detail || e.message));
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Revenue & Sponsorship Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-stream monetization, AdSense, brand collaborations, and contracts</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          Record New Revenue Deal
        </button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Total Monetized Earnings"
          value={`$${(summary?.total_revenue || 38450).toLocaleString()}`}
          change="+$8,450 this month"
          isPositive={true}
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Pending / In-Pipeline Deals"
          value={`$${(summary?.pending_revenue || 6200).toLocaleString()}`}
          change="3 contracts pending"
          isPositive={true}
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Completed Brand Deals"
          value={records.length.toString()}
          change="Avg $12.5k / deal"
          isPositive={true}
          icon={Briefcase}
          color="indigo"
        />
      </div>

      {/* Revenue Breakdown by Source */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-bold text-white tracking-tight mb-4">Revenue Stream Diversification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summary?.by_source?.map((src) => (
            <div key={src.source} className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-xs font-semibold text-slate-400 block">{src.source}</span>
              <span className="text-xl font-bold text-white block mt-1">${src.amount.toLocaleString()}</span>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                <span>Contribution</span>
                <span className="font-semibold text-indigo-400">{src.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deals Record Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-base font-bold text-white tracking-tight">Tracked Monetization Contracts</h3>
          <span className="text-xs text-slate-500">{records.length} Contracts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Contract / Title</th>
                <th className="px-6 py-4">Brand / Partner</th>
                <th className="px-6 py-4">Stream Type</th>
                <th className="px-6 py-4 text-right">Deal Value</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{r.title}</td>
                  <td className="px-6 py-4">{r.brand_name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                      <Tag className="h-3 w-3" />
                      {r.source_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-400">
                    ${r.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      r.status.toLowerCase() === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400">
                    {new Date(r.deal_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Deal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Record New Revenue Deal</h3>
            <p className="text-xs text-slate-400 mb-5">Add a sponsorship deal, YouTube AdSense deposit, or affiliate payout.</p>

            <form onSubmit={handleAddDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q2 Sponsored Integration"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Revenue Stream</label>
                  <select
                    value={newDeal.source_type}
                    onChange={(e) => setNewDeal({ ...newDeal, source_type: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="AdSense">YouTube AdSense</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Merch">Merchandise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5000"
                    value={newDeal.amount}
                    onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand / Sponsor Name</label>
                <input
                  type="text"
                  placeholder="e.g. DigitalOcean, Notion"
                  value={newDeal.brand_name}
                  onChange={(e) => setNewDeal({ ...newDeal, brand_name: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueAnalytics;
