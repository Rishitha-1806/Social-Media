import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./Auth.css";

const Navbar = () => {
  const { user, logout, token } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/users/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifications = res.data.notifications || [];
      const unread = notifications.filter(n => !n.read).length;
      setNotifCount(unread);
    } catch {
      setNotifCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <h2 className="nav-title">Connectly</h2>

      <ul className="nav-links">
        <li><Link to="/dashboard">🏠 Home</Link></li>
        <li><Link to="/search">🔍 Search</Link></li>
        <li><Link to="/explore">🌐 Explore</Link></li>
        <li><Link to="/reels">🎥 Reels</Link></li>
        <li><Link to="/messages">💬 Messages</Link></li>
        <li>
          <Link to="/notifications">
            🔔 Notifications {notifCount > 0 ? `(${notifCount})` : ""}
          </Link>
        </li>
        <li><Link to="/posts/new">➕ Create</Link></li>
        <li><Link to={`/profile/${user?._id}`}>👤 Profile</Link></li>
        <li>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
