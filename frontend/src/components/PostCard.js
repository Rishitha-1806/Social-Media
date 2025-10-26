import React from "react";
import "./Auth.css";

const PostCard = ({ post, userId, postOwnerId, onDelete }) => {
  const canDelete = userId && userId === postOwnerId;

  return (
    <div className="post-card">
      <div className="post-header">
        <img
          className="post-avatar"
          src={post.user?.avatar ? `http://localhost:5000/uploads/${post.user.avatar}` : "/default-avatar.png"}
          alt="avatar"
        />
        <div>
          <span className="post-username">{post.user?.username || "Unknown"}</span>
          <br />
          <span className="post-time">{new Date(post.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="post-content">
        <p>{post.title || post.content}</p>
        {post.image && (
          <img
            className="post-image"
            src={`http://localhost:5000/${post.image}`}
            alt="post"
          />
        )}
      </div>

      {canDelete && (
        <button className="delete-btn" onClick={() => onDelete(post._id)}>
          Delete
        </button>
      )}
    </div>
  );
};

export default PostCard;
