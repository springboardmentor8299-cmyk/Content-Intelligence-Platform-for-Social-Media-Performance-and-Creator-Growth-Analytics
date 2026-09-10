import React, { useState } from 'react';
import { Search, ArrowUpDown, Filter } from 'lucide-react';
import { PlatformBadge, StatusBadge } from './Badge';

export const DataTable = ({ data = [], title = 'Content Performance' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [sortField, setSortField] = useState('viewsNum');
  const [sortDirection, setSortDirection] = useState('desc');

  // Filter & Search Logic
  const filteredData = data.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat =
      selectedFormat === 'all' || item.format.toLowerCase() === selectedFormat.toLowerCase();
    return matchesSearch && matchesFormat;
  });

  // Sort Logic
  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1A2233] p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8B9BB5]" />
          <input
            type="text"
            placeholder="Search content by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-[#0A0E1A]/80 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6B7B95] focus:outline-none focus:border-[#4A7CF7] transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#4A7CF7]" />
          <span className="text-xs text-slate-500 dark:text-[#8B9BB5] hidden sm:inline font-mono">Format:</span>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="bg-slate-100 dark:bg-[#0A0E1A]/80 border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4A7CF7]"
          >
            <option value="all">All Formats</option>
            <option value="longform">Longform Video</option>
            <option value="reel">Instagram Reels</option>
            <option value="short">Shorts & Reels</option>
            <option value="thread">X Threads</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1A2233] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8B9BB5]">
              <th className="p-4 font-semibold">Content Title</th>
              <th className="p-4 font-semibold">Platform</th>
              <th className="p-4 font-semibold cursor-pointer" onClick={() => handleSort('viewsNum')}>
                <div className="flex items-center gap-1">
                  <span>Views</span>
                  <ArrowUpDown size={12} className="text-[#4A7CF7]" />
                </div>
              </th>
              <th className="p-4 font-semibold">Engagement</th>
              <th className="p-4 font-semibold">Est. Revenue</th>
              <th className="p-4 font-semibold">Watch Time</th>
              <th className="p-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-xs">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-[#8B9BB5]">
                  No matching content found. Try adjusting your search query.
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-14 h-9 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0 group-hover:scale-105 transition-transform shadow-sm"
                      />
                      <div className="flex flex-col min-w-0 max-w-xs sm:max-w-sm">
                        <span className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-[#4A7CF7] dark:group-hover:text-[#00D4FF] transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-[#8B9BB5] font-mono mt-0.5">
                          Published {item.publishDate} • {item.format}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <PlatformBadge platform={item.platform} />
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{item.views}</td>
                  <td className="p-4 font-mono text-[#00C897] font-bold">{item.engagementRate}</td>
                  <td className="p-4 font-mono font-bold text-[#4A7CF7] dark:text-[#00D4FF]">{item.revenue}</td>
                  <td className="p-4 font-mono text-slate-500 dark:text-[#8B9BB5]">{item.avgWatchTime}</td>
                  <td className="p-4 text-center">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
