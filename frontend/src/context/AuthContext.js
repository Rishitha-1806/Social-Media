import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const setAuthHeader = (t) => {
    if (t) axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    else delete axios.defaults.headers.common["Authorization"];
  };

  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/users/me");
      const data = res.data;
      const minimalUser = {
        _id: data._id,
        username: data.username,
        email: data.email,
        avatar: data.avatar || "/default-avatar.png",
        isPrivate: data.isPrivate,
        followersCount: data.followers?.length || 0,
        followingCount: data.following?.length || 0,
        notificationsCount: data.notifications?.filter(n => !n.read)?.length || 0,
      };
      setUser(minimalUser);
      localStorage.setItem("user", JSON.stringify(minimalUser));
    } catch (err) {
      console.error("Error fetching user:", err.response?.data || err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    if (token) {
      setAuthHeader(token);
      fetchUser();
    } else {
      setAuthHeader(null);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async ({ identifier, password }) => {
    const res = await axios.post("http://localhost:5000/api/auth/login", { identifier, password });
    const t = res.data.token;
    setToken(t);
    localStorage.setItem("token", t);
    setAuthHeader(t);
    await fetchUser();
    return { token: t };
  };

  const registerUser = async ({ username, email, password }) => {
    const res = await axios.post("http://localhost:5000/api/auth/register", { username, email, password });
    const t = res.data.token;
    setToken(t);
    localStorage.setItem("token", t);
    setAuthHeader(t);
    await fetchUser();
    return { token: t };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthHeader(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



