import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MessagesLink() {
  const { token } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const data = await api.getChatUnreadTotal(token);
        if (!cancelled) setUnreadCount(data.count);
      } catch {
        // Silent - badge just won't update this cycle.
      }
    }
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  const isActive = location.pathname === "/messages";

  return (
    <Link
      to="/messages"
      style={{
        opacity: isActive ? 1 : 0.85,
        display: "flex",
        alignItems: "center",
        gap: 5,
        position: "relative",
      }}
    >
      <MessageCircle size={14} /> Messages
      {unreadCount > 0 && <span className="messages-nav-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </Link>
  );
}