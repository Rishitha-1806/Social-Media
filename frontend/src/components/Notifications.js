import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import "./Auth.css";

const Notifications = () => {
  const { token, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/users/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  const updateNotif = (id, updates) => {
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, ...updates } : n))
    );
  };

  const acceptRequest = async notif => {
    try {
      await axios.post(
        `http://localhost:5000/api/follow/accept-request/${notif.from._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateNotif(notif._id, {
        status: "accepted",
        message: "Request accepted",
        showFollowOptions: true
      });

      refreshUser();
    } catch {}
  };

  const ignoreRequest = async notif => {
    try {
      await axios.post(
        `http://localhost:5000/api/follow/ignore-request/${notif.from._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.filter(n => n._id !== notif._id));
      refreshUser();
    } catch {}
  };

  const followBack = async notif => {
    try {
      await axios.post(
        `http://localhost:5000/api/follow/followback/${notif.from._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateNotif(notif._id, {
        status: "followed",
        message: `You started following ${notif.from.username}`,
        showFollowOptions: false
      });

      refreshUser();
    } catch {}
  };

  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-main">
        <h2>Notifications</h2>

        {notifications.length === 0 && <p>No notifications yet.</p>}

        <div className="notifications-container">
          {notifications.map(notif => (
            <div key={notif._id} className="notification-card">
              <img
                src={notif.from?.avatar || "/default-avatar.png"}
                alt={notif.from?.username}
                className="user-avatar-small"
              />

              <div className="notification-content">
                <p className="notification-message">{notif.message}</p>

                <div className="notification-actions">
                  {notif.type === "follow_request" && notif.status === "pending" && (
                    <>
                      <button
                        className="btn-accept"
                        onClick={() => acceptRequest(notif)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => ignoreRequest(notif)}
                      >
                        Ignore
                      </button>
                    </>
                  )}

                  {notif.type === "follow_request" &&
                    notif.status === "accepted" &&
                    notif.showFollowOptions && (
                      <>
                        <button
                          className="btn-followback"
                          onClick={() => followBack(notif)}
                        >
                          Follow Back
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => ignoreRequest(notif)}
                        >
                          Ignore
                        </button>
                      </>
                    )}

                  {notif.status === "followed" && (
                    <span className="followed-msg">{notif.message}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;




