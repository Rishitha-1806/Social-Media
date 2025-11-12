import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import PostCard from "./PostCard";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPosts = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/posts`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const visiblePosts = res.data.filter((p) => {
        if (!p.user.isPrivate) return true;
        if (p.user.followers?.includes(user._id)) return true;
        if (p.user._id === user._id) return true;
        return false;
      });

      setPosts(visiblePosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      alert("Error fetching posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete post error:", err);
      alert("Failed to delete post.");
    }
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
        <div className="post-feed">
          {!loading && posts.length === 0 && <p>No posts to show.</p>}
          {posts.map((post) => {
            const postOwnerId = post.user?._id || post.user;
            return (
              <PostCard
                key={post._id}
                post={post}
                userId={user?._id}
                postOwnerId={postOwnerId}
                onDelete={post.user._id === user._id ? handleDelete : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;








