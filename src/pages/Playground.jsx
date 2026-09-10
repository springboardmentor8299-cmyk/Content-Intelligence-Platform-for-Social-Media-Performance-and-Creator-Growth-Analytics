import React, { useState } from 'react';
import { Sliders, RefreshCw, Code, Palette } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartCard } from '../components/common/ChartCard';
import { PERFORMANCE_SERIES } from '../utils/mockData';

export const Playground = () => {
  const [chartType, setChartType] = useState('area'); // 'area' | 'line' | 'bar'
  const [accentColor, setAccentColor] = useState('#00C897');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showGrid, setShowGrid] = useState(true);
  const [dataPoints, setDataPoints] = useState(PERFORMANCE_SERIES);
  const [showCode, setShowCode] = useState(false);

  const handleRandomize = () => {
    const newData = dataPoints.map((item) => ({
      ...item,
      views: Math.floor(Math.random() * 80000) + 40000,
      revenue: Math.floor(Math.random() * 3000) + 1500,
      engagement: +(Math.random() * 4 + 5).toFixed(1),
    }));
    setDataPoints(newData);
  };

  const colors = [
    { label: 'Emerald Mint', value: '#00C897' },
    { label: 'Cyan Accent', value: '#00D4FF' },
    { label: 'Purple Accent', value: '#7C5CFC' },
    { label: 'Pink Accent', value: '#FF6B9D' },
    { label: 'Primary Blue', value: '#4A7CF7' },
    { label: 'Warning Yellow', value: '#FFB800' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-[#00C897]/15 text-[#00C897] font-mono text-xs font-bold border border-[#00C897]/30">
            Interactive Tooling
          </span>
        </div>
        <h1 className="text-2xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Chart & Theme Playground
        </h1>
        <p className="text-xs lg:text-sm text-slate-500 dark:text-[#8B9BB5] mt-1">
          Experiment with custom Recharts configurations, color gradients, line styles, and live simulated data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Controls Panel */}
        <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-6 space-y-6 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
            <Sliders size={18} className="text-[#00C897]" />
            <h3 className="text-sm font-bold">Chart Controls</h3>
          </div>

          {/* Chart Type Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-[#8B9BB5] uppercase font-mono">Chart Format</label>
            <div className="grid grid-cols-3 gap-2">
              {['area', 'line', 'bar'].map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`py-2 rounded-xl text-xs font-mono capitalize transition-all ${
                    chartType === type
                      ? 'bg-[#00C897] text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-[#0D1421] text-slate-600 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Palette Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-[#8B9BB5] uppercase font-mono flex items-center gap-1.5">
              <Palette size={14} className="text-[#00C897]" />
              <span>Accent Color</span>
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setAccentColor(c.value)}
                  className={`w-8 h-8 rounded-xl transition-all ${
                    accentColor === c.value
                      ? 'ring-2 ring-[#00C897] scale-110 shadow-md'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-[#8B9BB5]">Stroke Weight</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full accent-[#00C897] bg-slate-200 dark:bg-[#0D1421] rounded-lg cursor-pointer"
            />
          </div>

          {/* Grid Toggle */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#8B9BB5]">Cartesian Gridlines</span>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="w-4 h-4 accent-[#00C897] rounded cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
            <button
              onClick={handleRandomize}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00C897] to-[#00D4FF] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <RefreshCw size={14} />
              <span>Simulate Live Data Pulse</span>
            </button>
            <button
              onClick={() => setShowCode(!showCode)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#0D1421] border border-slate-200 dark:border-white/10 text-[#4A7CF7] dark:text-[#00D4FF] hover:text-slate-900 dark:hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Code size={14} />
              <span>{showCode ? 'Hide JSX Snippet' : 'View Recharts JSX Code'}</span>
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Live Canvas & JSX Snippet */}
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="Live Render Preview" subtitle={`Rendering Recharts ${chartType.toUpperCase()} Chart`}>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pgGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 200, 151, 0.15)" />}
                    <XAxis dataKey="date" stroke="#8B9BB5" fontSize={11} />
                    <YAxis stroke="#8B9BB5" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A2233', borderColor: accentColor }} />
                    <Area type="monotone" dataKey="views" stroke={accentColor} strokeWidth={strokeWidth} fill="url(#pgGradient)" />
                  </AreaChart>
                ) : chartType === 'line' ? (
                  <LineChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 200, 151, 0.15)" />}
                    <XAxis dataKey="date" stroke="#8B9BB5" fontSize={11} />
                    <YAxis stroke="#8B9BB5" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A2233', borderColor: accentColor }} />
                    <Line type="monotone" dataKey="views" stroke={accentColor} strokeWidth={strokeWidth} dot={{ r: 4, fill: accentColor }} />
                  </LineChart>
                ) : (
                  <BarChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 200, 151, 0.15)" />}
                    <XAxis dataKey="date" stroke="#8B9BB5" fontSize={11} />
                    <YAxis stroke="#8B9BB5" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A2233', borderColor: accentColor }} />
                    <Bar dataKey="views" fill={accentColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {showCode && (
            <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-5 border border-slate-200 dark:border-white/10 space-y-2 font-mono text-xs text-[#4A7CF7] dark:text-[#00D4FF] shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-[#8B9BB5]">
                <span>// Generated Recharts Component</span>
                <span>JSX</span>
              </div>
              <pre className="overflow-x-auto text-slate-900 dark:text-white text-[11px] leading-relaxed p-3 bg-slate-100 dark:bg-[#0D1421] rounded-xl border border-slate-200 dark:border-white/5">
                {`<ResponsiveContainer width="100%" height={320}>
  <${chartType === 'area' ? 'AreaChart' : chartType === 'line' ? 'LineChart' : 'BarChart'} data={data}>
    ${showGrid ? '<CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,151,0.15)" />' : ''}
    <XAxis dataKey="date" stroke="#8B9BB5" />
    <YAxis stroke="#8B9BB5" />
    <Tooltip />
    <${chartType === 'area' ? 'Area' : chartType === 'line' ? 'Line' : 'Bar'} dataKey="views" stroke="${accentColor}" strokeWidth={${strokeWidth}} fill="${accentColor}" />
  </${chartType === 'area' ? 'AreaChart' : chartType === 'line' ? 'LineChart' : 'BarChart'}>
</ResponsiveContainer>`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
