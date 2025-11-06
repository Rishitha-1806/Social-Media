import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import PostList from "./PostList";
import "./Auth.css";

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPosts(res.data);
    } catch {}
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?._id) return;

        const res = await axios.get(
          `http://localhost:5000/api/users/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setProfileData(res.data.user);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchPosts();
  }, [user]);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {}
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axios.put(
        "http://localhost:5000/api/users/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newAvatar = res.data.avatar;
      setProfileData((prev) => ({ ...prev, avatar: newAvatar }));

      setPosts((prev) =>
        prev.map((post) => ({
          ...post,
          user: { ...post.user, avatar: newAvatar },
        }))
      );
    } catch {}
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-main">

        {profileData && (
          <div className="profile-header">
            <img src={profileData.avatar} className="profile-avatar-big" />
            <p className="profile-username">{profileData.username}</p>
            <div className="avatar-upload-container">
              <label className="avatar-upload-label">
                Change Avatar
                <input type="file" onChange={handleAvatarChange} />
              </label>
            </div>

            <div className="profile-stats">
              <span>Posts: {posts.length}</span>
              <span>Followers: {profileData.followers?.length || 0}</span>
              <span>Following: {profileData.following?.length || 0}</span>
            </div>
          </div>
        )}

        <PostList posts={posts} loading={loading} user={user} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default Profile;

