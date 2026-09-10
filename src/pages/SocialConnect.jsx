import React, { useState } from 'react';
import {
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  AlertCircle,
  RefreshCw,
  Link2,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  X,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SocialConnect = () => {
  const { user, toggleSocialConnection } = useAuth();
  const [selectedOAuthPlatform, setSelectedOAuthPlatform] = useState(null);
  const [oauthStep, setOauthStep] = useState(1);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // 5 Specified Social Platforms (STRICTLY NO TIKTOK)
  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      category: 'Video & Shorts Telemetry',
      icon: Youtube,
      color: '#FF0000',
      handle: user?.socialConnections?.youtube?.handle || '@cat_boss',
      followers: user?.socialConnections?.youtube?.followers || '820K Subscribers',
      connected: user?.socialConnections?.youtube?.connected ?? true,
      lastSync: '2 minutes ago',
      scopes: ['yt-analytics.readonly', 'youtube.readonly', 'monetization.audit'],
    },
    {
      id: 'instagram',
      name: 'Instagram',
      category: 'Reels & Audience Graph',
      icon: Instagram,
      color: '#E4405F',
      handle: user?.socialConnections?.instagram?.handle || '@cat_boss_real',
      followers: user?.socialConnections?.instagram?.followers || '340K Followers',
      connected: user?.socialConnections?.instagram?.connected ?? true,
      lastSync: '5 minutes ago',
      scopes: ['instagram_basic', 'instagram_manage_insights', 'pages_show_list'],
    },
    {
      id: 'facebook',
      name: 'Facebook',
      category: 'Page Insights & Monetization',
      icon: Facebook,
      color: '#1877F2',
      handle: user?.socialConnections?.facebook?.handle || 'MisterCat Official',
      followers: user?.socialConnections?.facebook?.followers || '190K Followers',
      connected: user?.socialConnections?.facebook?.connected ?? true,
      lastSync: '12 minutes ago',
      scopes: ['read_insights', 'pages_read_engagement', 'business_management'],
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      category: 'Posts & Thread Telemetry',
      icon: Twitter,
      color: '#1DA1F2',
      handle: user?.socialConnections?.twitter?.handle || '@cat_boss',
      followers: user?.socialConnections?.twitter?.followers || '115K Followers',
      connected: user?.socialConnections?.twitter?.connected ?? true,
      lastSync: '1 minute ago',
      scopes: ['tweet.read', 'users.read', 'bookmark.read'],
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      category: 'Professional & Creator Analytics',
      icon: Linkedin,
      color: '#0A66C2',
      handle: user?.socialConnections?.linkedin?.handle || 'Mister Cat',
      followers: user?.socialConnections?.linkedin?.followers || '45K Connections',
      connected: user?.socialConnections?.linkedin?.connected ?? false,
      lastSync: 'Not Connected',
      scopes: ['r_basicprofile', 'r_organization_social', 'r_analytics'],
    },
  ];

  const handleOpenOAuthModal = (platform) => {
    setSelectedOAuthPlatform(platform);
    setOauthStep(1);
    setIsAuthenticating(false);
  };

  const handleStartOAuthProcess = () => {
    setIsAuthenticating(true);
    setOauthStep(1);

    setTimeout(() => {
      setOauthStep(2);
    }, 1200);

    setTimeout(() => {
      setOauthStep(3);
    }, 2400);

    setTimeout(() => {
      toggleSocialConnection(selectedOAuthPlatform.id);
      setIsAuthenticating(false);
      setTimeout(() => {
        setSelectedOAuthPlatform(null);
      }, 800);
    }, 3400);
  };

  const handleDisconnect = (platformId) => {
    toggleSocialConnection(platformId);
  };

  const connectedCount = platforms.filter((p) => p.connected).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#00C897]/15 text-[#00C897] font-mono text-xs font-bold border border-[#00C897]/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00C897] animate-ping" />
                OAuth 2.0 Security Stream Active
              </span>
              <span className="px-3 py-1 rounded-full bg-[#4A7CF7]/15 text-[#4A7CF7] dark:text-[#00D4FF] font-mono text-xs font-bold border border-[#4A7CF7]/30">
                {connectedCount} of 5 Platforms Synced
              </span>
            </div>

            <h1 className="text-2xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Social Media Telemetry Connections
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 dark:text-[#8B9BB5] max-w-2xl leading-relaxed">
              Connect your official creator channels to enable automated cross-platform view velocity, audience demography, and sponsorship attribution pipelines.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131929] border border-slate-200 dark:border-white/10 flex items-center gap-4 shrink-0 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4A7CF7] to-[#00D4FF] flex items-center justify-center shadow-md">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-[#8B9BB5] font-mono">Sync Latency</div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                <span className="text-[#00C897]">⚡ 2.4 ms</span>
                <span className="text-[10px] text-slate-400 dark:text-[#8B9BB5] font-normal">(Zero Latency)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon;

          return (
            <div
              key={platform.id}
              className="bg-white dark:bg-[#1A2233] hover:bg-slate-50 dark:hover:bg-[#1F2840] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between transition-all duration-200 group"
            >
              <div className="space-y-5">
                {/* Platform Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-inner shrink-0 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${platform.color}15`, color: platform.color }}
                    >
                      <Icon size={24} />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {platform.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-[#8B9BB5] font-mono">{platform.category}</p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {platform.connected ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#00C897]/15 text-[#00C897] font-mono text-[10px] font-bold border border-[#00C897]/40 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C897] animate-ping" />
                        Connected
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-[#8B9BB5] font-mono text-[10px] font-medium border border-slate-200 dark:border-white/15 flex items-center gap-1">
                        <AlertCircle size={10} />
                        Action Needed
                      </span>
                    )}
                  </div>
                </div>

                {/* Connection Metadata / Account Handle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D1421] border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-[#8B9BB5]">Creator Handle</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {platform.connected ? platform.handle : 'Not Synced'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-[#8B9BB5]">Audience Size</span>
                    <span className="font-bold text-[#4A7CF7] dark:text-[#00D4FF] font-mono">
                      {platform.connected ? platform.followers : '0'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-white/10">
                    <span className="text-slate-500 dark:text-[#8B9BB5]">Telemetry Status</span>
                    <span className="text-slate-500 dark:text-[#8B9BB5] font-mono flex items-center gap-1">
                      <RefreshCw size={10} className={platform.connected ? 'text-[#00C897]' : ''} />
                      {platform.lastSync}
                    </span>
                  </div>
                </div>

                {/* Permission Scopes */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-[#8B9BB5] uppercase tracking-wider font-semibold">
                    Granted OAuth Scopes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {platform.scopes.map((scope, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#8B9BB5]"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-5 border-t border-slate-200 dark:border-white/10">
                {platform.connected ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenOAuthModal(platform)}
                      className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#131929] hover:bg-slate-200 dark:hover:bg-[#1F2840] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} className="text-[#4A7CF7] dark:text-[#00D4FF]" />
                      <span>Re-authenticate</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      className="px-3.5 py-2.5 rounded-2xl bg-[#FF4757]/15 hover:bg-[#FF4757]/25 border border-[#FF4757]/30 text-xs font-semibold text-[#FF4757] transition-all"
                      title="Disconnect Platform"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenOAuthModal(platform)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] hover:opacity-95 text-white font-bold text-xs tracking-wide transition-all shadow-md border border-white/20 flex items-center justify-center gap-2 group"
                  >
                    <Link2 size={16} />
                    <span>Connect {platform.name}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* OAuth 2.0 Security Information Widget */}
      <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-6 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00C897]/15 border border-[#00C897]/30 flex items-center justify-center text-[#00C897] shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Enterprise OAuth 2.0 Telemetry Standard
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#00C897]/15 text-[#00C897] font-mono">SOC-2 Type II</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#8B9BB5] mt-0.5">
              CreatorIQ requests read-only telemetry access. We never store personal login passwords or post content on your behalf.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-[#8B9BB5]">
            TLS 1.3 Encrypted
          </div>
        </div>
      </div>

      {/* OAuth Flow Modal */}
      {selectedOAuthPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-lg bg-white dark:bg-[#1A2233] border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative shadow-2xl overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={() => setSelectedOAuthPlatform(null)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-md"
                style={{ backgroundColor: `${selectedOAuthPlatform.color}20`, color: selectedOAuthPlatform.color }}
              >
                <selectedOAuthPlatform.icon size={26} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Connect {selectedOAuthPlatform.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8B9BB5] font-mono">
                  OAuth 2.0 Telemetry Stream Handshake
                </p>
              </div>
            </div>

            {/* OAuth Step Indicator */}
            <div className="space-y-6">
              {/* Step Progress Bar */}
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className={oauthStep >= 1 ? 'text-[#4A7CF7] dark:text-[#00D4FF] font-bold' : 'text-slate-400 dark:text-[#8B9BB5]'}>1. Handshake</span>
                <span className={oauthStep >= 2 ? 'text-[#4A7CF7] dark:text-[#00D4FF] font-bold' : 'text-slate-400 dark:text-[#8B9BB5]'}>2. Scopes</span>
                <span className={oauthStep >= 3 ? 'text-[#00C897] font-bold' : 'text-slate-400 dark:text-[#8B9BB5]'}>3. Connected</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#4A7CF7] via-[#00D4FF] to-[#00C897] h-full transition-all duration-300"
                  style={{ width: `${(oauthStep / 3) * 100}%` }}
                />
              </div>

              {/* Dynamic Step View */}
              {oauthStep === 1 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1421] border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#4A7CF7] dark:text-[#00D4FF] font-mono font-semibold">
                    <Lock size={14} />
                    <span>Step 1: Authorization Endpoint</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#8B9BB5] leading-relaxed">
                    Redirecting to official <strong>{selectedOAuthPlatform.name}</strong> OAuth server to verify identity for <span className="text-slate-900 dark:text-white font-mono font-bold">@cat_boss</span>.
                  </p>
                </div>
              )}

              {oauthStep === 2 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1421] border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#4A7CF7] dark:text-[#00D4FF] font-mono font-semibold">
                    <Sliders size={14} />
                    <span>Step 2: Granting Telemetry Scopes</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-[#8B9BB5]">
                    {selectedOAuthPlatform.scopes.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-2 font-mono text-[11px]">
                        <Check size={12} className="text-[#00C897]" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {oauthStep === 3 && (
                <div className="p-5 rounded-2xl bg-[#00C897]/15 border border-[#00C897]/30 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#00C897] text-white flex items-center justify-center mx-auto shadow-md">
                    <Check size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">OAuth Connection Verified!</h4>
                  <p className="text-xs text-slate-500 dark:text-[#8B9BB5]">
                    Real-time telemetry data for {selectedOAuthPlatform.name} is now active in your dashboard.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOAuthPlatform(null)}
                  disabled={isAuthenticating}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/15 text-xs font-semibold text-slate-600 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                {!isAuthenticating && oauthStep !== 3 && (
                  <button
                    type="button"
                    onClick={handleStartOAuthProcess}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] hover:opacity-95 text-white font-bold text-xs shadow-md border border-white/20 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} />
                    <span>Authorize OAuth</span>
                  </button>
                )}

                {isAuthenticating && (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-3 rounded-2xl bg-[#4A7CF7]/40 text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} className="animate-spin text-[#00D4FF]" />
                    <span>Authenticating...</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
