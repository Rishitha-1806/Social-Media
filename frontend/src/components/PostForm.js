import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./Auth.css";

const PostForm = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const res = await axios.post("http://localhost:5000/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Post created successfully!");
      setContent("");
      setImage(null);
    } catch (err) {
      console.error("Create post error:", err);
      setMessage("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="dashboard-main">
        <div className="create-post-card">
          <h2>Create Post</h2>
          <p className="post-subtext">Share your thoughts with your friends 🌍</p>

          {message && <div className="post-message">{message}</div>}

          <form className="create-post-form" onSubmit={handleSubmit}>
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />

            <label className="upload-label">
              Upload Image
              <input type="file" onChange={handleImageChange} />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostForm;

