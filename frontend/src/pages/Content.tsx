import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Download, Search, ChevronDown, TrendingUp, RefreshCw, Film, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Content() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState('All Platforms');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchContent();
  }, [filterPlatform]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const platformParam = filterPlatform !== 'All Platforms' ? `?platform=${filterPlatform.toLowerCase()}` : '';
      const res = await fetch(`http://localhost:8000/api/v1/content/${platformParam}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (err) {
      console.error("Failed to load content:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = content.filter(item => 
    !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const HeaderActions = () => (
    <>
      <button 
        onClick={fetchContent}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
        <Download className="h-4 w-4" />
        Export Report
      </button>
    </>
  );

  return (
    <DashboardLayout
      title="Content Analytics"
      subtitle="Detailed real-time performance metrics across all connected social channels."
      headerActions={<HeaderActions />}
    >
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 flex flex-wrap items-center gap-3"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-foreground-muted)' }}>
              PLATFORM
            </label>
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', background: 'white' }}
                value={filterPlatform}
                onChange={e => setFilterPlatform(e.target.value)}
              >
                {['All Platforms', 'YouTube', 'Instagram', 'LinkedIn', 'TikTok', 'Twitter'].map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--color-foreground-muted)' }} />
            </div>
          </div>

          <div className="ml-auto relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-foreground-muted)' }} />
            <input
              type="text"
              placeholder="Search posts & videos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            />
          </div>
        </div>

        {/* Real Content Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
              <Film className="h-5 w-5 text-blue-600" />
              Live Content Performance ({filteredItems.length} videos/posts)
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading live content metrics...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Film className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">No published videos found on your connected channels.</p>
              <p className="text-xs text-gray-400 mt-1">Upload videos on YouTube or connect other accounts to see real analytics.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid var(--color-border)`, background: 'var(--color-surface)' }}>
                    {['CONTENT ITEM', 'DATE', 'VIEWS', 'LIKES', 'COMMENTS', 'ENG. RATE %', 'LINK'].map((col) => (
                      <th key={col} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--color-foreground-muted)' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="relative group block flex-shrink-0">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt={item.title}
                                  className="w-14 h-10 rounded object-cover border group-hover:opacity-80 transition-opacity" />
                              ) : (
                                <div className="w-14 h-10 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                                  {item.platform}
                                </div>
                              )}
                            </a>
                          ) : (
                            item.thumbnail ? (
                              <img src={item.thumbnail} alt={item.title}
                                className="w-14 h-10 rounded object-cover border flex-shrink-0" />
                            ) : (
                              <div className="w-14 h-10 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                                {item.platform}
                              </div>
                            )
                          )}
                          <div>
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium line-clamp-1 text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                              >
                                {item.title}
                                <ExternalLink className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600 flex-shrink-0" />
                              </a>
                            ) : (
                              <div className="text-sm font-medium line-clamp-1" style={{ color: 'var(--color-foreground)' }}>{item.title}</div>
                            )}
                            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600 inline-block mt-0.5">
                              {item.platform}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-foreground-secondary)' }}>{item.published_at}</td>
                      <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{item.views.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-foreground)' }}>{item.likes.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-foreground)' }}>{item.comments.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                          {item.engagement_rate}%
                          <TrendingUp className="h-3 w-3" />
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          >
                            Open Video
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
