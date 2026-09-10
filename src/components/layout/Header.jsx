import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Calendar,
  Globe,
  Youtube,
  Instagram,
  Video,
  Twitter,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  X,
  Menu,
  Sun,
  Moon,
  Share2,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import { SocialConnectionsModal } from '../common/SocialConnectionsModal';

export const Header = () => {
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme,
    selectedPlatform,
    setSelectedPlatform,
    timeframe,
    setTimeframe,
    notifications,
    markNotificationAsRead,
    platforms,
    timeframes,
    toggleSidebar,
  } = useDashboard();

  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getPlatformIcon = (iconName) => {
    switch (iconName) {
      case 'Youtube':
        return <Youtube size={16} className="text-[#FF4757]" />;
      case 'Instagram':
        return <Instagram size={16} className="text-[#FF6B9D]" />;
      case 'Video':
        return <Video size={16} className="text-[#00D4FF]" />;
      case 'Twitter':
        return <Twitter size={16} className="text-[#4A7CF7]" />;
      default:
        return <Globe size={16} className="text-[#4A7CF7]" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-20 bg-white/90 dark:bg-[#0A0E1A]/85 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 lg:px-8 flex items-center justify-between gap-4 transition-colors">
        {/* Left: Mobile Menu Toggle & Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full hidden sm:block">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8B9BB5]" />
            <input
              type="text"
              placeholder="Search analytics, posts, sponsors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6B7B95] focus:outline-none focus:border-[#4A7CF7] transition-all"
            />
          </div>
        </div>

        {/* Center/Right: Platform Selector Pills & Timeframe Picker */}
        <div className="flex items-center gap-2.5">
          {/* Social Accounts Connection Manager Button */}
          <button
            onClick={() => navigate('/connect')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-[#4A7CF7] dark:text-[#00D4FF] hover:bg-slate-200 dark:hover:bg-white/15 transition-all shadow-sm"
          >
            <Share2 size={14} />
            <span>Social Connections</span>
          </button>

          {/* Platform Selector Pills */}
          <div className="hidden xl:flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#131929] rounded-2xl border border-slate-200 dark:border-white/10">
            {platforms.map((p) => {
              const isSelected = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] text-white shadow-md font-semibold'
                      : 'text-slate-600 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {getPlatformIcon(p.icon)}
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#131929] rounded-2xl border border-slate-200 dark:border-white/10">
            <Calendar size={14} className="ml-2 text-[#4A7CF7]" />
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
                  timeframe === tf.id
                    ? 'bg-[#4A7CF7]/20 text-[#4A7CF7] dark:text-[#00D4FF] border border-[#4A7CF7]/40 font-bold'
                    : 'text-slate-600 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#131929] text-slate-600 dark:text-[#8B9BB5] hover:text-[#4A7CF7] dark:hover:text-[#00D4FF] border border-slate-200 dark:border-white/10 transition-all shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-[#FFB800]" />
            ) : (
              <Moon size={18} className="text-[#4A7CF7]" />
            )}
          </button>

          {/* Notification Bell Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-[#131929] text-slate-600 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all shadow-sm"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4757] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0A0E1A] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Flyout Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#1A2233] border border-slate-200 dark:border-white/15 rounded-3xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#4A7CF7]" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Activity & Alerts</h4>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="py-2 space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-[#8B9BB5] text-center py-6">No new notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          n.unread
                            ? 'bg-[#4A7CF7]/10 border-[#4A7CF7]/30 text-slate-900 dark:text-white'
                            : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-[#8B9BB5]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {n.type === 'deal' && <Flame size={14} className="text-[#FFB800]" />}
                            {n.type === 'milestone' && <CheckCircle2 size={14} className="text-[#00C897]" />}
                            {n.type === 'alert' && <AlertTriangle size={14} className="text-[#FF4757]" />}
                            {n.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-[#8B9BB5]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-[#8B9BB5] mt-1">{n.desc}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Creator Avatar Tag */}
          <div
            onClick={() => setShowSocialModal(true)}
            className="hidden sm:flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-white/10 cursor-pointer group"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-[#4A7CF7] group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80';
              }}
            />
            <div className="hidden xl:flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name}</span>
              <span className="text-[10px] text-[#4A7CF7] dark:text-[#00D4FF] font-mono">● {user?.tier}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Social Connections Modal Component */}
      <SocialConnectionsModal isOpen={showSocialModal} onClose={() => setShowSocialModal(false)} />
    </>
  );
};
