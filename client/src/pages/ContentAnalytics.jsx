import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  TrendingUp
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, LinkedinIcon } from '../components/common/SocialIcons';

const ContentAnalytics = () => {
  const [posts, setPosts] = useState([]);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await client.get(`/api/v1/analytics/content?platform=${filterPlatform}`);
        setPosts(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [filterPlatform]);

  const getPlatformBadge = (plat) => {
    switch (plat?.toLowerCase()) {
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <YoutubeIcon className="h-3 w-3" /> YouTube
          </span>
        );
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <InstagramIcon className="h-3 w-3" /> Instagram
          </span>
        );
      case 'linkedin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <LinkedinIcon className="h-3 w-3" /> LinkedIn
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{plat}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with platform filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Content Performance Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">Cross-platform engagement comparison and post-level metrics</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
          {['all', 'youtube', 'instagram', 'linkedin'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPlatform(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterPlatform === p 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table Panel */}
      <div className="glass-panel overflow-hidden">
        {loading && (
          <div className="px-6 py-3 text-xs font-semibold text-slate-400 border-b border-white/5">
            Refreshing content analytics...
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Content Title</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4 text-right">Views</th>
                <th className="px-6 py-4 text-right">Likes</th>
                <th className="px-6 py-4 text-right">Comments</th>
                <th className="px-6 py-4 text-right">Shares</th>
                <th className="px-6 py-4 text-right">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white max-w-sm truncate">{post.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Published {new Date(post.published_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getPlatformBadge(post.platform)}</td>
                  <td className="px-6 py-4 text-right font-medium text-white">
                    {post.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{post.likes.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium">{post.comments.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium">{post.shares.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs">
                      <TrendingUp className="h-3 w-3" />
                      {post.engagement_rate}%
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
};

export default ContentAnalytics;
