import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const unreadCount = user?.notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="navbar">
      <h2 className="nav-title">Connectly</h2>
      <ul className="nav-links">
        <li><Link to="/dashboard">🏠 Home</Link></li>
        <li><Link to="/search" className="nav-icon">🔍 Search</Link></li>
        <li><Link to="/explore">🌐 Explore</Link></li>
        <li><Link to="/reels">🎥 Reels</Link></li>
        <li><Link to="/messages">💬 Messages</Link></li>
        <li><Link to="/notifications">🔔 Notifications ({unreadCount})</Link></li>
        <li><Link to="/posts/new">➕ Create</Link></li>
        <li><Link to={`/profile/${user?._id}`}>👤 Profile</Link></li>
        <li>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;





