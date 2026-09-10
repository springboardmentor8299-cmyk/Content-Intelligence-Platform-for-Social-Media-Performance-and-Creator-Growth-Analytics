import React from 'react';
import { Video, Sparkles } from 'lucide-react';
import { DataTable } from '../components/common/DataTable';
import { CONTENT_ITEMS } from '../utils/mockData';

export const ContentAnalytics = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A7CF7]/15 text-[#4A7CF7] dark:text-[#00D4FF] font-mono text-xs font-bold border border-[#4A7CF7]/30">
            <Sparkles size={14} />
            <span>Content Telemetry Engine</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Content Analytics & Velocity
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-[#8B9BB5] max-w-2xl leading-relaxed">
            Deep-dive analysis into post performance, formats, engagement velocity, and audience retention metrics across all active creator channels.
          </p>
        </div>
      </div>

      {/* Format Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-[#1A2233] hover:bg-slate-50 dark:hover:bg-[#1F2840] rounded-3xl p-6 border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">YouTube Longform</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-[#FF4757]/15 text-[#FF4757] border border-[#FF4757]/30">
              YouTube
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">544,700</span>
            <span className="text-xs text-[#00C897] font-bold font-mono">+12.4%</span>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-[#8B9BB5]">
            <div className="flex justify-between">
              <span>Avg Watch Time:</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">9m 22s</span>
            </div>
            <div className="flex justify-between">
              <span>Avg RPM:</span>
              <span className="text-[#4A7CF7] dark:text-[#00D4FF] font-mono font-bold">$18.40</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A2233] hover:bg-slate-50 dark:hover:bg-[#1F2840] rounded-3xl p-6 border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Shorts & Reels</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-[#00D4FF]/15 text-[#4A7CF7] dark:text-[#00D4FF] border border-[#00D4FF]/30">
              IG & FB Reels
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">732,000</span>
            <span className="text-xs text-[#00C897] font-bold font-mono">+34.1%</span>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-[#8B9BB5]">
            <div className="flex justify-between">
              <span>Avg Engagement:</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">12.3%</span>
            </div>
            <div className="flex justify-between">
              <span>Shares / 1K views:</span>
              <span className="text-[#00C897] font-mono font-bold">38.4</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A2233] hover:bg-slate-50 dark:hover:bg-[#1F2840] rounded-3xl p-6 border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">X Threads & Posts</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-[#7C5CFC]/15 text-[#7C5CFC] border border-[#7C5CFC]/30">
              X / Twitter
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">185,400</span>
            <span className="text-xs text-[#00C897] font-bold font-mono">+8.2%</span>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-[#8B9BB5]">
            <div className="flex justify-between">
              <span>Click-Through Rate:</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">4.8%</span>
            </div>
            <div className="flex justify-between">
              <span>Repost Rate:</span>
              <span className="text-[#FFB800] font-mono font-bold">2.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full Content Performance Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video size={18} className="text-[#00C897]" />
            <span>All Published Content Repository</span>
          </h3>
          <span className="text-xs font-mono text-slate-500 dark:text-[#8B9BB5]">Showing 6 item(s)</span>
        </div>

        <DataTable data={CONTENT_ITEMS} title="Full Content Telemetry" />
      </div>
    </div>
  );
};
