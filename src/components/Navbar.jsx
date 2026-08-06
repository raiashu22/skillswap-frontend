import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Compass, LayoutDashboard, Coins, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <img src="/logo.png" alt="" className="navbar-mark" />
        SkillSwap
      </Link>

      <nav className="navbar-links">
        <Link to="/browse" style={{ opacity: isActive("/browse") ? 1 : 0.85, display: "flex", alignItems: "center", gap: 5 }}>
          <Compass size={14} /> Browse skills
        </Link>
        {user && (
          <Link to="/dashboard" style={{ opacity: isActive("/dashboard") ? 1 : 0.85, display: "flex", alignItems: "center", gap: 5 }}>
            <LayoutDashboard size={14} /> Dashboard
          </Link>
        )}
      </nav>

      <div className="navbar-actions">
        {user ? (
          <>
            <span className="credit-pill" title="Your current credit balance">
              <Coins size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
              {user.credits} credits
            </span>
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <div className="avatar" title={user.name}>
                {initials(user.name)}
              </div>
            </Link>
            <button className="btn btn-ghost" onClick={handleLogout}>
              <LogOut size={14} /> Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
