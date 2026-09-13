import React from 'react';
import { Users, Eye, Compass, HeartHandshake, ArrowUpRight } from 'lucide-react';

export default function KPICards({ data }) {
  if (!data) return null;

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Exactly 4 Milestone 1 & 2 KPI cards — NO Revenue card
  const cards = [
    {
      title: 'Total Followers',
      value: formatNumber(data.total_followers || 1525000),
      change: `+${data.followers_growth_pct || 12.8}%`,
      subtext: 'Across 6 active social platforms',
      icon: Users,
      cardBg: 'bg-white',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    },
    {
      title: 'Total Views',
      value: formatNumber(data.total_views || 1873500),
      change: `+${data.views_growth_pct || 24.5}%`,
      subtext: 'Podcast episodes & video clips',
      icon: Eye,
      cardBg: 'bg-white',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    },
    {
      title: 'Total Reach',
      value: formatNumber(data.total_reach || (data.total_views ? Math.round(data.total_views * 1.35) : 2460000)),
      change: '+19.4%',
      subtext: 'Unique cumulative audience reached',
      icon: Compass,
      cardBg: 'bg-white',
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-100',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    },
    {
      title: 'Avg Engagement Rate',
      value: `${data.avg_engagement_rate || 7.68}%`,
      change: '+1.4%',
      subtext: 'Benchmark: top 5% podcast niche',
      icon: HeartHandshake,
      cardBg: 'bg-white',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-5 rounded-2xl border border-slate-200 shadow-2xs card-hover ${c.cardBg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.title}</span>
              <div className={`p-2 rounded-xl ${c.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                {c.value}
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${c.badgeBg}`}>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{c.change}</span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>{c.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
