import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Coins } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
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
      const data = await api.login({ email, password });
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
            <Sparkles size={13} /> Welcome back
          </span>
          <h2>Pick up right where you left off.</h2>
          <p>Your credits, requests, and skill listings are all waiting for you.</p>
          <div className="auth-panel-stat">
            <Coins size={22} />
            <div>
              <div className="auth-panel-stat-num">5 credits</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>to start every new account</div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="page page-narrow">
          <div className="page-header" style={{ textAlign: "center" }}>
            <h1 className="page-title">Log in</h1>
            <p className="page-subtitle">Access your SkillSwap account.</p>
          </div>

          <div className="card">
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
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
                  required
                />
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>
          </div>

          <p className="form-footer-note">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
