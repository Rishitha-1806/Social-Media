import React, { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "./PostCard";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/posts", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (mounted) setPosts(res.data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load posts");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading posts...</p>;
  if (error) return <p className="error" style={{ textAlign: "center" }}>{error}</p>;

  return (
    <div>
      {posts.length === 0 ? (
        <p style={{ textAlign: "center" }}>No posts yet.</p>
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} />)
      )}
    </div>
  );
};

export default PostList;

