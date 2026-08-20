import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Send, MessageCircle, CheckCheck } from "lucide-react";
import { api } from "../api/client.js";
import { getSocket } from "../socket.js";

function formatDayLabel(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isSameDay = (a, b) => a.toDateString() === b.toDateString();
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export default function ChatPanel({ requestId, otherPersonName, currentUserId, token, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setLoading(true);
      try {
        const history = await api.getRequestMessages(requestId, token);
        if (isMounted) setMessages(history);
      } catch {
        // Chat still works going forward via the live socket connection.
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadHistory();

    const socket = getSocket(token);
    socket.emit("join_request", requestId);
    socket.emit("mark_read", requestId);

    function handleNewMessage(message) {
      if (message.requestId === requestId) {
        setMessages((prev) => [...prev, message]);
        if (message.senderId !== currentUserId) {
          socket.emit("mark_read", requestId);
        }
      }
    }
    function handleMessagesRead({ requestId: rid, readerId }) {
      if (rid === requestId && readerId !== currentUserId) {
        setMessages((prev) => prev.map((m) => (m.senderId === currentUserId ? { ...m, read: true } : m)));
      }
    }
    function handleConnect() {
      setConnected(true);
      socket.emit("join_request", requestId);
      socket.emit("mark_read", requestId);
    }
    function handleDisconnect() {
      setConnected(false);
    }

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    setConnected(socket.connected);

    return () => {
      isMounted = false;
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [requestId, token, currentUserId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentLabel = null;
    let currentGroup = null;
    messages.forEach((m) => {
      const label = formatDayLabel(m.timestamp);
      if (label !== currentLabel) {
        currentLabel = label;
        currentGroup = { label, items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(m);
    });
    return groups;
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    const socket = getSocket(token);
    socket.emit("send_message", { requestId, content: draft.trim() });
    setDraft("");
  }

  const lastMineIndex = messages.map((m) => m.senderId).lastIndexOf(currentUserId);

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-panel" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MessageCircle size={16} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{otherPersonName}</div>
              <div style={{ fontSize: 11, color: connected ? "var(--success)" : "var(--text-muted)" }}>
                {connected ? "● Connected" : "Connecting..."}
              </div>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            <X size={16} />
          </button>
        </div>

        <div className="chat-messages" ref={scrollRef}>
          {loading ? (
            <div className="skeleton" style={{ height: 60, margin: 12 }} />
          ) : messages.length === 0 ? (
            <p className="chat-empty">No messages yet — say hello!</p>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.label}>
                <div className="chat-day-separator">
                  <span>{group.label}</span>
                </div>
                {group.items.map((m) => {
                  const isMine = m.senderId === currentUserId;
                  const globalIndex = messages.indexOf(m);
                  const showSeen = isMine && globalIndex === lastMineIndex && m.read;
                  return (
                    <div key={m.id} className={`chat-bubble-row ${isMine ? "mine" : ""}`}>
                      <div className={`chat-bubble ${isMine ? "mine" : ""}`}>
                        {m.content}
                        <span className="chat-bubble-time">
                          {new Date(m.timestamp).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                          {showSeen && <CheckCheck size={11} style={{ marginLeft: 4, verticalAlign: -2 }} />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()}>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}