import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./Auth.css";

const Settings = () => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/follow/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setIsPrivate(res.data.user.isPrivate || false);
    } catch (err) {
      console.log("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const savePrivacy = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/settings/privacy",
        { isPrivate },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Settings updated");
    } catch {
      alert("Failed to update settings");
    }
  };

  const changePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) return alert("Please fill all fields");
    if (newPass !== confirmPass) return alert("New passwords do not match");

    try {
      await axios.put(
        "http://localhost:5000/api/settings/password",
        { oldPassword: oldPass, newPassword: newPass },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
      alert("Password changed");
    } catch {
      alert("Incorrect old password");
    }
  };

  const deactivateAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to deactivate your account?");
    if (!confirmDelete) return;

    try {
      await axios.delete("http://localhost:5000/api/settings/deactivate", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch {
      alert("Failed to deactivate account");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-main">
        <div className="settings-page">
          <p className="settings-title">Settings</p>

          <div className="settings-card">
            <p className="settings-section-title">Privacy</p>
            <div className="settings-row">
              <span className="settings-label">Private Account</span>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(!isPrivate)}
                />
                <span className="settings-slider"></span>
              </label>
            </div>
            <button className="settings-save-btn" onClick={savePrivacy}>Save Changes</button>
          </div>

          <div className="settings-card">
            <p className="settings-section-title">Change Password</p>
            <div className="password-input-group">
              <input type="password" placeholder="Old Password" value={oldPass} onChange={e => setOldPass(e.target.value)} />
              <input type="password" placeholder="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} />
              <input type="password" placeholder="Confirm New Password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
            </div>
            <button className="settings-save-btn" onClick={changePassword}>Update Password</button>
          </div>

          <div className="settings-card danger-zone">
            <p className="danger-zone-title">Danger Zone</p>
            <button className="deactivate-btn" onClick={deactivateAccount}>Deactivate Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
