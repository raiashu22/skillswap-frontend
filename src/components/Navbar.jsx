import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Compass, LayoutDashboard, Coins, LogOut, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "./Avatar.jsx";
import NotificationBell from "./NotificationBell.jsx";
import MessagesLink from "./MessagesLink.jsx";

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
        {user && <MessagesLink />}
        {user && (
          <Link to="/analytics" style={{ opacity: isActive("/analytics") ? 1 : 0.85, display: "flex", alignItems: "center", gap: 5 }}>
            <BarChart3 size={14} /> Analytics
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
            <NotificationBell />
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <Avatar user={user} />
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