import React from 'react';
import { Users, Globe, Clock, UserCheck, Heart, Sparkles } from 'lucide-react';
import { ChartCard } from '../components/common/ChartCard';
import { KpiCard } from '../components/common/KpiCard';
import { DemographicsBarChart } from '../components/charts/DemographicsBarChart';
import { AudienceGeoChart } from '../components/charts/AudienceGeoChart';
import { DEMOGRAPHICS } from '../utils/mockData';

export const AudienceAnalytics = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFC]/15 text-[#7C5CFC] dark:text-[#00D4FF] font-mono text-xs font-bold border border-[#7C5CFC]/30">
            <Sparkles size={14} />
            <span>Audience Demographics Telemetry</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Audience Insights & Demographics
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-[#8B9BB5] max-w-2xl leading-relaxed">
            Understand subscriber growth trajectory, age demographics, top geographic markets, and peak active viewing windows.
          </p>
        </div>
      </div>

      {/* Top Audience KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard
          title="Total Followers"
          value="1,485,000"
          change="+24.2K this month"
          isPositive={true}
          icon={Users}
          color="#00C897"
          sparklineData={[1420, 1435, 1450, 1468, 1485]}
        />
        <KpiCard
          title="Net Follower Growth"
          value="+24,200"
          change="+18.4%"
          isPositive={true}
          icon={UserCheck}
          color="#00D4FF"
          sparklineData={[320, 480, 520, 690, 840, 950]}
        />
        <KpiCard
          title="Primary Audience Age"
          value="25-34 yrs"
          change="46% of total"
          isPositive={true}
          icon={Heart}
          color="#FFB800"
          sparklineData={[40, 42, 45, 46]}
        />
        <KpiCard
          title="Top Country Share"
          value="United States"
          change="42% (623.7K)"
          isPositive={true}
          icon={Globe}
          color="#00C897"
          sparklineData={[38, 39, 41, 42]}
        />
      </div>

      {/* Grid: Demographics Bar Chart & Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Demographics Bar Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Age & Gender Breakdown"
            subtitle="Audience distribution across standard age brackets"
            headerBadge="Demographics"
          >
            <DemographicsBarChart data={DEMOGRAPHICS.ageGroup} />
          </ChartCard>
        </div>

        {/* Right 1 Col: Top Countries Geo Table */}
        <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-5 space-y-4 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#00C897]" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Top Geographic Markets</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#8B9BB5]">Global Reach</span>
          </div>

          <AudienceGeoChart countries={DEMOGRAPHICS.countries} />
        </div>
      </div>

      {/* Peak Activity Hours Heatmap Bar */}
      <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-6 border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#00C897]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Peak Audience Active Hours</h3>
          </div>
          <span className="text-xs text-[#4A7CF7] dark:text-[#00D4FF] font-mono font-bold">
            Best Slot: 6 PM - 9 PM EST
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2.5 pt-2">
          {DEMOGRAPHICS.peakHours.map((item) => (
            <div key={item.hour} className="flex flex-col items-center gap-2">
              <div className="w-full bg-slate-100 dark:bg-[#0D1421] h-28 rounded-2xl flex items-end p-1.5 border border-slate-200 dark:border-white/10">
                <div
                  className="w-full bg-gradient-to-t from-[#4A7CF7] via-[#00D4FF] to-[#00C897] rounded-xl transition-all duration-300 shadow-sm"
                  style={{ height: `${item.engagement}%` }}
                  title={`${item.hour}: ${item.engagement}% active`}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-[#8B9BB5] font-semibold">{item.hour}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
