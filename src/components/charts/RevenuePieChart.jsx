import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const RevenuePieChart = ({ data = [] }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="custom-recharts-tooltip">
          <p className="text-xs font-semibold text-white mb-1">{item.name}</p>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-[#00D4FF] font-bold">${item.value.toLocaleString()}</span>
            <span className="text-[#00C897]">({item.payload.percentage}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Donut Chart */}
      <div className="h-64 w-full md:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(26, 34, 51, 0.8)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Structured Legend */}
      <div className="w-full md:w-1/2 space-y-2.5">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0E1A]/60 border border-[#4A7CF7]/10 hover:border-[#4A7CF7]/30 transition-all text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white font-medium truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-3 font-mono shrink-0">
              <span className="text-white font-bold">${item.value.toLocaleString()}</span>
              <span className="text-[11px] text-[#8B9BB5] w-8 text-right font-semibold">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
