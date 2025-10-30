import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import "./Auth.css";

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?._id) return;

        const res = await axios.get(`http://localhost:5000/api/users/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setProfileData(res.data.user);
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);
  //delete post
  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  //change avatar
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

      //update avatar in profile and posts
      const newAvatar = res.data.avatar;
      setProfileData((prev) => ({ ...prev, avatar: newAvatar }));
      setPosts((prev) =>
        prev.map((post) => ({
          ...post,
          user: { ...post.user, avatar: newAvatar },
        }))
      );
    } catch (err) {
      console.error("Avatar upload error:", err);
    }
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
            <img
              src={
                profileData.avatar
                  ? `http://localhost:5000${profileData.avatar}`
                  : "/uploads/default.png"
              }
              alt="avatar"
              className="profile-avatar-big"
            />
            <p className="profile-username">{profileData.username}</p>
            <p className="profile-email">{profileData.email}</p>

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

        <div className="post-feed">
          {posts.length === 0 ? (
            <p className="no-posts">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div className="post-card" key={post._id}>
                <div className="post-header">
                  <img
                    src={
                      profileData.avatar
                        ? `http://localhost:5000${profileData.avatar}`
                        : "/uploads/default.png"
                    }
                    alt="avatar"
                    className="post-avatar"
                  />
                  <span className="post-username">{profileData.username}</span>
                </div>

                <div className="post-content">
                  <p>{post.content}</p>
                  {post.image && (
                    <img
                      src={`http://localhost:5000${post.image}`}
                      alt="post"
                      className="post-image"
                    />
                  )}
                </div>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(post._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

