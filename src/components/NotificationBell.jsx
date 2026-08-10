import React, { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  async function refreshUnreadCount() {
    try {
      const data = await api.getUnreadCount(token);
      setUnreadCount(data.count);
    } catch {
      // Silent - the bell just won't update, not worth surfacing an error for.
    }
  }

  async function loadNotifications() {
    setLoading(true);
    try {
      const data = await api.listMyNotifications(token);
      setNotifications(data);
    } catch {
      // Silent - dropdown just stays empty, not critical enough to show an error banner.
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) loadNotifications();
  }

  async function handleMarkRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.markNotificationRead(id, token);
    } catch {
      // Already updated optimistically - a failed mark-as-read isn't worth reverting the UI for.
    }
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.markAllNotificationsRead(token);
    } catch {
      // Same as above - optimistic update stands.
    }
  }

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button className="notif-bell-btn" onClick={handleToggle} aria-label="Notifications">
        <Bell size={17} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAllRead}>
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {loading ? (
              <div className="skeleton" style={{ height: 50, margin: 10 }} />
            ) : notifications.length === 0 ? (
              <p className="notif-empty">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notif-item ${n.read ? "" : "unread"}`}>
                  <div className="notif-item-text">
                    <p>{n.message}</p>
                    <span>{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.read && (
                    <button className="notif-read-btn" onClick={() => handleMarkRead(n.id)} title="Mark as read">
                      <Check size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}