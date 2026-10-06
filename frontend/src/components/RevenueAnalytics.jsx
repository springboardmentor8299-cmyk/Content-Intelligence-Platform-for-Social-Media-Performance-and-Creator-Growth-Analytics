import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles,
  PieChart as PieIcon,
  Briefcase,
  AlertCircle,
  Tag,
  Calendar,
  Filter,
  Search,
  Edit2,
  Trash2,
  X,
  Info,
  Layers,
  ArrowUpRight,
  ShieldAlert
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
import { 
  fetchRevenue, 
  fetchRevenueSummary, 
  createRevenueRecord, 
  updateRevenueRecord, 
  deleteRevenueRecord 
} from '../api';

export default function RevenueAnalytics() {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    brand_name: '',
    amount: '',
    source: 'sponsorship',
    status: 'paid',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, recsRes] = await Promise.all([
        fetchRevenueSummary(),
        fetchRevenue({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          source: sourceFilter !== 'all' ? sourceFilter : undefined,
          search: searchTerm || undefined
        })
      ]);
      setSummary(sumRes.data);
      setRecords(recsRes.data || []);
    } catch (err) {
      console.error("Failed to load revenue analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, sourceFilter, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (rec) => {
    setEditingRecord(rec);
    setFormData({
      title: rec.title,
      brand_name: rec.brand_name || '',
      amount: rec.amount,
      source: rec.source,
      status: rec.status,
      notes: rec.notes || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0
      };

      if (editingRecord) {
        await updateRevenueRecord(editingRecord.id, payload);
        setFeedbackMsg(`Updated "${formData.title}" successfully.`);
      } else {
        await createRevenueRecord(payload);
        setFeedbackMsg(`Added "${formData.title}" to revenue ledger.`);
      }

      setShowModal(false);
      setFormData(initialForm);
      setEditingRecord(null);
      await loadData();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error("Failed to save revenue record:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRevenueRecord(id);
      setDeleteConfirmId(null);
      setFeedbackMsg("Revenue deal removed.");
      await loadData();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error("Failed to delete revenue record:", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid & Deposited
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Payout
          </span>
        );
      case 'contracted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 w-fit">
            <Briefcase className="w-3 h-3 text-indigo-600" /> Contract Signed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 w-fit">
            {status}
          </span>
        );
    }
  };

  const getSourceBadge = (source) => {
    const s = source?.toLowerCase();
    if (s === 'sponsorship') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Sponsorship</span>;
    } else if (s === 'ad_revenue') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Ad Revenue</span>;
    } else if (s === 'affiliate') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Affiliate</span>;
    } else if (s === 'brand_deal') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Brand Collab</span>;
    } else if (s === 'subscription') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">Subscription</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{source}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Revenue Analytics</h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Milestone 3
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Monetization tracking across Sponsorships, Ad Revenue, Affiliate Marketing, Brand Collaborations, and Subscriptions.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Deal / Revenue</span>
        </button>
      </div>

      {/* Mandatory Data Honesty Banner */}
      <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Data Provenance Notice: </span>
          <span>
            Actual earnings for Raw Talks With VK are not publicly disclosed and are unverified. 
            All values on this page are clearly labeled as <strong className="underline">Demo Revenue Data / Manually Entered Revenue</strong> to demonstrate full financial tracking, invoicing status, and monetization analytics without fabricating actual creator income.
          </span>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Saved</span>
        </div>
      )}

      {/* Revenue KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Recorded Pipeline</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
              ${summary.total_revenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{summary.deals_count} active records</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Demo Data</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-2xs card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Deposited & Paid</span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-800 mt-2 font-display">
              ${summary.total_paid.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">
              Verified paid invoices
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-2xs card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Pending Payout</span>
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-800 mt-2 font-display">
              ${summary.total_pending.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600 mt-1">
              Scheduled within 30-day payout cycles
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 shadow-2xs card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Contracted Pipeline</span>
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-indigo-800 mt-2 font-display">
              ${summary.total_contracted.toLocaleString()}
            </div>
            <div className="text-[11px] text-indigo-600 mt-1">
              Committed future deliverables
            </div>
          </div>
        </div>
      )}

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Monthly Revenue Streams ($)</h3>
              <p className="text-xs text-slate-400">Trajectory across Sponsorships, Ad Revenue, and Brand Deals</p>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              Demo Pipeline
            </span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.monthly_trend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val) => [`$${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="sponsorships" name="Sponsorships" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ads" name="Ad Revenue" fill="#ec4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey="brand_deals" name="Brand Collabs" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="affiliate" name="Affiliates" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue By Source */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-display">Revenue by Source</h3>
              <PieIcon className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-4 space-y-3.5">
              {summary?.source_breakdown?.map((item) => (
                <div key={item.source}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.source}</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-slate-900">${item.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full rounded-full ${
                        item.source.toLowerCase().includes('sponsor') ? 'bg-indigo-600' :
                        item.source.toLowerCase().includes('ad') ? 'bg-rose-500' :
                        item.source.toLowerCase().includes('affiliate') ? 'bg-emerald-500' :
                        item.source.toLowerCase().includes('brand') ? 'bg-purple-600' : 'bg-sky-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-tight">
            * 5 distinct revenue sources supported in CreatorIQ data model.
          </div>
        </div>

      </div>

      {/* Revenue Records Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Revenue & Sponsorship Ledger</h3>
            <p className="text-xs text-slate-500">All brand agreements, invoices, campaign deliverables, and payouts</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deals, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition w-44"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid & Deposited</option>
              <option value="pending">Pending Payout</option>
              <option value="contracted">Contract Signed</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="sponsorship">Sponsorships</option>
              <option value="ad_revenue">Ad Revenue</option>
              <option value="affiliate">Affiliate Marketing</option>
              <option value="brand_deal">Brand Collaborations</option>
              <option value="subscription">Subscriptions</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-4">Deal / Campaign</th>
                <th className="py-3 px-4">Brand / Sponsor</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Amount ($)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400 text-xs">
                    No revenue records match the current filter.
                  </td>
                </tr>
              ) : (
                records.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {deal.title}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-indigo-700">
                      {deal.brand_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getSourceBadge(deal.source)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-display">
                      ${deal.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(deal.status)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {deal.date ? new Date(deal.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate text-[11px]" title={deal.notes}>
                      {deal.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(deal)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Edit Deal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(deal.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Deal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {editingRecord ? 'Edit Revenue Deal' : 'Record New Sponsorship / Revenue'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update contract deliverables, payout status, and notes
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Deal / Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 60s Dedicated Sponsor Segment"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Brand / Sponsor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hostinger, Zerodha, Rode"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="4500"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 font-display font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Revenue Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="sponsorship">Sponsorship</option>
                    <option value="ad_revenue">Ad Revenue</option>
                    <option value="affiliate">Affiliate Marketing</option>
                    <option value="brand_deal">Brand Collaboration</option>
                    <option value="subscription">Subscription Revenue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Payout Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="paid">Paid & Deposited</option>
                  <option value="pending">Pending Payout</option>
                  <option value="contracted">Contract Signed</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Campaign Notes / Terms</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Promo link placed in description, coupon code valid for 30 days"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
                >
                  {editingRecord ? 'Save Changes' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm p-5 rounded-2xl border border-slate-200 shadow-xl">
            <h4 className="text-sm font-bold text-slate-900 font-display">Delete Revenue Record?</h4>
            <p className="text-xs text-slate-500 mt-1">
              This will remove this deal from the recorded demo ledger and recalculate totals.
            </p>
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
              >
                Delete Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
