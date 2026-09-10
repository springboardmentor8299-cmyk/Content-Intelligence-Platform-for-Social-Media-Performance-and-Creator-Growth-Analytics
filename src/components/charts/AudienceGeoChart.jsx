import React from 'react';

export const AudienceGeoChart = ({ countries = [] }) => {
  return (
    <div className="space-y-3">
      {countries.map((c) => (
        <div key={c.country} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">{c.flag}</span>
              <span className="text-white font-medium">{c.country}</span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-[#8B9BB5]">{c.count}</span>
              <span className="text-[#4A7CF7] font-bold w-10 text-right">{c.percentage}%</span>
            </div>
          </div>
          <div className="w-full bg-[#0A0E1A] h-2 rounded-full overflow-hidden border border-[#4A7CF7]/10">
            <div
              className="h-full bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] rounded-full transition-all duration-500"
              style={{ width: `${c.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
