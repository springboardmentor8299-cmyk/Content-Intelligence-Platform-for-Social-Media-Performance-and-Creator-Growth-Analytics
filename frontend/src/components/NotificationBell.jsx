
import { useEffect, useState } from "react";
import api from "../services/api";
import "./NotificationBell.css";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch notifications from the backend
  const loadNotifications = async () => {
    try {
      setError("");

      const response = await api.get("/notifications/");

      setNotifications(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Couldn't load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate eligible alerts, then fetch notifications
  const initializeNotifications = async () => {
    try {
      await api.post("/notifications/generate-sponsorship-alerts");
    } catch (err) {
      console.error("Failed to generate sponsorship alerts:", err);
    }

    await loadNotifications();
  };

  useEffect(() => {
    initializeNotifications();
  }, []);

  // Count unread notifications
  const unreadCount = notifications.filter(
    (item) => Number(item.is_read) === 0
  ).length;

  // Mark a notification as read
  const markAsRead = async (notification) => {
    if (Number(notification.is_read) !== 0) return;

    try {
      await api.patch(
        `/notifications/${notification.id}/read`
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: 1 }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError("Couldn't mark the notification as read.");
    }
  };

  return (
    <div className="notification-wrapper">
      <button
        type="button"
        className="notification-bell"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        onClick={() => {
          const willOpen = !isOpen;
          setIsOpen(willOpen);

          if (willOpen) {
            initializeNotifications();
          }
        }}
      >
        <span aria-hidden="true">♧</span>
        <span className="notification-bell-label">
          Notifications
        </span>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <div>
              <h3>Notifications</h3>
              <p>
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread alert${
                      unreadCount === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            <button
              type="button"
              className="notification-close"
              aria-label="Close notifications"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {error && (
            <div className="notification-error">
              {error}
              <button
                type="button"
                onClick={initializeNotifications}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <p className="notification-empty">
              Loading alerts...
            </p>
          ) : notifications.length === 0 ? (
            <p className="notification-empty">
              No notifications yet.
            </p>
          ) : (
            <div className="notification-list">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notification-item ${
                    Number(item.is_read) === 0 ? "unread" : ""
                  }`}
                >
                  <div className="notification-item-top">
                    <strong>{item.title}</strong>

                    {Number(item.is_read) === 0 && (
                      <span className="notification-unread-dot" />
                    )}
                  </div>

                  <p>{item.message}</p>

                  <div className="notification-item-bottom">
                    <span>
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleString()
                        : ""}
                    </span>

                    {Number(item.is_read) === 0 && (
                      <button
                        type="button"
                        onClick={() => markAsRead(item)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="notification-panel-footer">
            <button
              type="button"
              onClick={initializeNotifications}
            >
              Refresh notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
