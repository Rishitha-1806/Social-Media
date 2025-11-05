import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

const PostCard = ({ post, userId, postOwnerId, onDelete, onOpen }) => {
  const canDelete = userId && userId === postOwnerId;
  const [likes, setLikes] = useState(post.likes.length || 0);
  const [liked, setLiked] = useState(
    userId ? post.likes.includes(userId) : false
  );

  const handleLike = async (e) => {
    e.stopPropagation(); // prevent modal open
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  return (
    <div className="post-card" onClick={() => onOpen(post)}>
      <div className="post-content">
        {post.image && <img className="post-image" src={post.image} alt="post" />}
      </div>

      <div style={{ padding: "10px" }}>
        <button
          onClick={handleLike}
          style={{ cursor: "pointer", background: "none", border: "none" }}
        >
          {liked ? "❤️" : "🤍"} {likes}
        </button>
      </div>

      {canDelete && (
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(post._id);
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default PostCard;
