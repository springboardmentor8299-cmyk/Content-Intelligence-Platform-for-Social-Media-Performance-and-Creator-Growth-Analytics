import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Globe, 
  Smartphone, 
  Clock, 
  PieChart as PieIcon, 
  TrendingUp,
  Monitor,
  Tablet,
  Eye,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip,
  AreaChart,
  Area,
  Legend,
  CartesianGrid
} from 'recharts';
import { fetchAudienceDemographics, fetchFollowerGrowth } from '../api';

export default function AudienceInsights({ platform }) {
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

  const GENDER_COLORS = ['#6366f1', '#ec4899', '#0ea5e9'];

  if (loading || !demographics) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-indigo-600 font-semibold animate-pulse text-xs">
        Loading Audience Demographics & Regional Reach Data...
      </div>
    );
  }

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
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Demo Audience Profile
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Understand who your viewers are, where they watch from, and how your audience is expanding.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Core Target Group:</span>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            25–34 Yrs (Telugu Diaspora & Regional)
          </span>
        </div>
      </div>

      {/* Audience Reach & Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Followers</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">1,525,000</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">+12.8% net monthly growth</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cumulative Reach</span>
            <Compass className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">2,460,000</div>
          <div className="text-[11px] text-slate-500 mt-1">Unique viewers reached</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Impressions</span>
            <Eye className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">3,240,000</div>
          <div className="text-[11px] text-slate-500 mt-1">Feeds & browse appearances</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Mobile Audience Share</span>
            <Smartphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display mt-2">76.5%</div>
          <div className="text-[11px] text-slate-500 mt-1">Android & iOS mobile viewers</div>
        </div>
      </div>

      {/* Follower Growth Trajectory Chart */}
      {growth.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Follower Growth Trajectory</h3>
                <p className="text-[11px] text-slate-500">Net audience accumulation across channels</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setGrowthDays(d)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    growthDays === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(val, name) => [val.toLocaleString(), name.toUpperCase()]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="total" name="Total Audience" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="youtube" name="YouTube" stroke="#dc2626" strokeWidth={1.5} fill="none" />
                <Area type="monotone" dataKey="instagram" name="Instagram" stroke="#db2777" strokeWidth={1.5} fill="none" />
                <Area type="monotone" dataKey="tiktok" name="TikTok" stroke="#0891b2" strokeWidth={1.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grid: Age Distribution & Gender Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Age Groups */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Age Distribution</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">Core: 18–34 (82.3%)</span>
          </div>

          <div className="h-60 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics.age} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'Audience Share']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="percentage" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-pink-600" />
              <h3 className="text-sm font-bold text-slate-900">Gender Distribution</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Sample Metrics</span>
          </div>

          <div className="h-60 mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographics.gender}
                  dataKey="percentage"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {demographics.gender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'Share']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div className="space-y-2 pr-4 text-xs">
              {demographics.gender.map((g, i) => (
                <div key={g.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GENDER_COLORS[i % GENDER_COLORS.length] }} />
                  <span className="text-slate-600 font-medium">{g.label}:</span>
                  <span className="font-bold text-slate-900">{g.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Device Breakdown & Geographic Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Device Usage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Device Usage</h3>
            </div>
            <span className="text-xs text-slate-500">Cross-Platform</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {demographics.device?.map((dev) => {
              const isMobile = dev.label.includes('Mobile');
              const isDesktop = dev.label.includes('Desktop');
              const DevIcon = isMobile ? Smartphone : isDesktop ? Monitor : Tablet;
              return (
                <div key={dev.label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center">
                  <div className={`p-2.5 rounded-xl mb-2 ${
                    isMobile ? 'bg-sky-100 text-sky-700' : isDesktop ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <DevIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 font-display">{dev.percentage}%</span>
                  <span className="text-[10px] text-slate-500 mt-1">{dev.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Over 76% of audience views originate on mobile devices (smartphones & short-form video apps).</span>
          </div>
        </div>

        {/* Top Geographic Locations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Geographic Distribution</h3>
            </div>
            <span className="text-xs text-slate-500">Regional & Diaspora</span>
          </div>

          <div className="mt-4 space-y-3">
            {demographics.country.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">{c.label}</span>
                  <span className="text-slate-900 font-bold">{c.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Active Hours Windows */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Active Audience Hours (Peak Engagement Windows)</h3>
          </div>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Optimal: 06:00 PM - 08:30 PM
          </span>
        </div>

        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demographics.active_hour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                formatter={(val) => [`${val}%`, 'Active Viewers']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="percentage" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
