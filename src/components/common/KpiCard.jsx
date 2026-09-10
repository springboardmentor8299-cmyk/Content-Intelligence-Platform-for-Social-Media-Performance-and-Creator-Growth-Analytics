import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const KpiCard = ({
  title,
  value,
  change,
  isPositive = true,
  period = 'vs. last 30d',
  icon: Icon,
  sparklineData = [30, 45, 38, 52, 60, 55, 75],
  color = '#4A7CF7',
  tooltip = '',
}) => {
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 100;
  const height = 30;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white dark:bg-[#1A2233] hover:bg-slate-50 dark:hover:bg-[#1F2840] rounded-3xl p-5 relative overflow-hidden group border border-slate-200 dark:border-white/10 transition-all duration-200 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#131929] flex items-center justify-center shadow-inner"
              style={{ color: color }}
            >
              <Icon size={18} />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-500 dark:text-[#8B9BB5] tracking-wide uppercase font-mono">
            {title}
          </span>
        </div>

        {/* Change Badge */}
        {change && (
          <div
            className={`flex items-center gap-0.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isPositive
                ? 'bg-[#00C897]/15 text-[#00C897] border-[#00C897]/30 shadow-sm'
                : 'bg-[#FF4757]/15 text-[#FF4757] border-[#FF4757]/30 shadow-sm'
            }`}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline justify-between mt-2 relative z-10">
        <div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            {value}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-[#8B9BB5] mt-1 font-medium">{period}</p>
        </div>

        {/* Sparkline Visual */}
        {sparklineData && (
          <div className="w-24 h-8 shrink-0">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <path
                d={`M ${points}`}
                fill="none"
                stroke={isPositive ? '#00C897' : '#FF4757'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
