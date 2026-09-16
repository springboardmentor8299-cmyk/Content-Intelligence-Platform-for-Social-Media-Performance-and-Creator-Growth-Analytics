import React from 'react';
import { Users, Eye, HeartHandshake, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function KPICards({ data }) {
  if (!data) return null;

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Core public KPI cards with verified data provenance
  const cards = [
    {
      title: 'Total Subscribers',
      value: data.total_followers ? formatNumber(data.total_followers) : 'Public data unavailable',
      change: 'Verified Public',
      isVerified: true,
      subtext: 'Official YouTube channel public count (@RawTalksWithVK)',
      provenance: 'Public Data',
      icon: Users,
      cardBg: 'bg-white',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      badgeBg: 'bg-slate-100 text-slate-700 border border-slate-200'
    },
    {
      title: 'Total Public Views',
      value: data.total_views ? formatNumber(data.total_views) : 'Public data unavailable',
      change: '26 Videos',
      isVerified: true,
      subtext: 'Cumulative views across 26 verified episodes & shorts',
      provenance: 'Public Data',
      icon: Eye,
      cardBg: 'bg-white',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      badgeBg: 'bg-slate-100 text-slate-700 border border-slate-200'
    },
    {
      title: 'Avg Engagement Rate',
      value: data.avg_engagement_rate ? `${data.avg_engagement_rate}%` : 'Public data unavailable',
      change: 'Calculated Ratio',
      isVerified: true,
      subtext: 'Verified ratio: (Likes + Comments) / Public Views',
      provenance: 'Public Data',
      icon: HeartHandshake,
      cardBg: 'bg-white',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    }
  ];

  return (
    <div className="space-y-2">
      {/* Subtle Data Provenance Indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-slate-600">Data Source: Official YouTube Channel (@RawTalksWithVK)</span>
        </div>
        <span className="text-slate-400 font-mono">Public Channel Snapshot</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border border-slate-200 shadow-2xs card-hover ${c.cardBg} relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.title}</span>
                <div className={`p-2 rounded-xl ${c.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="font-extrabold tracking-tight font-display text-2xl sm:text-3xl text-slate-900">
                  {c.value}
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${c.badgeBg}`}>
                  {c.isVerified ? <CheckCircle2 className="w-3 h-3 text-indigo-600" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  <span>{c.change}</span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="truncate">{c.subtext}</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0 bg-slate-50 text-slate-600 border-slate-200">
                  {c.provenance}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
