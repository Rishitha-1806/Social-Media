import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./Auth.css";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentInput, setCommentInput] = useState({});

  const fetchPosts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter out own posts
      const otherUserPosts = res.data.filter((p) => p.user._id !== user._id);
      setPosts(otherUserPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handleLike = async (postId) => {
    if (!token) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: res.data.likes, likedByUser: res.data.liked }
            : p
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInput((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentInput[postId];
    if (!token || !text) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: res.data } : p))
      );

      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-main">
        {loading && (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && posts.length === 0 && <p>No posts to show.</p>}

        <div className="feed-container">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <img src={post.user.avatar} alt="avatar" className="user-avatar-small" />
                <span className="post-username">{post.user.username}</span>
              </div>
              {post.image && <img src={post.image} alt="post" className="post-image" />}
              <div className="post-actions">
                <button
                  className="like"
                  onClick={() => handleLike(post._id)}
                  style={{ color: post.likedByUser ? "#ed4956" : "#262626" }}
                >
                  ❤️ {post.likes || 0}
                </button>
                <button className="comment">
                  💬 {post.comments?.length || 0}
                </button>
              </div>
              {post.caption && (
                <div className="post-caption">
                  <strong>{post.user.username}</strong> {post.caption}
                </div>
              )}

              <div className="post-comments post-comments-scroll">
                {post.comments?.map((c) => (
                  <div key={c._id} className="single-comment">
                    <strong>{c.user.username}</strong> {c.text}
                  </div>
                ))}
              </div>

              <div className="post-comment-input">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInput[post._id] || ""}
                  onChange={(e) => handleCommentChange(post._id, e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit(post._id)}
                />
                <button onClick={() => handleCommentSubmit(post._id)}>Post</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;









