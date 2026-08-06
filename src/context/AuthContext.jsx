import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Token/user persist in localStorage so a page refresh doesn't log you out.
  const [token, setToken] = useState(() => localStorage.getItem("skillswap_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("skillswap_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("skillswap_token", token);
    else localStorage.removeItem("skillswap_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("skillswap_user", JSON.stringify(user));
    else localStorage.removeItem("skillswap_user");
  }, [user]);

  function login(newToken, newUser) {
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  // Lets other parts of the app (e.g. after completing a request) update
  // the locally-cached credit balance without a full re-login.
  function updateUser(patch) {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
