import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import "./Auth.css";

const SearchUsers = () => {
  const { user, token, refreshUser } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const getId = (v) => (v?._id ? v._id.toString() : v ? v.toString() : "");

  const searchUsers = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/search?username=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const meId = getId(user);
      const myFollowing = (user?.following || []).map(getId);
      const myRequests = (user?.followRequests || []).map(getId);

      const mapped = (res.data.users || []).map((u) => {
        const uId = getId(u);
        const uRequests = (u.followRequests || []).map(getId);
        const uFollowers = (u.followers || []).map(getId);
        const uFollowing = (u.following || []).map(getId);

        if (uId === meId) return { ...u, relation: "self" };
        if (myFollowing.includes(uId)) return { ...u, relation: "following" };
        if (uRequests.includes(meId)) return { ...u, relation: "requested" };
        if (myRequests.includes(uId)) return { ...u, relation: "requested_you" };
        if (uFollowing.includes(meId)) return { ...u, relation: "followback" };
        return { ...u, relation: "none" };
      });

      setResults(mapped);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const updateRelation = (idv, state, message) => {
    setResults((prev) =>
      prev.map((u) =>
        u._id === idv ? { ...u, relation: state, message } : u
      )
    );
  };

  const follow = async (idv) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/follow/${idv}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateRelation(idv, res.data.status);
      refreshUser();
    } catch {}
  };

  const unfollow = async (idv) => {
    try {
      await axios.post(
        `http://localhost:5000/api/follow/unfollow/${idv}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateRelation(idv, "none");
      refreshUser();
    } catch {}
  };

  const acceptRequest = async (idv) => {
    try {
      await axios.post(
        `http://localhost:5000/api/follow/accept-request/${idv}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateRelation(idv, "followback");
      refreshUser();
    } catch {}
  };

  const rejectRequest = async (idv) => {
    try {
      await axios.post(
        `http://localhost:5000/api/follow/ignore-request/${idv}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateRelation(idv, "none");
      refreshUser();
    } catch {}
  };

  const followBack = async (idv, username) => {
    try {
      await axios.post(
        `http://localhost:5000/api/follow/followback/${idv}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateRelation(idv, "following", `You started following ${username}`);
      refreshUser();
    } catch {}
  };

  return (
    <div>
      <Navbar />

      <div className="search-page">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={searchUsers} className="search-btn">
            Search
          </button>
        </div>

        {loading && (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        )}

        <div className="user-results">
          {results.map((u) => (
            <div key={u._id} className="user-card">
              <img
                src={u.avatar || "/default-avatar.png"}
                className="user-avatar-small"
              />
              <p className="username">{u.username}</p>

              <div className="user-action-buttons">
                {u.relation === "none" && (
                  <button
                    onClick={() => follow(u._id)}
                    className="btn-follow"
                  >
                    Follow
                  </button>
                )}

                {u.relation === "requested" && (
                  <button className="btn-requested">Requested</button>
                )}

                {u.relation === "following" && (
                  <button
                    onClick={() => unfollow(u._id)}
                    className="btn-unfollow"
                  >
                    Following
                  </button>
                )}

                {u.relation === "requested_you" && (
                  <>
                    <button
                      onClick={() => acceptRequest(u._id)}
                      className="btn-accept"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectRequest(u._id)}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  </>
                )}

                {u.relation === "followback" && (
                  <button
                    onClick={() => followBack(u._id, u.username)}
                    className="btn-followback"
                  >
                    Follow Back
                  </button>
                )}

                {u.relation === "self" && (
                  <span className="self-badge">You</span>
                )}

                {u.relation === "following" && u.message && (
                  <span className="followed-msg">{u.message}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchUsers;



