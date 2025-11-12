import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import PostList from "./PostList";
import "./Auth.css";

const Profile = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followState, setFollowState] = useState("none");

  const loggedUserId = user?._id?.toString();
  const profileId = id || loggedUserId;
  const isOwnProfile = loggedUserId === profileId;

  const fetchProfile = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/${profileId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const profile = res.data.user;
      if (!profile) throw new Error("Profile not found");
      setProfileData(profile);

      const followers = (profile.followers || []).map(f => f._id?.toString() || f.toString());
      const requests = (profile.followRequests || []).map(r => r._id?.toString() || r.toString());

      if (isOwnProfile) setFollowState("self");
      else if (followers.includes(loggedUserId)) setFollowState("following");
      else if (requests.includes(loggedUserId)) setFollowState("requested");
      else setFollowState("none");

      if (!profile.isPrivate || followers.includes(loggedUserId) || isOwnProfile) {
        const postRes = await axios.get(
          `http://localhost:5000/api/posts/user/${profileId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setPosts(postRes.data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfileData(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const follow = async () => {
    if (!profileData) return;
    try {
      const url = profileData.isPrivate
        ? `http://localhost:5000/api/users/request/${profileId}`
        : `http://localhost:5000/api/users/follow/${profileId}`;

      const res = await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setFollowState(profileData.isPrivate ? "requested" : "following");

      if (!profileData.isPrivate) {
        setProfileData(prev => ({
          ...prev,
          followers: [...(prev.followers || []), { _id: user._id }],
        }));
      }
    } catch (err) {
      console.error("Follow error:", err);
      alert("Failed to follow user.");
    }
  };

  const unfollow = async () => {
    if (!profileData) return;
    try {
      await axios.post(
        `http://localhost:5000/api/users/unfollow/${profileId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setFollowState("none");
      setProfileData(prev => ({
        ...prev,
        followers: (prev.followers || []).filter(f => f._id?.toString() !== loggedUserId),
      }));
      setPosts([]);
    } catch (err) {
      console.error("Unfollow error:", err);
      alert("Failed to unfollow user.");
    }
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
      setProfileData(prev => ({ ...prev, avatar: newAvatar }));
      setPosts(prev =>
        prev.map(p => ({ ...p, user: { ...p.user, avatar: newAvatar } }))
      );
    } catch (err) {
      console.error("Avatar upload error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );

  if (!profileData)
    return (
      <div className="dashboard-layout">
        <Navbar />
        <div className="dashboard-main">
          <p>Profile not found.</p>
        </div>
      </div>
    );

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-main">
        <div className="profile-header">
          <img src={profileData.avatar} className="profile-avatar-big" />
          <p className="profile-username">{profileData.username}</p>

          {!isOwnProfile && (
            <div className="follow-btn-area">
              {followState === "none" && (
                <button className="follow-btn" onClick={follow}>Follow</button>
              )}
              {followState === "requested" && (
                <button className="requested-btn">Requested</button>
              )}
              {followState === "following" && (
                <button className="unfollow-btn" onClick={unfollow}>Following</button>
              )}
            </div>
          )}

          {isOwnProfile && (
            <div className="avatar-upload-container">
              <label className="avatar-upload-label">
                Change Avatar
                <input type="file" onChange={handleAvatarChange} />
              </label>
            </div>
          )}

          <div className="profile-stats">
            <span>Posts: {posts.length}</span>
            <span>Followers: {profileData.followers?.length || 0}</span>
            <span>Following: {profileData.following?.length || 0}</span>
          </div>
        </div>

        <PostList posts={posts} loading={loading} user={user} />
      </div>
    </div>
  );
};

export default Profile;


