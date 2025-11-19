import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import PostList from "./PostList";
import "./Auth.css";

const Profile = () => {
  const { user, token, refreshUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followState, setFollowState] = useState("none");
  const [postCount, setPostCount] = useState(0);
  const [toast, setToast] = useState("");

  const me = user?._id?.toString();
  const profileId = id || me;
  const isOwn = me === profileId;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const p = res.data.user;
      setProfileData(p);

      const followers = (p.followers || []).map((u) => u._id?.toString());
      const following = (p.following || []).map((u) => u._id?.toString());
      const requests = (p.followRequests || []).map((u) => u._id?.toString());
      const myRequests = (user?.followRequests || []).map((u) => u._id?.toString());

      if (isOwn) setFollowState("self");
      else if (followers.includes(me)) setFollowState("following");
      else if (requests.includes(me)) setFollowState("requested");
      else if (myRequests.includes(p._id?.toString())) setFollowState("requested_you");
      else if (following.includes(me)) setFollowState("followback");
      else setFollowState("none");

      // Load posts only if profile is public or viewer is follower/own profile
      if (!p.isPrivate || followers.includes(me) || isOwn) {
        const res2 = await axios.get(`http://localhost:5000/api/posts/user/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res2.data || []);
        setPostCount(res2.data?.length || 0);
      } else {
        setPosts([]);
        setPostCount(0);
      }
    } catch {
      setProfileData(null);
      setPosts([]);
      setPostCount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) loadProfile();
  }, [token, profileId]);

  const follow = async () => {
    try {
      await axios.post(`http://localhost:5000/api/follow/${profileId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshUser();
      loadProfile();
    } catch {}
  };

  const unfollow = async () => {
    try {
      await axios.post(`http://localhost:5000/api/follow/unfollow/${profileId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshUser();
      loadProfile();
    } catch {}
  };

  const acceptReq = async () => {
    try {
      await axios.post(`http://localhost:5000/api/follow/accept-request/${profileId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshUser();
      loadProfile();
    } catch {}
  };

  const rejectReq = async () => {
    try {
      await axios.post(`http://localhost:5000/api/follow/ignore-request/${profileId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadProfile();
    } catch {}
  };

  const followBack = async () => {
    try {
      await axios.post(`http://localhost:5000/api/follow/followback/${profileId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(`You started following ${profileData.username}`);
      refreshUser();
      loadProfile();
    } catch {}
  };

  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="dashboard-layout">
      {toast && <div className="toast">{toast}</div>}
      <Navbar />
      <div className="dashboard-main">
        {profileData ? (
          <>
            <div className="profile-header">
              <img
                src={profileData.avatar || "/default-avatar.png"}
                className="profile-avatar-big"
                alt="avatar"
              />
              <p className="profile-username">{profileData.username}</p>

              {!isOwn && (
                <div className="follow-btn-area">
                  {followState === "none" && (
                    <button onClick={follow} className="btn-follow">
                      Follow
                    </button>
                  )}
                  {followState === "requested" && (
                    <button className="btn-requested">Requested</button>
                  )}
                  {followState === "following" && (
                    <button onClick={unfollow} className="btn-unfollow">
                      Following
                    </button>
                  )}
                  {followState === "followback" && (
                    <>
                      <button onClick={followBack} className="btn-followback">
                        Follow Back
                      </button>
                      <button onClick={rejectReq} className="btn-reject">
                        Ignore
                      </button>
                    </>
                  )}
                  {followState === "requested_you" && (
                    <>
                      <button onClick={acceptReq} className="btn-accept">
                        Accept
                      </button>
                      <button onClick={rejectReq} className="btn-reject">
                        Ignore
                      </button>
                    </>
                  )}
                </div>
              )}

              {isOwn && (
                <div className="avatar-upload-container">
                  <label className="avatar-upload-label">
                    Change Avatar
                    <input type="file" />
                  </label>
                  <button
                    className="settings-btn"
                    onClick={() => navigate("/settings")}
                  >
                    Settings
                  </button>
                </div>
              )}

              <div className="profile-stats">
                <span>Posts: {postCount}</span>
                <span>Followers: {profileData.followers?.length || 0}</span>
                <span>Following: {profileData.following?.length || 0}</span>
              </div>
            </div>

            <PostList
              posts={posts}
              user={user}
              token={token}
              onDeletePost={(id) => {
                setPosts(posts.filter((p) => p._id !== id));
                setPostCount(postCount - 1);
              }}
            />
          </>
        ) : (
          <p>Profile not found or private.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;


