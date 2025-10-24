import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "./Auth.css";

const Post = () => {
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption && !image) {
      setMessage("Please add a caption or an image.");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Post uploaded successfully!");
      setCaption("");
      setImage(null);
      setPreview(null);
    } catch (error) {
      setMessage("Failed to upload post. Try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="post-page">
        <div className="create-post-card">
          <h2>Create a New Post</h2>
          <p className="post-subtext">Share your thoughts or an image ✨</p>

          {message && <div className="post-message">{message}</div>}

          <form onSubmit={handleSubmit} className="create-post-form">
            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            <label className="upload-label">
              <input type="file" accept="image/*" onChange={handleImageChange} />
              <span>📸 Upload Image</span>
            </label>

            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Post;






