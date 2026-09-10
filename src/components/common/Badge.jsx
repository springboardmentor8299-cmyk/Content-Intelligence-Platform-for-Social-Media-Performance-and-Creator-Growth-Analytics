import React from 'react';
import { Youtube, Instagram, Facebook, Twitter, Flame, TrendingUp, Sparkles, Clock, CheckCircle } from 'lucide-react';

export const PlatformBadge = ({ platform }) => {
  switch (platform?.toLowerCase()) {
    case 'youtube':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FF4757]/15 text-[#FF4757] border border-[#FF4757]/30">
          <Youtube size={13} />
          <span>YouTube</span>
        </span>
      );
    case 'instagram':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FF6B9D]/15 text-[#FF6B9D] border border-[#FF6B9D]/30">
          <Instagram size={13} />
          <span>Instagram</span>
        </span>
      );
    case 'facebook':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/30">
          <Facebook size={13} />
          <span>Facebook</span>
        </span>
      );
    case 'twitter':
    case 'x':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#4A7CF7]/15 text-[#4A7CF7] border border-[#4A7CF7]/30">
          <Twitter size={13} />
          <span>X (Twitter)</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#4A7CF7]/15 text-[#00D4FF] border border-[#4A7CF7]/30">
          <Sparkles size={13} />
          <span>Multi-platform</span>
        </span>
      );
  }
};

export const StatusBadge = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'viral':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 shadow-sm shadow-[#FFB800]/10">
          <Flame size={12} />
          <span>Viral</span>
        </span>
      );
    case 'trending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#00C897]/15 text-[#00C897] border border-[#00C897]/30">
          <TrendingUp size={12} />
          <span>Trending</span>
        </span>
      );
    case 'evergreen':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#7C5CFC]/15 text-[#7C5CFC] border border-[#7C5CFC]/30">
          <Sparkles size={12} />
          <span>Evergreen</span>
        </span>
      );
    case 'active':
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#00C897]/15 text-[#00C897] border border-[#00C897]/30">
          <CheckCircle size={12} />
          <span>{status}</span>
        </span>
      );
    case 'in review':
    case 'negotiating':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#FF4757]/15 text-[#FF4757] border border-[#FF4757]/30">
          <Clock size={12} />
          <span>{status}</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-white/10 text-white/70 border border-white/10">
          <span>{status || 'Standard'}</span>
        </span>
      );
  }
};
