import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return savedUser ? { ...JSON.parse(savedUser), token } : null;
  });

  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      if (user.token) localStorage.setItem("token", user.token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

  // Register
  const registerUser = async (formData) => {
    const res = await axios.post(`${API_URL}/register`, formData);
    setUser({ ...res.data.user, token: res.data.token });
    return res.data;
  };

  // ✅ Login using identifier (email or username)
  const login = async ({ identifier, password }) => {
    const res = await axios.post(`${API_URL}/login`, {
      identifier,
      password,
    });

    setUser({ ...res.data.user, token: res.data.token });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  const updateAvatar = (avatar) => {
    setUser((prev) => ({
      ...prev,
      avatar,
    }));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, registerUser, updateAvatar }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
