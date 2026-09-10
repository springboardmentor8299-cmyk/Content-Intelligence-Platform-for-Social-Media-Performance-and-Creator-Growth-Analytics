import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Award, Sparkles } from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { ChartCard } from '../components/common/ChartCard';
import { RevenuePieChart } from '../components/charts/RevenuePieChart';
import { REVENUE_STREAMS, SPONSOR_DEALS } from '../utils/mockData';

export const RevenueAnalytics = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C897]/15 text-[#00C897] font-mono text-xs font-bold border border-[#00C897]/30">
            <Sparkles size={14} />
            <span>Monetization & Payout Telemetry</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Revenue & Monetization Cockpit
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-[#8B9BB5] max-w-2xl leading-relaxed">
            Financial dashboard tracking sponsorships, AdSense earnings, affiliate sales, and payout schedules with real-time stream auditing.
          </p>
        </div>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard
          title="Gross Monthly Revenue"
          value="$42,850"
          change="+22.4%"
          isPositive={true}
          icon={DollarSign}
          color="#00C897"
          sparklineData={[32000, 34500, 36000, 39200, 41000, 42850]}
        />
        <KpiCard
          title="Effective Channel RPM"
          value="$14.20"
          change="+$1.80 vs last mo"
          isPositive={true}
          icon={TrendingUp}
          color="#00D4FF"
          sparklineData={[11.5, 12.1, 12.8, 13.4, 14.2]}
        />
        <KpiCard
          title="Average CPM Rate"
          value="$28.50"
          change="+5.2%"
          isPositive={true}
          icon={CreditCard}
          color="#FFB800"
          sparklineData={[24.5, 26.0, 27.2, 28.5]}
        />
        <KpiCard
          title="Active Sponsor Pipeline"
          value="$31,000"
          change="4 Brand Deals"
          isPositive={true}
          icon={Award}
          color="#00C897"
          sparklineData={[18000, 22000, 26500, 31000]}
        />
      </div>

      {/* Monetization Breakdown Donut & Revenue Stream Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Donut Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Source Breakdown"
            subtitle="Income stream distribution across sponsorships, ads, and affiliates"
            headerBadge="August 2026"
          >
            <RevenuePieChart data={REVENUE_STREAMS} />
          </ChartCard>
        </div>

        {/* Right 1 Col: Payout Status & Next Payout Card */}
        <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-5 space-y-4 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-[#00C897]" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Payouts</h4>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#00C897]">Verified Vault</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131929] border border-slate-200 dark:border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Vercel Sponsorship</span>
                <span className="font-mono font-bold text-[#00C897]">$12,000</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8B9BB5]">Expected: Aug 28, 2026 (Stripe Direct)</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131929] border border-slate-200 dark:border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">YouTube AdSense</span>
                <span className="font-mono font-bold text-[#4A7CF7] dark:text-[#00D4FF]">$9,800</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8B9BB5]">Expected: Sep 21, 2026 (Google Wire)</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131929] border border-slate-200 dark:border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Linear Integration</span>
                <span className="font-mono font-bold text-[#FFB800]">$8,500</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8B9BB5]">Status: Invoice Sent (30 Days)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Sponsor Deals Pipeline Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award size={18} className="text-[#00C897]" />
          <span>Brand Deal Pipeline</span>
        </h3>

        <div className="overflow-x-auto bg-white dark:bg-[#1A2233] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0D1421] text-[11px] font-mono uppercase text-slate-500 dark:text-[#8B9BB5]">
                <th className="p-4 font-semibold">Brand Partner</th>
                <th className="p-4 font-semibold">Deal Tier</th>
                <th className="p-4 font-semibold">Deliverable</th>
                <th className="p-4 font-semibold">Contract Amount</th>
                <th className="p-4 font-semibold">Estimated Payout</th>
                <th className="p-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-xs">
              {SPONSOR_DEALS.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{deal.brand}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full font-mono text-[10px] bg-[#00C897]/15 text-[#4A7CF7] dark:text-[#00D4FF] border border-[#00C897]/30">
                      {deal.tier}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-[#8B9BB5]">{deal.deliverable}</td>
                  <td className="p-4 font-mono font-bold text-[#00C897]">{deal.amount}</td>
                  <td className="p-4 font-mono text-slate-500 dark:text-[#8B9BB5]">{deal.payoutDate}</td>
                  <td className="p-4 text-center font-semibold">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${
                        deal.status === 'Active' || deal.status === 'Completed'
                          ? 'bg-[#00C897]/15 text-[#00C897] border-[#00C897]/40'
                          : 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40'
                      }`}
                    >
                      {deal.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
