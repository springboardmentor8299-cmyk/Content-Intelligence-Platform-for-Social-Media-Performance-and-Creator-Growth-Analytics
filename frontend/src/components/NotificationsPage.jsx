import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  DollarSign, 
  Share2, 
  Filter, 
  CheckCheck,
  Zap,
  Tag
} from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../api';

export default function NotificationsPage({ onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications({
        notification_type: categoryFilter !== 'all' ? categoryFilter : undefined,
        unread_only: unreadOnly || undefined
      });
      setNotifications(res.data || []);
      const unread = (res.data || []).filter(n => !n.is_read).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [categoryFilter, unreadOnly]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      const unread = notifications.filter(n => n.id !== id && !n.is_read).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
      setActionMsg("Marked as read");
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
      setActionMsg("All notifications marked as read");
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  const getCategoryDetails = (type) => {
    switch (type?.toLowerCase()) {
      case 'milestone':
        return {
          label: 'Follower Milestone',
          icon: Sparkles,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200'
        };
      case 'threshold':
        return {
          label: 'Performance Threshold',
          icon: TrendingUp,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200'
        };
      case 'engagement':
        return {
          label: 'Engagement Velocity',
          icon: Zap,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          border: 'border-indigo-200'
        };
      case 'sponsorship':
        return {
          label: 'Sponsorship Reminder',
          icon: DollarSign,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200'
        };
      case 'revenue':
        return {
          label: 'Revenue Alert',
          icon: DollarSign,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200'
        };
      case 'config_warning':
        return {
          label: 'API Config Warning',
          icon: AlertTriangle,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200'
        };
      case 'integration':
        return {
          label: 'Integration Status',
          icon: Share2,
          color: 'text-sky-600',
          bg: 'bg-sky-50',
          border: 'border-sky-200'
        };
      default:
        return {
          label: 'System Notification',
          icon: Bell,
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          border: 'border-slate-200'
        };
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'success':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Success</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Action Required</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200">Information</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Notifications & Alerts</h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Milestone 3
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Performance alerts, subscriber milestones, sponsorship payout reminders, and API configuration warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionMsg && (
        <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionMsg}</span>
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Notifications' },
            { id: 'milestone', label: 'Milestones' },
            { id: 'threshold', label: 'Performance' },
            { id: 'sponsorship', label: 'Sponsorships' },
            { id: 'revenue', label: 'Revenue' },
            { id: 'config_warning', label: 'API Warnings' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Unread Only Toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Unread only</span>
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-indigo-600 font-semibold text-xs animate-pulse">
            Loading notifications and alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">No notifications found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no alerts matching your current filter criteria. Check back for future threshold updates.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const cat = getCategoryDetails(item.notification_type);
            const Icon = cat.icon;

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition relative flex items-start justify-between gap-4 ${
                  !item.is_read
                    ? 'bg-white border-indigo-200 shadow-2xs ring-1 ring-indigo-100'
                    : 'bg-slate-50/70 border-slate-200 opacity-90'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Category Icon */}
                  <div className={`p-2.5 rounded-xl ${cat.bg} ${cat.color} border ${cat.border} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Body Content */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-display">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {cat.label}
                      </span>
                      {getSeverityBadge(item.severity)}
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" title="Unread" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                      {item.message}
                    </p>

                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Mark as read button */}
                {!item.is_read ? (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition cursor-pointer"
                  >
                    Mark Read
                  </button>
                ) : (
                  <span className="shrink-0 text-[10px] font-medium text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-slate-400" /> Read
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
