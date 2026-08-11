import React, { useEffect, useRef, useState } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { api } from "../api/client.js";
import { getSocket } from "../socket.js";

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
        // If history fails to load, chat still works going forward via
        // the live socket connection - not worth blocking on this.
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadHistory();

    const socket = getSocket(token);
    socket.emit("join_request", requestId);

    function handleNewMessage(message) {
      if (message.requestId === requestId) {
        setMessages((prev) => [...prev, message]);
      }
    }
    function handleConnect() {
      setConnected(true);
      socket.emit("join_request", requestId);
    }
    function handleDisconnect() {
      setConnected(false);
    }

    socket.on("new_message", handleNewMessage);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    setConnected(socket.connected);

    return () => {
      isMounted = false;
      socket.off("new_message", handleNewMessage);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [requestId, token]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    const socket = getSocket(token);
    socket.emit("send_message", { requestId, content: draft.trim() });
    setDraft("");
  }

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
            messages.map((m) => {
              const isMine = m.senderId === currentUserId;
              return (
                <div key={m.id} className={`chat-bubble-row ${isMine ? "mine" : ""}`}>
                  <div className={`chat-bubble ${isMine ? "mine" : ""}`}>
                    {m.content}
                    <span className="chat-bubble-time">
                      {new Date(m.timestamp).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })
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