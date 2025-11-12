import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import "./Auth.css";

const SearchUsers = () => {
  const { user, token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/search?username=${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const users = res.data.users || [];

      const withRelation = users.map((u) => {
        if (user.following?.includes(u._id)) return { ...u, relation: "following" };
        if (user.requestsSent?.includes(u._id)) return { ...u, relation: "requested" };
        if (user.requestsReceived?.includes(u._id)) return { ...u, relation: "requested_you" };
        return { ...u, relation: "none" };
      });

      setResults(withRelation);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRelation = (id, relation) => {
    setResults((prev) =>
      prev.map((u) => (u._id === id ? { ...u, relation } : u))
    );
  };

  const follow = async (id) => {
    await axios.post(
      `http://localhost:5000/api/users/follow/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    updateRelation(id, "following");
  };

  const requestFollow = async (id) => {
    await axios.post(
      `http://localhost:5000/api/users/request/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    updateRelation(id, "requested");
  };

  const unfollow = async (id) => {
    await axios.post(
      `http://localhost:5000/api/users/unfollow/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    updateRelation(id, "none");
  };

  const accept = async (id) => {
    await axios.post(
      `http://localhost:5000/api/users/requests/accept/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    updateRelation(id, "following");
  };

  const reject = async (id) => {
    await axios.post(
      `http://localhost:5000/api/users/requests/reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    updateRelation(id, "none");
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
          <button onClick={searchUsers} className="search-btn">Search</button>
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
                src={
                  u.avatar ||
                  "https://icon-library.com/images/default-user-icon/default-user-icon-13.jpg"
                }
                className="user-avatar-small"
              />
              <p className="username">{u.username}</p>

              {u.relation === "following" && (
                <button onClick={() => unfollow(u._id)} className="btn-unfollow">
                  Unfollow
                </button>
              )}

              {u.relation === "requested" && (
                <button className="btn-requested">Requested</button>
              )}

              {u.relation === "requested_you" && (
                <div className="req-actions">
                  <button onClick={() => accept(u._id)} className="btn-accept">
                    Accept
                  </button>
                  <button onClick={() => reject(u._id)} className="btn-reject">
                    Reject
                  </button>
                </div>
              )}

              {u.relation === "none" && (
                <button
                  onClick={() =>
                    u.isPrivate ? requestFollow(u._id) : follow(u._id)
                  }
                  className="btn-follow"
                >
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchUsers;
