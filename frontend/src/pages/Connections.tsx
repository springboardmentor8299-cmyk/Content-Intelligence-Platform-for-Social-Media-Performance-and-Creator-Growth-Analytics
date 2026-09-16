import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Link as LinkIcon, RefreshCw, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';

const AVAILABLE_PLATFORMS = [
  { id: 'youtube', name: 'YouTube API v3', logo: 'YT', logoColor: '#ff0000', logoBg: '#fef2f2' },
  { id: 'instagram', name: 'Instagram Graph', logo: 'IG', logoColor: '#e4405f', logoBg: '#fcebf0' },
  { id: 'linkedin', name: 'LinkedIn API', logo: 'IN', logoColor: '#0a66c2', logoBg: '#e6f0f9' },
  { id: 'tiktok', name: 'TikTok API', logo: 'TK', logoColor: '#000000', logoBg: '#e5e5e5' },
  { id: 'twitter', name: 'Twitter/X API', logo: 'X', logoColor: '#1da1f2', logoBg: '#e8f5fd' },
];

export default function Connections() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchConnections();

    // Check URL parameters for OAuth status
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const platform = searchParams.get('platform');

    if (error) {
      setMessage({
        type: 'error',
        text: `Authentication failed: ${decodeURIComponent(error)}`
      });
      searchParams.delete('error');
      searchParams.delete('platform');
      setSearchParams(searchParams, { replace: true });
    } else if (success) {
      setMessage({
        type: 'success',
        text: `Successfully connected and authenticated ${platform ? platform.toUpperCase() : 'account'}!`
      });
      searchParams.delete('success');
      searchParams.delete('platform');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/social/');
      if (res.ok) {
        const data = await res.json();
        setConnections(data);
      }
    } catch (err) {
      console.error("Failed to fetch connections", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/social/connect/${platformId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.auth_url) {
          window.location.href = data.auth_url; // Redirect to platform OAuth login
        }
      }
    } catch (err) {
      console.error("Failed to connect", err);
      setMessage({ type: 'error', text: `Failed to initiate connection for ${platformId}` });
    }
  };

  const handleSignOutPlatform = async (platformId: string, platformName: string) => {
    setDisconnecting(platformId);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/social/disconnect/${platformId}`, { method: 'POST' });
      if (res.ok) {
        setMessage({ type: 'success', text: `Signed out and disconnected from ${platformName} successfully.` });
        await fetchConnections();
      } else {
        setMessage({ type: 'error', text: `Failed to sign out from ${platformName}.` });
      }
    } catch (err) {
      console.error("Failed to disconnect", err);
      setMessage({ type: 'error', text: `Network error while signing out from ${platformName}.` });
    } finally {
      setDisconnecting(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSync = async (platformId: string) => {
    setSyncing(platformId);
    try {
      const res = await fetch('http://localhost:8000/api/v1/social/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformId })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `Synced latest metrics successfully.` });
        await fetchConnections();
      }
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setSyncing(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const HeaderActions = () => (
    <>
      <button 
        onClick={() => handleSync('all')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
        <RefreshCw className={`h-4 w-4 ${syncing === 'all' ? 'animate-spin' : ''}`} />
        Sync All Data
      </button>
    </>
  );

  return (
    <DashboardLayout
      title="Social Data Sources"
      subtitle="Manage your active API connections across platforms. Connect with OAuth or Sign Out of connected channels anytime."
      headerActions={<HeaderActions />}
    >
      <div className="flex flex-col gap-6">
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border shadow-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-xs text-gray-400 hover:text-gray-600">Dismiss</button>
          </div>
        )}
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading platform connections...</div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Available Integrations</h3>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {AVAILABLE_PLATFORMS.map((p) => {
                const conn = connections.find(c => c.platform.toLowerCase() === p.id);
                const isConnected = !!(conn && conn.is_connected);

                return (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Logo */}
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold"
                        style={{ background: p.logoBg, color: p.logoColor }}>
                        {p.logo}
                      </div>

                      {/* Name + Status */}
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{p.name}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                            {isConnected ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isConnected && (
                      <div className="hidden md:block">
                         <div className="text-[10px] uppercase font-semibold tracking-wider mb-1 text-gray-500">CONNECTED ACCOUNT</div>
                         <div className="text-sm font-medium text-gray-900">{conn.username} ({conn.followers} followers)</div>
                      </div>
                    )}

                    {isConnected && (
                      <div className="hidden md:block">
                         <div className="text-[10px] uppercase font-semibold tracking-wider mb-1 text-gray-500">LAST SYNC</div>
                         <div className="text-sm text-gray-600">{conn.last_synced}</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isConnected ? (
                        <button 
                          onClick={() => handleConnect(p.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                          <LinkIcon className="h-4 w-4" />
                          Connect
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleSync(p.id)}
                            disabled={syncing === p.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium hover:bg-blue-100 transition-colors">
                            <RefreshCw className={`h-3.5 w-3.5 ${syncing === p.id ? 'animate-spin' : ''}`} />
                            {syncing === p.id ? 'Syncing...' : 'Sync'}
                          </button>
                          
                          {/* Dedicated Sign Out / Disconnect Button */}
                          <button 
                            onClick={() => handleSignOutPlatform(p.id, p.name)}
                            disabled={disconnecting === p.id}
                            title="Sign out from this platform"
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium hover:bg-red-100 hover:text-red-800 transition-colors">
                            <LogOut className="h-3.5 w-3.5" />
                            {disconnecting === p.id ? 'Signing out...' : 'Sign Out'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
