import React, { useState } from 'react';
import { 
  Film, 
  ArrowUpDown, 
  GitCompare,
  ExternalLink,
  CheckCircle2,
  Play
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, LinkedinIcon, TwitterIcon, TikTokIcon, FacebookIcon } from './SocialIcons';

export default function ContentTable({ 
  contentList, 
  onSelectForComparison, 
  selectedComparisonIds = [] 
}) {
  const [sortBy, setSortBy] = useState('views');
  const [filterType, setFilterType] = useState('all');

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube': return <YoutubeIcon className="w-4 h-4 text-red-600" />;
      case 'instagram': return <InstagramIcon className="w-4 h-4 text-pink-600" />;
      case 'tiktok': return <TikTokIcon className="w-4 h-4 text-slate-800" />;
      case 'linkedin': return <LinkedinIcon className="w-4 h-4 text-blue-600" />;
      case 'twitter': return <TwitterIcon className="w-4 h-4 text-sky-600" />;
      case 'facebook': return <FacebookIcon className="w-4 h-4 text-blue-700" />;
      default: return <Film className="w-4 h-4 text-indigo-600" />;
    }
  };

  const filtered = contentList
    .filter(item => {
      if (filterType === 'all') return true;
      if (filterType === 'video') return item.content_type === 'video' || item.content_type === 'long_form';
      if (filterType === 'short') return item.content_type === 'short' || item.content_type === 'short_form';
      return item.content_type === filterType;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-display">Raw Talks Content Performance</h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {filtered.length} Verified Episodes & Shorts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Public metrics extracted directly from official Raw Talks With VK YouTube catalog
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Content Type Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: 'All Formats' },
              { id: 'video', label: 'Full Episodes' },
              { id: 'short', label: 'YouTube Shorts' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filterType === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
            >
              <option value="views">Views (High to Low)</option>
              <option value="engagement_rate">Engagement Rate</option>
              <option value="likes">Public Likes</option>
              <option value="comments">Public Comments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/75">
              <th className="py-3 px-4">Content Item & Verification</th>
              <th className="py-3 px-4">Format</th>
              <th className="py-3 px-4 text-right">Public Views</th>
              <th className="py-3 px-4 text-right">Public Engagement</th>
              <th className="py-3 px-4 text-right">Likes / Comments</th>
              <th className="py-3 px-4 text-center">Watch Public Video</th>
              <th className="py-3 px-4 text-center">Compare</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map((item) => {
              const isSelected = selectedComparisonIds.includes(item.id);
              const isShort = item.content_type === 'short' || item.content_type === 'short_form';

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 max-w-md">
                    <div className="flex items-center gap-3">
                      {/* Authentic Thumbnail with Clean Text Fallback */}
                      <div className="w-14 h-9 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0 relative group">
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full bg-slate-800 text-[9px] font-bold text-slate-200 flex items-center justify-center p-1 text-center leading-tight">RAW TALKS</div>';
                          }}
                        />
                        <a
                          href={item.url || `https://www.youtube.com/@RawTalksWithVK`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                          title="Open on YouTube"
                        >
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                        </a>
                      </div>

                      <div className="min-w-0 flex-1">
                        <a 
                          href={item.url || `https://www.youtube.com/@RawTalksWithVK`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-slate-800 hover:text-indigo-600 transition flex items-center gap-1.5 line-clamp-1 group"
                          title={item.title}
                        >
                          <span className="truncate">{item.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                        </a>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-red-600 font-medium">YouTube</span>
                          <span>•</span>
                          <span>{new Date(item.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">Publicly Verified</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      isShort 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {isShort ? 'YouTube Short' : 'Full Episode'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {item.views.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-md font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      {item.engagement_rate}%
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right text-slate-700">
                    <div className="font-semibold">{item.likes.toLocaleString()} ❤️</div>
                    <div className="text-[10px] text-slate-400">{item.comments.toLocaleString()} 💬</div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <a
                      href={item.url || `https://www.youtube.com/@RawTalksWithVK`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition"
                      title="Open video on YouTube"
                    >
                      <Play className="w-3 h-3 fill-indigo-600" />
                      <span>Watch</span>
                    </a>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onSelectForComparison(item.id)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
                      }`}
                      title={isSelected ? 'Selected for comparison' : 'Add to comparison'}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
