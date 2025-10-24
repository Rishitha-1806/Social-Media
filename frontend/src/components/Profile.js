import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import "./Auth.css";

const Profile = () => {
  const { id: paramId } = useParams(); 
  const { user } = useAuth(); 
  const userId = paramId || user?._id; 

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError("No user found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setProfile(res.data);
        setPosts(res.data.posts || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to fetch profile. Check if the user exists.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/avatar`, formData);
      window.location.reload();
    } catch (err) {
      console.error("Error updating avatar:", err);
      setError("Failed to update avatar.");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-main">
        <div className="profile-header">
          <img
            src={profile.avatar || "/default-avatar.png"}
            alt="avatar"
            className="profile-avatar-big"
          />
          {user && user._id === userId && (
            <div className="avatar-upload-container">
              <label className="avatar-upload-label">
                Change Avatar
                <input type="file" onChange={handleAvatarChange} />
              </label>
            </div>
          )}
          <h2>{profile.username}</h2>
          <div className="profile-stats">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{profile.followers?.length || 0}</strong> followers</span>
            <span><strong>{profile.following?.length || 0}</strong> following</span>
          </div>
        </div>

        <div className="post-feed">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="post-card">
                {post.image && <img src={post.image} alt="Post" className="post-image" />}
                <p>{post.caption}</p>
              </div>
            ))
          ) : (
            <p>No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

