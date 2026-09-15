import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Trophy, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  Clock, 
  Award,
  X,
  CheckCircle2
} from 'lucide-react';
import { compareContent } from '../api';

export default function ContentComparison({ allContent, selectedIds, onToggleSelect, onClear }) {
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedIds.length >= 2) {
      runComparison();
    } else {
      setComparisonResult(null);
    }
  }, [selectedIds]);

  const runComparison = async () => {
    setLoading(true);
    try {
      const res = await compareContent(selectedIds);
      setComparisonResult(res.data);
    } catch (err) {
      console.error("Comparison failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Post Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <GitCompare className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Content Comparison</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select 2 to 4 episodes/posts to evaluate views, engagement variance, and retention metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">
              Selected: <strong className="text-indigo-600">{selectedIds.length}</strong> / 4
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={onClear}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Selection Carousel */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Click to add / remove posts from comparison:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {allContent.slice(0, 5).map((item) => {
              const active = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => onToggleSelect(item.id)}
                  className={`p-2.5 rounded-xl cursor-pointer border transition text-left flex flex-col justify-between ${
                    active
                      ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 ring-1 ring-indigo-300'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <img
                    src={item.thumbnail_url || '/rawtalks_avatar.jpg'}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.target.src = '/rt_logo.svg'; }}
                    className="w-full h-18 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="mt-2 text-[11px] font-semibold line-clamp-1">{item.title}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="capitalize font-medium">{item.platform}</span>
                    <span className="font-bold text-slate-900">{(item.views / 1000).toFixed(0)}k views</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {selectedIds.length < 2 ? (
        <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
          <GitCompare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">Select at least 2 posts above to compare</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Evaluate performance differences side by side across views, engagement rate, shares, and watch time.
          </p>
        </div>
      ) : loading ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-indigo-600 font-semibold animate-pulse text-xs">
          Computing content performance comparison...
        </div>
      ) : comparisonResult ? (
        <div className="space-y-6">
          {/* Top Performer Banner */}
          <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Top Performing Post in Selection
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {comparisonResult.items.find(x => x.id === comparisonResult.winner_id)?.title}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">Performance Score</span>
              <div className="text-lg font-black text-amber-900 font-display">
                {comparisonResult.metric_analysis?.scores?.[comparisonResult.winner_id]?.toLocaleString() || 'Top'} pts
              </div>
            </div>
          </div>

          {/* Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonResult.items.map((item) => {
              const isWinner = item.id === comparisonResult.winner_id;
              return (
                <div
                  key={item.id}
                  className={`bg-white p-5 rounded-2xl border relative flex flex-col justify-between shadow-2xs ${
                    isWinner 
                      ? 'border-amber-300 ring-2 ring-amber-200' 
                      : 'border-slate-200'
                  }`}
                >
                  {isWinner && (
                    <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-xs">
                      Highest Overall Impact 👑
                    </div>
                  )}

                  <div>
                    <img
                      src={item.thumbnail_url || '/rawtalks_avatar.jpg'}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.target.src = '/rt_logo.svg'; }}
                      className="w-full h-36 rounded-xl object-cover border border-slate-200"
                    />

                    <div className="mt-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {item.platform}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 mt-1 line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    {/* Metric Comparison Rows */}
                    <div className="mt-4 space-y-2 text-xs divide-y divide-slate-100">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Public Views:</span>
                        <span className="font-bold text-slate-900">{item.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Engagement Rate:</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">{item.engagement_rate}%</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Public Likes:</span>
                        <span className="font-bold text-slate-800">{item.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> Shares:</span>
                        <span className="font-bold text-slate-800">{item.shares.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Watch Time:</span>
                        <span className="font-bold text-slate-800">
                          {item.watch_time_hours > 0 ? `${item.watch_time_hours} hrs` : 'Creator access required'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Score Rating</span>
                    <span className="font-bold text-indigo-600">
                      {comparisonResult.metric_analysis?.scores?.[item.id]?.toLocaleString()} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance Comparison Takeaways */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Comparative Analytics Summary</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <p>• <strong>Audience Retention:</strong> The leading episode registered above-average watch duration, pointing to strong viewer interest in in-depth Telugu founder and creator stories.</p>
              <p>• <strong>Share & Save Ratio:</strong> Short-form clips drove elevated peer-to-peer distribution, boosting discovery for long-form episodes.</p>
              <p>• <strong>Key Takeaway:</strong> Pairing long-form interview discussions with highlight clips generates maximum cross-platform audience growth.</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
