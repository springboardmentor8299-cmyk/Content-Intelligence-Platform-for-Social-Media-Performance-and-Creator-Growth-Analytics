import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { Bell, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

export default function Notifications() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/notifications/');
      if (res.ok) {
        setNotifs(await res.json());
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
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

  const HeaderActions = () => (
    <button 
      onClick={fetchNotifications}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      Refresh
    </button>
  );

  return (
    <DashboardLayout
      title="Notification Center"
      subtitle="Real-time alerts, OAuth status updates, and channel sync activities."
      headerActions={<HeaderActions />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Real-Time Channel Alerts</h3>
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
              Mark All as Read
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading notifications...</div>
          ) : notifs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border rounded-xl bg-white">
              <Bell className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">No alerts right now.</p>
              <p className="text-xs text-gray-400 mt-1">Connect social channels or trigger sync to generate system events.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notifs.map((n) => (
                <div key={n.id}
                  className={`bg-white rounded-xl border border-l-4 border-l-blue-600 p-5 shadow-sm transition-opacity ${n.is_read ? 'opacity-70' : ''}`}
                  style={{ borderColor: 'var(--color-border)', borderLeftColor: '#2563eb' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{n.title}</h4>
                        <span className="text-xs text-gray-400">{n.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {n.message}
                      </p>
                      {n.action_url && (
                        <div className="mt-3">
                          <Link to={n.action_url} className="text-xs font-semibold text-blue-600 hover:underline">
                            View Channel Settings →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert Preferences */}
        <div className="bg-white rounded-xl border p-6 shadow-sm h-fit"
          style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-base font-semibold mb-4 text-gray-900">
            System Monitoring
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Alerts automatically trigger when channel tokens are refreshed or when API ingestion thresholds change.
          </p>
          <div className="flex flex-col gap-3 text-sm text-gray-700">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span>OAuth Ingestion Health</span>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span>Sync Webhooks</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Listening</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
