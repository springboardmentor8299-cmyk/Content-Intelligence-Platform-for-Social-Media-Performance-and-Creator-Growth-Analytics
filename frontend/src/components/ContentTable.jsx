import React, { useState } from 'react';
import { 
  Film, 
  ArrowUpDown, 
  GitCompare,
  ExternalLink
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
    .filter(item => filterType === 'all' || item.content_type === filterType)
    .sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-display">Content Performance</h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {filtered.length} Items (Sample Data)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by views, engagement, and cross-platform interactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Content Type Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['all', 'video', 'reel', 'post'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                  filterType === type ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type}
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
              <option value="views">Views</option>
              <option value="engagement_rate">Engagement Rate</option>
              <option value="likes">Likes</option>
              <option value="shares">Shares</option>
              <option value="watch_time_hours">Watch Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/75">
              <th className="py-3 px-4">Content Item</th>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4 text-right">Views</th>
              <th className="py-3 px-4 text-right">Engagement</th>
              <th className="py-3 px-4 text-right">Likes / Comments</th>
              <th className="py-3 px-4 text-right">Shares / Saves</th>
              <th className="py-3 px-4 text-center">Compare</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map((item) => {
              const isSelected = selectedComparisonIds.includes(item.id);
              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 max-w-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.thumbnail_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        className="w-12 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 truncate hover:text-indigo-600 transition">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="capitalize font-medium text-slate-500">{item.content_type}</span>
                          <span>•</span>
                          <span>{new Date(item.published_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 capitalize">
                      {getPlatformIcon(item.platform)}
                      <span className="text-slate-700 font-medium">{item.platform}</span>
                    </div>
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
                    <div>{item.likes.toLocaleString()} ❤️</div>
                    <div className="text-[10px] text-slate-400">{item.comments.toLocaleString()} 💬</div>
                  </td>

                  <td className="py-3 px-4 text-right text-slate-700">
                    <div>{item.shares.toLocaleString()} ↗️</div>
                    <div className="text-[10px] text-slate-400">{item.saves.toLocaleString()} 🔖</div>
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
