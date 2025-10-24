import React from "react";
import "./Auth.css";

const PostCard = ({ post, userId, postOwnerId, onDelete }) => {
  return (
    <div className="post-card">
      <div className="post-header">
        <img
          className="post-avatar"
          src={post.userAvatar || "/default-avatar.png"}
          alt="avatar"
        />
        <div>
          <span className="post-username">{post.username || "Unknown"}</span>
          <br />
          <span className="post-time">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <img className="post-image" src={post.image} alt="post" />
        )}
      </div>

      {/* Delete button now works */}
      {userId && postOwnerId && String(userId) === String(postOwnerId) && (
        <button className="delete-btn" onClick={() => onDelete(post._id)}>
          Delete
        </button>
      )}
    </div>
  );
};

export default PostCard;

