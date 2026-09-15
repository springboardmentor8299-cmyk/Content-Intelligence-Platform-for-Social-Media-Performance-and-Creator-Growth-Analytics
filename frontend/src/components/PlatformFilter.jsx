import React from 'react';
import { Globe } from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from './SocialIcons';

export default function PlatformFilter({ selectedPlatform, onSelectPlatform }) {
  const platforms = [
    { id: 'all', label: 'All Platforms', icon: Globe, color: 'text-indigo-600' },
    { id: 'youtube', label: 'YouTube', icon: YoutubeIcon, color: 'text-red-600' },
    { id: 'instagram', label: 'Instagram', icon: InstagramIcon, color: 'text-pink-600' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {platforms.map((p) => {
        const Icon = p.icon;
        const active = selectedPlatform === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelectPlatform(p.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              active
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : p.color}`} />
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
