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

  const API_URL = "http://localhost:5000/api/posts";

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${postId}`);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Error deleting post");
      setLoading(false);
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
            // Determine post owner ID safely
            const postOwnerId =
              typeof post.user === "string" ? post.user : post.user?._id;

            return (
              <PostCard
                key={post._id}
                post={post}
                userId={user?._id}
                postOwnerId={postOwnerId}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

