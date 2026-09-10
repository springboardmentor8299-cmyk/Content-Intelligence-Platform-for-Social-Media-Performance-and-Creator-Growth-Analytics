import React, { useState } from 'react';
import {
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  CheckCircle2,
  Plus,
  RefreshCw,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SocialConnectionsModal = ({ isOpen, onClose }) => {
  const { user, toggleSocialConnection } = useAuth();
  const [connectingId, setConnectingId] = useState(null);

  if (!isOpen) return null;

  const socialPlatforms = [
    {
      id: 'youtube',
      name: 'YouTube Channel',
      icon: Youtube,
      color: '#FF0000',
      handle: user?.socialConnections?.youtube?.handle || '@cat_boss',
      followers: user?.socialConnections?.youtube?.followers || '820K',
      connected: user?.socialConnections?.youtube?.connected ?? true,
    },
    {
      id: 'instagram',
      name: 'Instagram Profile',
      icon: Instagram,
      color: '#E4405F',
      handle: user?.socialConnections?.instagram?.handle || '@cat_boss_real',
      followers: user?.socialConnections?.instagram?.followers || '340K',
      connected: user?.socialConnections?.instagram?.connected ?? true,
    },
    {
      id: 'facebook',
      name: 'Facebook Page',
      icon: Facebook,
      color: '#1877F2',
      handle: user?.socialConnections?.facebook?.handle || 'MisterCat Official',
      followers: user?.socialConnections?.facebook?.followers || '190K',
      connected: user?.socialConnections?.facebook?.connected ?? true,
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Twitter,
      color: '#1DA1F2',
      handle: user?.socialConnections?.twitter?.handle || '@cat_boss',
      followers: user?.socialConnections?.twitter?.followers || '115K',
      connected: user?.socialConnections?.twitter?.connected ?? true,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Creator',
      icon: Linkedin,
      color: '#0A66C2',
      handle: user?.socialConnections?.linkedin?.handle || 'Mister Cat',
      followers: user?.socialConnections?.linkedin?.followers || '45K',
      connected: user?.socialConnections?.linkedin?.connected ?? false,
    },
  ];

  const handleToggle = (id) => {
    setConnectingId(id);
    setTimeout(() => {
      toggleSocialConnection(id);
      setConnectingId(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-2xl bg-[#1A2233] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#4A7CF7] to-[#00D4FF] flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Connected Social Platforms</h2>
              <p className="text-xs text-[#8B9BB5] mt-0.5">
                Manage OAuth permissions & real-time telemetry integrations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-[#131929] text-[#8B9BB5] hover:text-white border border-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Social Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 max-h-[60vh] overflow-y-auto pr-1">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            const isLoading = connectingId === platform.id;

            return (
              <div
                key={platform.id}
                className="p-4 rounded-2xl bg-[#131929] hover:bg-[#1F2840] border border-white/10 transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner"
                    style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold truncate text-white">{platform.name}</h4>
                    <p className="text-xs font-mono text-[#8B9BB5] truncate">
                      {platform.handle} • {platform.followers}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(platform.id)}
                  disabled={isLoading}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 border ${
                    platform.connected
                      ? 'bg-[#00C897]/15 text-[#00C897] border-[#00C897]/30 hover:bg-[#FF4757]/20 hover:text-[#FF4757] hover:border-[#FF4757]/40'
                      : 'bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] text-white border-white/20 hover:opacity-90 shadow-md'
                  }`}
                >
                  {isLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : platform.connected ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#8B9BB5]">
          <span className="flex items-center gap-1.5 font-mono">
            <ShieldCheck size={14} className="text-[#00C897]" />
            256-bit OAuth Token Encryption Active
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] text-white font-bold text-xs hover:opacity-90 transition-all border border-white/20 shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
