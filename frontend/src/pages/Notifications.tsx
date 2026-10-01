import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { 
  Bell, RefreshCw, CheckCircle2, DollarSign, Zap, Trophy, ShieldAlert, 
  Trash2, Plus, X, ArrowUpRight, Check 
} from 'lucide-react';
import { Link } from 'react-router';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  timestamp: string;
  is_read: boolean;
  action_url?: string;
  created_at?: string;
}

export default function Notifications() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Test alert simulation modal
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simTitle, setSimTitle] = useState('');
  const [simMessage, setSimMessage] = useState('');
  const [simCategory, setSimCategory] = useState('revenue');
  const [simType, setSimType] = useState('sponsorship');
  const [simActionUrl, setSimActionUrl] = useState('/revenue');
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [activeCategory]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = activeCategory === 'all'
        ? 'http://localhost:8000/api/v1/notifications/'
        : `http://localhost:8000/api/v1/notifications/?category=${activeCategory}`;
        
      const res = await fetch(url);
      if (res.ok) {
        setNotifs(await res.json());
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markSingleRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/notifications/${id}/read`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('http://localhost:8000/api/v1/notifications/mark-all-read', { method: 'POST' });
      setNotifs(n => n.map(x => ({ ...x, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/notifications/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotifs(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleSimulateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatching(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/notifications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: simTitle,
          message: simMessage,
          type: simType,
          category: simCategory,
          action_url: simActionUrl
        })
      });

      if (res.ok) {
        setIsSimulateModalOpen(false);
        setSimTitle('');
        setSimMessage('');
        fetchNotifications();
      }
    } catch (err) {
      console.error("Error creating test alert:", err);
    } finally {
      setDispatching(false);
    }
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  const getCategoryIcon = (category: string, type: string) => {
    if (category === 'revenue' || type === 'sponsorship') {
      return { icon: DollarSign, bg: 'bg-emerald-50 text-emerald-600', border: 'border-l-emerald-500' };
    }
    if (category === 'sync') {
      return { icon: Zap, bg: 'bg-blue-50 text-blue-600', border: 'border-l-blue-500' };
    }
    if (category === 'milestone') {
      return { icon: Trophy, bg: 'bg-purple-50 text-purple-600', border: 'border-l-purple-500' };
    }
    return { icon: ShieldAlert, bg: 'bg-amber-50 text-amber-600', border: 'border-l-amber-500' };
  };

  const categories = [
    { id: 'all', label: 'All Alerts' },
    { id: 'revenue', label: 'Revenue & Payouts' },
    { id: 'sync', label: 'Channel Ingestion' },
    { id: 'milestone', label: 'Growth Milestones' },
    { id: 'security', label: 'Security & System' }
  ];

  const HeaderActions = () => (
    <>
      <button 
        onClick={fetchNotifications}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      <button
        onClick={() => {
          setSimTitle('💰 Google AdSense Milestone Credited');
          setSimMessage('Verified partner earnings payout of $1,280.40 has cleared to your linked account.');
          setSimCategory('revenue');
          setSimType('sponsorship');
          setSimActionUrl('/revenue');
          setIsSimulateModalOpen(true);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
        <Plus className="h-4 w-4" />
        Simulate System Alert
      </button>
    </>
  );

  return (
    <DashboardLayout
      title="Notification & Alert Center"
      subtitle="Real-time monitoring of channel ingestion, monetization milestones, sponsorship contract alerts, and system health."
      headerActions={<HeaderActions />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Notifications Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Category Filter Tabs & Mark All Read */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeCategory === c.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
              >
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
              Loading real-time alerts...
            </div>
          ) : notifs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border rounded-xl bg-white" style={{ borderColor: 'var(--color-border)' }}>
              <Bell className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="font-semibold text-gray-800">No alerts in this category</p>
              <p className="text-xs text-gray-400 mt-1">All channel events and monetization activities are currently up to date.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notifs.map((n) => {
                const style = getCategoryIcon(n.category, n.type);
                const IconComponent = style.icon;
                return (
                  <div 
                    key={n.id}
                    className={`bg-white rounded-xl border border-l-4 p-5 shadow-sm transition-all ${style.border} ${
                      n.is_read ? 'opacity-80 bg-gray-50/50' : 'bg-white shadow'
                    }`}
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">{n.title}</h4>
                            {!n.is_read && (
                              <span className="h-2 w-2 rounded-full bg-blue-600" title="Unread" />
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{n.timestamp}</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                          {n.message}
                        </p>
                        
                        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          {n.action_url ? (
                            <Link 
                              to={n.action_url} 
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              Inspect Details <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          ) : (
                            <div />
                          )}
                          
                          <div className="flex items-center gap-2">
                            {!n.is_read && (
                              <button
                                onClick={() => markSingleRead(n.id)}
                                className="text-xs text-gray-500 hover:text-blue-600 p-1 flex items-center gap-1 rounded hover:bg-gray-100"
                                title="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Read</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(n.id)}
                              className="text-xs text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100"
                              title="Dismiss notification"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System & Telemetry Monitoring Panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Channel Ingestion Health
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Real-time synchronization status and OAuth connection security.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <div className="text-xs font-semibold text-gray-900">YouTube Data API v3</div>
                  <div className="text-[11px] text-gray-500">Auto-refresh token valid</div>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  Healthy
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <div className="text-xs font-semibold text-gray-900">LinkedIn Marketing API</div>
                  <div className="text-[11px] text-gray-500">Connected account synced</div>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  Healthy
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <div className="text-xs font-semibold text-gray-900">Monetization Webhook</div>
                  <div className="text-[11px] text-gray-500">Stripe & Direct Deposit</div>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  Listening
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Alert Rules & Delivery</h3>
            <p className="text-xs text-gray-500 mb-4">
              Automatic triggers dispatch immediately upon payment clearance, subscriber milestone, or API connection events.
            </p>
            <div className="text-xs text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Instant In-App Toast & Header Badge</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Weekly Executive Digest via Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Security Handshake Audit Logging</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Simulate Alert */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Simulate System Event</h3>
              </div>
              <button 
                onClick={() => setIsSimulateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateAlert} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Alert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 💰 Payment Received: $3,500.00"
                  value={simTitle}
                  onChange={e => setSimTitle(e.target.value)}
                  className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Message Body *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed notification text explaining the trigger or milestone..."
                  value={simMessage}
                  onChange={e => setSimMessage(e.target.value)}
                  className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={simCategory}
                    onChange={e => setSimCategory(e.target.value)}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-white text-gray-700"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <option value="revenue">Revenue & Payouts</option>
                    <option value="sync">Channel Ingestion</option>
                    <option value="milestone">Growth Milestones</option>
                    <option value="security">Security & Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Action Link</label>
                  <select
                    value={simActionUrl}
                    onChange={e => setSimActionUrl(e.target.value)}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-white text-gray-700"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <option value="/revenue">/revenue</option>
                    <option value="/dashboard">/dashboard</option>
                    <option value="/connections">/connections</option>
                    <option value="/content">/content</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {dispatching ? 'Dispatching...' : 'Dispatch Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
