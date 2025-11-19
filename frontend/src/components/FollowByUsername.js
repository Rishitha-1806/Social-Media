import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const FollowByUsername = () => {
  const { user, token, refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const getId = (v) => (v?._id ? v._id.toString() : v ? v.toString() : "");

  const searchUser = async () => {
    if (!username.trim()) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/search?username=${encodeURIComponent(
          username
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const found = res.data.users?.[0] || null;
      setTargetUser(found);

      if (!found) {
        setStatus("not_found");
      } else {
        const meId = getId(user);
        const uId = getId(found);

        const followingIds = (user?.following || []).map(getId);
        const myFollowReqs = (user?.followRequests || []).map(getId);
        const theirFollowReqs = (found?.followRequests || []).map(getId);

        if (uId === meId) {
          setStatus("self");
        } else if (followingIds.includes(uId)) {
          setStatus("following");
        } else if (theirFollowReqs.includes(meId)) {
          setStatus("requested");
        } else if (myFollowReqs.includes(uId)) {
          setStatus("requested_you");
        } else {
          setStatus("none");
        }
      }
    } catch {
      setTargetUser(null);
      setStatus("error");
    }

    setLoading(false);
  };

  const follow = async () => {
    if (!targetUser) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/follow/${targetUser._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus(res.data.status);
      refreshUser();
    } catch {}
  };

  const unfollow = async () => {
    if (!targetUser) return;

    try {
      await axios.post(
        `http://localhost:5000/api/follow/unfollow/${targetUser._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("none");
      refreshUser();
    } catch {}
  };

  const acceptRequest = async () => {
    if (!targetUser) return;

    try {
      await axios.post(
        `http://localhost:5000/api/follow/accept-request/${targetUser._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("followback");
      refreshUser();
    } catch {}
  };

  const rejectRequest = async () => {
    if (!targetUser) return;

    try {
      await axios.post(
        `http://localhost:5000/api/follow/ignore-request/${targetUser._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("none");
      refreshUser();
    } catch {}
  };

  const followBack = async () => {
    if (!targetUser) return;

    try {
      await axios.post(
        `http://localhost:5000/api/follow/followback/${targetUser._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("following");
      refreshUser();
    } catch {}
  };

  return (
    <div className="follow-by-username">
      <input
        type="text"
        placeholder="Enter username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button onClick={searchUser}>Search</button>

      {loading && <p>Loading...</p>}

      {targetUser && (
        <div className="user-card">
          <p>{targetUser.username}</p>

          {status === "none" && <button onClick={follow}>Follow</button>}

          {status === "requested" && <button disabled>Requested</button>}

          {status === "following" && <button onClick={unfollow}>Following</button>}

          {status === "requested_you" && (
            <>
              <button onClick={acceptRequest}>Accept</button>
              <button onClick={rejectRequest}>Reject</button>
            </>
          )}

          {status === "followback" && (
            <button onClick={followBack}>Follow Back</button>
          )}

          {status === "self" && <span>This is you</span>}
          {status === "not_found" && <span>User not found</span>}
          {status === "error" && <span>Error occurred</span>}
        </div>
      )}
    </div>
  );
};

export default FollowByUsername;


