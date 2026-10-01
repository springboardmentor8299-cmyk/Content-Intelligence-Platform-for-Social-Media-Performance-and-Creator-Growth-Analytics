import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const DemographicsChart = ({ ageData = [], genderData = [] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Age Distribution Bar Chart */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-bold text-white tracking-tight">Audience Age Distribution</h3>
        <p className="text-xs text-slate-400 mt-0.5 mb-6">Demographic breakdown across connected channels</p>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem' }}
                formatter={(value) => [`${value}%`, 'Percentage']}
              />
              <Bar dataKey="percentage" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Breakdown Panel */}
      <div className="glass-panel p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Gender Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5 mb-6">Aggregated viewer identity analytics</p>

          <div className="space-y-4">
            {genderData.map((g) => (
              <div key={g.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{g.name}</span>
                  <span className="text-white">{g.value}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${g.value}%`, backgroundColor: g.color || '#3b82f6' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
          <strong>Key Insight:</strong> 72% of audience falls between 18-34 years old, the prime demographic for brand direct response and sponsored product campaigns.
        </div>
      </div>
    </div>
  );
};

export default DemographicsChart;
