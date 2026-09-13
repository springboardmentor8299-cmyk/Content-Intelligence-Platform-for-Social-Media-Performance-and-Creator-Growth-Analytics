import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Hash, 
  Target, 
  ArrowUpRight, 
  Compass,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid 
} from 'recharts';
import { fetchGrowthForecast } from '../api';

export default function GrowthTrends({ platform = 'all' }) {
  const [forecastMonths, setForecastMonths] = useState(3);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Realistic Telugu podcast hashtag trend data (Sample / Demo Data)
  const hashtagList = [
    { tag: "#RawTalksWithVK", platform: "youtube", posts: 24, avg_views: 284000, multiplier: 2.8, status: "Trending" },
    { tag: "#TeluguPodcast", platform: "youtube", posts: 38, avg_views: 215000, multiplier: 2.4, status: "Trending" },
    { tag: "#TeluguEntrepreneurs", platform: "linkedin", posts: 16, avg_views: 42000, multiplier: 1.9, status: "High Growth" },
    { tag: "#TollywoodCinema", platform: "instagram", posts: 29, avg_views: 145000, multiplier: 2.1, status: "Viral" },
    { tag: "#HyderabadStartups", platform: "twitter", posts: 19, avg_views: 98000, multiplier: 1.8, status: "High Growth" },
    { tag: "#TeluguLifeLessons", platform: "tiktok", posts: 22, avg_views: 310000, multiplier: 3.2, status: "Viral" },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchGrowthForecast(forecastMonths);
      setForecastData(res.data);
    } catch (err) {
      console.error("Failed to load growth & trends:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [forecastMonths, platform]);

  if (loading || !forecastData) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-indigo-600 font-semibold animate-pulse text-xs">
        Loading Growth Trends & Historical Forecast...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Growth & Trend Analysis</h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Demo Forecast
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Follower velocity, cross-platform reach expansion, and forward trend projections.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setForecastMonths(3)}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                forecastMonths === 3 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              90-Day Outlook
            </button>
            <button
              onClick={() => setForecastMonths(6)}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                forecastMonths === 6 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              180-Day Outlook
            </button>
          </div>
        </div>
      </div>

      {/* Growth Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Projected Audience</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">
            {(forecastData.projections[forecastData.projections.length - 1]?.projected_followers / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
            Velocity: {forecastData.monthly_velocity} monthly
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Projected Reach</span>
            <Compass className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">
            {(forecastData.projections[forecastData.projections.length - 1]?.projected_reach / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 6 social platforms
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Publishing Consistency</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">
            3.5 uploads/wk
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
            Steady cadence maintained
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Engagement Growth</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">
            +1.4%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Above regional podcast average
          </div>
        </div>
      </div>

      {/* Main Forecast Chart & Growth Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Forecast Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Audience Growth & Reach Projections</h3>
              <p className="text-[11px] text-slate-500">Compound forward trajectory based on current growth velocity</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
              Sample Projection
            </span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData.projections} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(val, name) => [val.toLocaleString(), name === 'projected_reach' ? 'Projected Reach' : 'Projected Followers']}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
                  formatter={(v) => v === 'projected_reach' ? 'Projected Reach' : 'Projected Followers'}
                />
                <Area type="monotone" dataKey="projected_reach" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReach)" />
                <Area type="monotone" dataKey="projected_followers" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFollowers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestone Targets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Target className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Upcoming Milestones</h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Audience milestones based on historical growth trajectory.
            </p>

            <div className="mt-4 space-y-3">
              {[
                { target: "1.8M Total Followers", eta: "24 days", probability: "94%" },
                { target: "2.5M Monthly Views", eta: "42 days", probability: "88%" },
                { target: "1M YouTube Subscribers", eta: "58 days", probability: "82%" }
              ].map((m, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{m.target}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {m.probability} prob.
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>Target Timeline</span>
                    <span className="font-semibold text-indigo-700">in {m.eta}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full" 
                      style={{ width: `${90 - i * 12}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
            <span>Posting 3-4 podcast clips weekly maintains strong discovery on TikTok and Reels.</span>
          </div>
        </div>
      </div>

      {/* Trending Hashtag & Discovery Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Topic & Hashtag Discovery Performance</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Discovery efficiency and reach multiplier across regional podcast themes (Sample Data)
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200 self-start sm:self-auto">
            Top Tag: #RawTalksWithVK
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/75">
                <th className="py-3 px-4">Hashtag</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4 text-right">Avg Views</th>
                <th className="py-3 px-4 text-right">Reach Multiplier</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hashtagList.map((h, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-indigo-600 flex items-center gap-1">
                    <span>{h.tag}</span>
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-600">{h.platform}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-800">{h.avg_views.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">{h.multiplier}x</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      h.status === 'Viral'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : h.status === 'Trending'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
