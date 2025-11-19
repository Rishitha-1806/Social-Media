import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./Auth.css";

const PostForm = () => {
  const [title, setTitle] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post(
        "http://localhost:5000/api/posts",
        { title, image: imageBase64 || null },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("Post created successfully!");
      setTitle("");
      setImageBase64("");
    } catch (err) {
      console.error(err);
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
          {message && <div className="post-message">{message}</div>}
          <form className="create-post-form" onSubmit={handleSubmit}>
            <textarea
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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







