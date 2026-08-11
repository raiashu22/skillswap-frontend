import React, { useEffect, useState } from "react";
import { Check, X, CheckCircle2, Star, Coins, Clock, Handshake, Award, CalendarClock, MessageCircle } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import ChatPanel from "../components/ChatPanel.jsx";

export default function Dashboard() {
  const { user, token, updateUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [ratingFor, setRatingFor] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [schedulingFor, setSchedulingFor] = useState(null);
  const [scheduleDraft, setScheduleDraft] = useState("");
  const [chattingWith, setChattingWith] = useState(null);

  async function loadRequests() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listMyRequests(token);
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = requests.filter((r) => {
    if (tab === "all") return true;
    if (tab === "requested") return r.requesterId === user.id;
    if (tab === "providing") return r.providerId === user.id;
    return true;
  });

  async function handleAction(action, request) {
    setBusyId(request.id);
    setError("");
    try {
      if (action === "accept") await api.acceptRequest(request.id, token);
      if (action === "decline") await api.declineRequest(request.id, token);
      if (action === "complete") await api.completeRequest(request.id, token);

      await loadRequests();
      const fresh = await api.getMe(token);
      updateUser(fresh);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmitRating(requestId) {
    setBusyId(requestId);
    setError("");
    try {
      await api.submitRating({ requestId, score: ratingScore, comment: ratingComment }, token);
      setRatingFor(null);
      setRatingComment("");
      setRatingScore(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleSchedule(requestId) {
    if (!scheduleDraft) return;
    setBusyId(requestId);
    setError("");
    try {
      await api.scheduleRequest(requestId, new Date(scheduleDraft).toISOString(), token);
      setSchedulingFor(null);
      setScheduleDraft("");
      await loadRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const acceptedCount = requests.filter((r) => r.status === "ACCEPTED").length;
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length;

  const upcomingSessions = requests
    .filter((r) => r.status === "ACCEPTED" && r.scheduledAt && new Date(r.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-eyebrow">Your activity</p>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Manage requests you've sent and received below.</p>
      </div>

      <div className="dash-stats">
        <div className="card dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "linear-gradient(135deg, var(--purple-500), var(--purple-600))" }}>
            <Coins size={18} />
          </div>
          <div>
            <div className="dash-stat-num">{user.credits}</div>
            <div className="dash-stat-label">Credits</div>
          </div>
        </div>
        <div className="card dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "linear-gradient(135deg, var(--blue-300), var(--blue-600))" }}>
            <Clock size={18} />
          </div>
          <div>
            <div className="dash-stat-num">{pendingCount}</div>
            <div className="dash-stat-label">Pending</div>
          </div>
        </div>
        <div className="card dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "linear-gradient(135deg, var(--purple-300), var(--purple-500))" }}>
            <Handshake size={18} />
          </div>
          <div>
            <div className="dash-stat-num">{acceptedCount}</div>
            <div className="dash-stat-label">In progress</div>
          </div>
        </div>
        <div className="card dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
            <Award size={18} />
          </div>
          <div>
            <div className="dash-stat-num">{completedCount}</div>
            <div className="dash-stat-label">Completed</div>
          </div>
        </div>
      </div>

      {upcomingSessions.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarClock size={16} /> Upcoming sessions
          </h3>
          <div className="upcoming-list">
            {upcomingSessions.map((r) => {
              const isProvider = r.providerId === user.id;
              const otherPerson = isProvider ? r.requester.name : r.provider.name;
              return (
                <div key={r.id} className="upcoming-row">
                  <div className="upcoming-date-badge">
                    <span>{new Date(r.scheduledAt).toLocaleDateString("en-IN", { day: "numeric" })}</span>
                    <span>{new Date(r.scheduledAt).toLocaleDateString("en-IN", { month: "short" })}</span>
                  </div>
                  <div>
                    <div className="request-row-title">{r.skill.title}</div>
                    <div className="request-row-meta">
                      with {otherPerson} · {new Date(r.scheduledAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>
          All
        </button>
        <button className={`tab ${tab === "requested" ? "active" : ""}`} onClick={() => setTab("requested")}>
          Requested by me
        </button>
        <button className={`tab ${tab === "providing" ? "active" : ""}`} onClick={() => setTab("providing")}>
          I'm providing
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading requests...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Handshake size={24} />
          </div>
          <h3>Nothing here yet</h3>
          <p>Head to Browse skills to send your first request.</p>
        </div>
      ) : (
        <div className="request-list">
          {filtered.map((r, idx) => {
            const isProvider = r.providerId === user.id;
            const otherPerson = isProvider ? r.requester.name : r.provider.name;

            return (
              <div key={r.id} className="card request-row stagger-item" style={{ animationDelay: `${idx * 0.04}s` }}>
                <div className="request-row-info">
                  <span className="request-row-title">{r.skill.title}</span>
                  <span className="request-row-meta">
                    {isProvider ? `Requested by ${otherPerson}` : `Providing: ${otherPerson}`} · {r.credits} credit{r.credits > 1 ? "s" : ""}
                    {r.scheduledAt && (
                      <>
                        {" · "}
                        <CalendarClock size={11} style={{ verticalAlign: -2, display: "inline" }} />{" "}
                        {new Date(r.scheduledAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                      </>
                    )}
                  </span>
                </div>

                <span className={`status-badge status-${r.status}`}>{r.status}</span>

                <div className="request-actions">
                  {isProvider && r.status === "PENDING" && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={busyId === r.id}
                        onClick={() => handleAction("accept", r)}
                      >
                        <Check size={13} /> Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={busyId === r.id}
                        onClick={() => handleAction("decline", r)}
                      >
                        <X size={13} /> Decline
                      </button>
                    </>
                  )}

                  {(r.status === "ACCEPTED" || r.status === "COMPLETED") && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--green-glow)", borderColor: "var(--border)" }}
                      onClick={() => setChattingWith(r)}
                    >
                      <MessageCircle size={13} /> Chat
                    </button>
                  )}

                  {r.status === "ACCEPTED" && (
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={busyId === r.id}
                      onClick={() => handleAction("complete", r)}
                    >
                      <CheckCircle2 size={13} /> Mark complete
                    </button>
                  )}

                  {(r.status === "PENDING" || r.status === "ACCEPTED") &&
                    (schedulingFor === r.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          type="datetime-local"
                          value={scheduleDraft}
                          onChange={(e) => setScheduleDraft(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", fontSize: 12.5 }}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={busyId === r.id || !scheduleDraft}
                          onClick={() => handleSchedule(r.id)}
                        >
                          <Check size={12} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSchedulingFor(null)} style={{ borderColor: "var(--border)" }}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--blue-soft)", borderColor: "var(--border)" }}
                        onClick={() => setSchedulingFor(r.id)}
                      >
                        <CalendarClock size={13} /> {r.scheduledAt ? "Reschedule" : "Schedule"}
                      </button>
                    ))}

                  {r.status === "COMPLETED" &&
                    (ratingFor === r.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <select value={ratingScore} onChange={(e) => setRatingScore(Number(e.target.value))}>
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} star{n > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                        <input
                          placeholder="Optional comment"
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)" }}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={busyId === r.id}
                          onClick={() => handleSubmitRating(r.id)}
                        >
                          Submit
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--purple-600)", borderColor: "var(--border)" }}
                        onClick={() => setRatingFor(r.id)}
                      >
                        <Star size={13} /> Rate session
                      </button>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {chattingWith && (
        <ChatPanel
          requestId={chattingWith.id}
          otherPersonName={chattingWith.providerId === user.id ? chattingWith.requester.name : chattingWith.provider.name}
          currentUserId={user.id}
          token={token}
          onClose={() => setChattingWith(null)}
        />
      )}
    </div>
  );
}