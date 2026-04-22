import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Rehydrate from localStorage on app load ────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken && storedToken !== "undefined") {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
      setToken(storedToken);

      // ✅ Attach token globally
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = (userData, accessToken) => {
    if (!accessToken) {
      console.error("❌ Token missing in login()");
      return;
    }

    // ✅ Save in state
    setUser(userData);
    setToken(accessToken);

    // ✅ Save in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);

    // ✅ Attach token to axios
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // ✅ Remove token from axios
    delete axiosInstance.defaults.headers.common["Authorization"];

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom Hook ─────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};