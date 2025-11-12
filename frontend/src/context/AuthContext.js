import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/me");
      const freshUser = res.data;
      setUser(freshUser);
      localStorage.setItem("user", JSON.stringify(freshUser));
    } catch {}
  };

  const login = async ({ identifier, password }) => {
    const res = await axios.post(
      "http://localhost:5000/api/auth/login",
      { identifier, password },
      { headers: { "Content-Type": "application/json" } }
    );

    const { token } = res.data;

    setToken(token);
    localStorage.setItem("token", token);

    await fetchUser();

    return { token };
  };

  const registerUser = async ({ username, email, password }) => {
    const res = await axios.post(
      "http://localhost:5000/api/auth/register",
      { username, email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    const { token } = res.data;

    setToken(token);
    localStorage.setItem("token", token);

    await fetchUser();

    return { token };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateAvatar = (avatarURL) => {
    const updated = { ...user, avatar: avatarURL };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        registerUser,
        updateAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

