import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function TrendsChart({ trendsData, days, onDaysChange }) {
  const [activeMetric, setActiveMetric] = useState('views');

  const metrics = [
    { id: 'views', label: 'Views & Reach', color: '#6366f1', fill: 'url(#viewsGrad)', unit: '' },
    { id: 'engagement_rate', label: 'Engagement Rate', color: '#f43f5e', fill: 'url(#engGrad)', unit: '%' },
    { id: 'followers', label: 'Follower Growth', color: '#10b981', fill: 'url(#followersGrad)', unit: '' },
  ];

  const currentMetric = metrics.find(m => m.id === activeMetric);

  const formatYAxis = (value) => {
    if (activeMetric === 'engagement_rate') return `${value}%`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1">
          <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">{label}</div>
          <div className="text-indigo-600 font-semibold">
            Views: <span className="text-slate-900 font-bold">{data.views.toLocaleString()}</span>
          </div>
          <div className="text-rose-600 font-semibold">
            Engagement: <span className="text-slate-900 font-bold">{data.engagement_rate}%</span>
          </div>
          <div className="text-emerald-600 font-semibold">
            Followers: <span className="text-slate-900 font-bold">{data.followers.toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-0.5">Sample Analytics Data</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-display">Performance Trends</h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Demo Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous cross-platform views and engagement tracking over time
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
            {metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeMetric === m.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Days Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => onDaysChange(d)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  days === d
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="followersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: '#e2e8f0' }} 
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: '#e2e8f0' }} 
              tickFormatter={formatYAxis} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={currentMetric.color} 
              strokeWidth={2.5}
              fill={currentMetric.fill} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
