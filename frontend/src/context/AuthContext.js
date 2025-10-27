import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return savedUser
      ? { ...JSON.parse(savedUser), token }
      : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      if (user.token) localStorage.setItem("token", user.token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

  const login = (userData, token) => {
    setUser({ ...userData, token });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const registerUser = (userData, token) => {
    setUser({ ...userData, token });
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






