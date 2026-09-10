import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const DemographicsBarChart = ({ data = [] }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-recharts-tooltip">
          <p className="text-xs font-mono font-semibold text-white mb-1.5">
            Age Bracket: {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#8B9BB5]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white font-mono">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(74, 124, 247, 0.08)" vertical={false} />
          <XAxis
            dataKey="range"
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
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            formatter={(value) => <span className="text-[#8B9BB5]">{value}</span>}
          />
          <Bar dataKey="male" name="Male Audience" fill="#4A7CF7" radius={[4, 4, 0, 0]} />
          <Bar dataKey="female" name="Female Audience" fill="#00C897" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
