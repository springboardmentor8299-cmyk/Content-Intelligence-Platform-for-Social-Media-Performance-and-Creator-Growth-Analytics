import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { Star, ExternalLink, Trash2, Search, User as UserIcon } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/favorites/');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/favorites/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'instagram', username: searchUsername.trim() })
      });
      if (res.ok) {
        setSearchUsername('');
        fetchFavorites();
      } else {
        alert('Failed to add profile or profile not found.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:8000/api/v1/favorites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedUser?.id === id) setSelectedUser(null);
        fetchFavorites();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    setLoadingPosts(true);
    setUserPosts([]);
    try {
      // Re-using the content endpoint by connecting logic or directly fetching from social/content API?
      // Since we don't have a specific user-posts endpoint, let's proxy it via a quick workaround
      // But wait! We need a backend route to get posts for an arbitrary username.
      const res = await fetch(`http://localhost:8000/api/v1/content/user?username=${user.username}`);
      if (res.ok) {
        const data = await res.json();
        setUserPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  return (
    <DashboardLayout
      title="Watchlist & Favorites"
      subtitle="Track your favorite creator profiles, analyze their latest posts, and monitor their metrics."
    >
      <div className="flex flex-col gap-6">
        
        {/* Search & Add */}
        <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-sm font-semibold mb-3">Add to Watchlist (Instagram)</h3>
          <form onSubmit={handleAddFavorite} className="flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Instagram username (e.g. itzz_kumxr)"
                className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm"
                value={searchUsername}
                onChange={e => setSearchUsername(e.target.value)}
                disabled={adding}
              />
            </div>
            <button 
              type="submit" 
              disabled={adding || !searchUsername.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              {adding ? 'Adding...' : 'Add Favorite'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List of Favorites */}
          <div className="lg:col-span-1 bg-white rounded-xl border shadow-sm flex flex-col min-h-[400px]">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold">Saved Profiles</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-5 text-center text-gray-500 text-sm">Loading favorites...</div>
              ) : favorites.length === 0 ? (
                <div className="p-5 text-center text-gray-500 text-sm">No favorites added yet.</div>
              ) : (
                <div className="divide-y">
                  {favorites.map(fav => (
                    <div 
                      key={fav.id} 
                      onClick={() => handleSelectUser(fav)}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                        selectedUser?.id === fav.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {fav.profile_picture_url ? (
                        <img src={fav.profile_picture_url} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">@{fav.username}</div>
                        <div className="text-xs text-gray-500">{formatNumber(fav.followers_count)} followers</div>
                      </div>
                      <button onClick={(e) => handleRemove(e, fav.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile Analysis Details */}
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm min-h-[400px] flex flex-col">
            {!selectedUser ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-8 text-center flex-col gap-3">
                <Star className="h-10 w-10 text-gray-300" />
                Select a profile from your watchlist to view their posts and analytics.
              </div>
            ) : (
              <>
                <div className="px-6 py-5 border-b flex items-center justify-between bg-gray-50/50 rounded-t-xl">
                  <div className="flex items-center gap-4">
                     {selectedUser.profile_picture_url ? (
                        <img src={selectedUser.profile_picture_url} className="w-14 h-14 rounded-full shadow-sm object-cover bg-white" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white shadow-sm border flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-lg font-bold">@{selectedUser.username}</h2>
                        <div className="text-sm text-gray-500 font-medium">
                          {formatNumber(selectedUser.followers_count)} Instagram Followers
                        </div>
                      </div>
                  </div>
                  <a href={`https://instagram.com/${selectedUser.username}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline">
                    View on IG <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-sm mb-4">Recent Published Content</h3>
                  {loadingPosts ? (
                    <div className="text-center py-10 text-gray-500 text-sm">Loading posts...</div>
                  ) : userPosts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-sm">No posts found for this user.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userPosts.map(post => (
                        <a key={post.id} href={post.url} target="_blank" rel="noreferrer" className="flex gap-4 p-3 border rounded-xl hover:bg-gray-50 transition-colors group">
                          {post.thumbnail ? (
                            <img src={post.thumbnail} className="w-20 h-24 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                          ) : (
                            <div className="w-20 h-24 bg-gray-100 rounded-lg flex-shrink-0" />
                          )}
                          <div className="flex flex-col py-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{post.title}</p>
                            <div className="mt-auto flex items-center gap-3 text-xs text-gray-500 font-medium">
                              <span>{formatNumber(post.likes)} Likes</span>
                              <span>{formatNumber(post.comments)} Comments</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
