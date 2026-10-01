import React, { useState, useEffect } from 'react';
import client from '../api/client';
import DemographicsChart from '../components/charts/DemographicsChart';
import { 
  Globe2, 
  Clock
} from 'lucide-react';

const AudienceAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/api/v1/analytics/demographics')
      .then((res) => setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Audience Demographics & Growth</h1>
        <p className="text-xs text-slate-400 mt-1">Cross-channel viewer identities, active hours, and global breakdown</p>
      </div>

      {/* Age and Gender Charts */}
      <DemographicsChart 
        ageData={data?.age_distribution || []} 
        genderData={data?.gender || []} 
      />

      {/* Geographies & Active Hours Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Geographies */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-indigo-400" />
                Top Audience Geographies
              </h3>
              <p className="text-xs text-slate-400">Audience distribution by country</p>
            </div>
          </div>

          <div className="space-y-3">
            {data?.top_geographies?.map((geo) => (
              <div key={geo.country} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{geo.flag}</span>
                  <span className="text-xs font-semibold text-white">{geo.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${geo.share * 2}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-300 w-8 text-right">{geo.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Active Hours Heatmap */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-pink-400" />
                Peak Audience Activity (UTC)
              </h3>
              <p className="text-xs text-slate-400">Best publishing time windows based on audience activity</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {data?.active_hours?.map((h) => (
              <div key={h.time} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-center">
                <span className="block text-[11px] font-semibold text-slate-400">{h.time}</span>
                <span className="block text-base font-extrabold text-white mt-1">{h.activity}%</span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" 
                    style={{ width: `${h.activity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
            <strong>Optimal Posting Schedule:</strong> Friday & Saturday between <strong>15:00 - 18:00 UTC</strong> matches over 90% peak global audience availability.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceAnalytics;
