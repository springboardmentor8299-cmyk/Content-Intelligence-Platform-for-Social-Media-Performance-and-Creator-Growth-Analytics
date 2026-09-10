import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const PerformanceLineChart = ({ data = [] }) => {
  const [metric, setMetric] = useState('views'); // 'views' | 'revenue' | 'engagement'

  const getMetricConfig = () => {
    switch (metric) {
      case 'revenue':
        return {
          key: 'revenue',
          label: 'Revenue ($)',
          color: '#00D4FF',
          gradientId: 'colorRevenue',
          unit: '$',
          formatter: (v) => `$${v.toLocaleString()}`,
        };
      case 'engagement':
        return {
          key: 'engagement',
          label: 'Engagement Rate (%)',
          color: '#00C897',
          gradientId: 'colorEngagement',
          unit: '%',
          formatter: (v) => `${v}%`,
        };
      default:
        return {
          key: 'views',
          label: 'Total Views',
          color: '#4A7CF7',
          gradientId: 'colorViews',
          unit: '',
          formatter: (v) => v.toLocaleString(),
        };
    }
  };

  const config = getMetricConfig();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="custom-recharts-tooltip">
          <p className="text-xs font-mono font-semibold text-[#8B9BB5] mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-sm font-bold text-white font-mono">
              {config.formatter(val)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Metric Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-[#8B9BB5] font-medium">Metric Display:</span>
        <div className="flex items-center gap-1.5 bg-[#0A0E1A] p-1 rounded-xl border border-[#4A7CF7]/15">
          <button
            onClick={() => setMetric('views')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              metric === 'views'
                ? 'bg-[#4A7CF7] text-white font-bold shadow-sm shadow-[#4A7CF7]/30'
                : 'text-[#8B9BB5] hover:text-white'
            }`}
          >
            Views Trend
          </button>
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              metric === 'revenue'
                ? 'bg-[#00D4FF] text-black font-bold shadow-sm shadow-[#00D4FF]/30'
                : 'text-[#8B9BB5] hover:text-white'
            }`}
          >
            Revenue ($)
          </button>
          <button
            onClick={() => setMetric('engagement')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              metric === 'engagement'
                ? 'bg-[#00C897] text-black font-bold shadow-sm shadow-[#00C897]/30'
                : 'text-[#8B9BB5] hover:text-white'
            }`}
          >
            Engagement Rate
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 lg:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.45} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(74, 124, 247, 0.08)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#8B9BB5"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(74, 124, 247, 0.15)' }}
            />
            <YAxis
              stroke="#8B9BB5"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                return v;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#${config.gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
