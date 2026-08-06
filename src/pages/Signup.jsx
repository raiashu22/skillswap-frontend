import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Handshake } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.signup({ name, email, password });
      login(data.token, data.user);
      navigate("/browse");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-panel-content">
          <span className="auth-panel-badge">
            <Sparkles size={13} /> Join SkillSwap
          </span>
          <h2>Trade what you know for what you need.</h2>
          <p>List a skill, request help from someone else, and build a reputation through real sessions.</p>
          <div className="auth-panel-stat">
            <Handshake size={22} />
            <div>
              <div className="auth-panel-stat-num">No fees, ever</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>just credits, earned by helping</div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="page page-narrow">
          <div className="page-header" style={{ textAlign: "center" }}>
            <h1 className="page-title">Create your account</h1>
            <p className="page-subtitle">Start with 5 free credits to request your first session.</p>
          </div>

          <div className="card">
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full name</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">College email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </form>
          </div>

          <p className="form-footer-note">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
