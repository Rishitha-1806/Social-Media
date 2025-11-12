import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleFollowAction = async (type, fromId, notifId) => {
    try {
      if (type === "accept") {
        await axios.post(
          `http://localhost:5000/api/users/requests/accept/${fromId}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } else if (type === "reject") {
        await axios.post(
          `http://localhost:5000/api/users/requests/reject/${fromId}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } else if (type === "ignore") {
        await axios.post(
          `http://localhost:5000/api/users/notifications/ignore/${notifId}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      }

      setNotifications((prev) =>
        prev.filter((n) => (type === "ignore" ? n._id !== notifId : true))
          .map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );

      if (type !== "ignore") fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="notifications-page">
        <h2>Notifications</h2>
        {notifications.length === 0 && <p className="no-notifications">No notifications</p>}
        {notifications.map((n) => (
          <div key={n._id} className={`notification-card ${n.read ? "read" : "unread"}`}>
            <div className="notification-content">
              <img
                src={n.from?.avatar || "/default-avatar.png"}
                alt={n.from?.username}
                className="notif-avatar"
              />
              <div className="notif-text">
                <strong>{n.from?.username}</strong> {n.message.replace(n.from?.username, "")}
                <small className="notif-date">{new Date(n.date).toLocaleString()}</small>
              </div>
            </div>
            <div className="notif-actions">
              {n.type === "follow" && !n.read && n.from?.isPrivate && (
                <>
                  <button onClick={() => handleFollowAction("accept", n.from._id, n._id)}>Accept</button>
                  <button onClick={() => handleFollowAction("reject", n.from._id, n._id)}>Reject</button>
                </>
              )}
              <button onClick={() => handleFollowAction("ignore", n.from._id, n._id)}>Ignore</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
