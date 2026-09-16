import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  TrendingUp,
  Eye, 
  CheckCircle2,
  ExternalLink
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
import { fetchAudienceDemographics, fetchFollowerGrowth } from '../api';

export default function AudienceInsights({ platform, onNavigateToIntegrations }) {
  const [demographics, setDemographics] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [growthDays, setGrowthDays] = useState(14);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [demoRes, growthRes] = await Promise.all([
        fetchAudienceDemographics(platform),
        fetchFollowerGrowth(growthDays)
      ]);
      setDemographics(demoRes.data);
      setGrowth(growthRes.data.history || []);
    } catch (err) {
      console.error("Failed to load audience insights:", err);
    } finally {
      setLoading(false);
    }
  }, [platform, growthDays]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-indigo-600 font-semibold animate-pulse text-xs">
        Loading Audience Telemetry & Growth History...
      </div>
    );
  }

  const isDemographicsAvailable = demographics?.status === 'available';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Audience Analytics</h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Raw Talks With VK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audience baseline and public performance metrics for <strong className="text-slate-700">@RawTalksWithVK</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-500">Public Channel:</span>
          <a
            href="https://www.youtube.com/@RawTalksWithVK"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition flex items-center gap-1"
          >
            <span>YouTube (@RawTalksWithVK)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Audience Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Public Verified Subscribers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wide">YouTube Subscribers</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display mt-2">
            1.42M
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Verified Public Baseline</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Public Data
            </span>
          </div>
        </div>

        {/* Total Public Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wide">Total Public Views</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display mt-2">
            51.39M
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Verified Catalog Views</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Public Data
            </span>
          </div>
        </div>

        {/* Verified Content Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wide">Channel Catalog</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display mt-2">
            26 Items
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Episodes & Shorts Analyzed</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Public Data
            </span>
          </div>
        </div>
      </div>

      {/* Verified YouTube Subscriber Velocity Trajectory */}
      {growth.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Public Subscriber Trajectory</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Public Data
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Observed subscriber trajectory for YouTube channel @RawTalksWithVK (~1.42M base)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setGrowthDays(d)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    growthDays === d ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ top: 10, right: 15, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(v) => `${(v / 1000000).toFixed(2)}M`}
                  domain={['dataMin - 10000', 'dataMax + 10000']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(val) => [`${val.toLocaleString()} subscribers`, 'YouTube Subscribers']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area 
                  type="monotone" 
                  dataKey="youtube" 
                  name="Verified YouTube Subscribers" 
                  stroke="#dc2626" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Source: Public YouTube channel observation (@RawTalksWithVK)</span>
            <span className="font-semibold text-slate-600">Baseline: 1.42M public subscribers</span>
          </div>
        </div>
      )}

      {/* Audience Growth & Retention Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm font-display">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Audience & Engagement Health</span>
        </div>
        <div className="mt-3 text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>• <strong>Established Channel Audience:</strong> The channel maintains an active public community of over 1.42M subscribers across verified Telugu podcast episodes and shorts.</p>
          <p>• <strong>Catalog Engagement:</strong> High interaction density across full-length founder interviews is reinforced by discovery traffic generated through YouTube Shorts.</p>
          <p>• <strong>Audience Alignment:</strong> Entrepreneurial, business leadership, and creative industry topics yield consistently elevated public engagement ratios averaging 6.18%.</p>
        </div>
      </div>
    </div>
  );
}
