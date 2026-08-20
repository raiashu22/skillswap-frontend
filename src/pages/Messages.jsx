import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import Avatar from "../components/Avatar.jsx";

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

export default function Messages() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openChat, setOpenChat] = useState(null);

  async function loadConversations() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listConversations(token);
      setConversations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCloseChat() {
    setOpenChat(null);
    loadConversations();
  }

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-eyebrow">Messages</p>
        <h1 className="page-title">Conversations</h1>
        <p className="page-subtitle">Chats tied to your accepted and completed sessions.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="skeleton" style={{ height: 60, marginBottom: 10 }} />
      ) : conversations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <MessageCircle size={24} />
          </div>
          <h3>No conversations yet</h3>
          <p>Once a request is accepted, you can chat with the other person here.</p>
        </div>
      ) : (
        <div className="convo-list">
          {conversations.map((c) => (
            <button key={c.requestId} className="card convo-row" onClick={() => setOpenChat(c)}>
              <Avatar user={c.otherUser} />
              <div className="convo-info">
                <div className="convo-top-line">
                  <span className="convo-name">{c.otherUser.name}</span>
                  <span className="convo-time">{timeAgo(c.lastMessage.timestamp)}</span>
                </div>
                <div className="convo-bottom-line">
                  <span className="convo-preview">
                    {c.lastMessage.senderId === user.id ? "You: " : ""}
                    {c.lastMessage.content}
                  </span>
                  {c.unreadCount > 0 && <span className="convo-unread-badge">{c.unreadCount}</span>}
                </div>
                <span className="convo-skill">{c.skillTitle}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {openChat && (
        <ChatPanel
          requestId={openChat.requestId}
          otherPersonName={openChat.otherUser.name}
          currentUserId={user.id}
          token={token}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
}