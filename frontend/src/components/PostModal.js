import React from "react";
import "./Auth.css";

const PostModal = ({ post, onClose }) => {
  if (!post) return null;

  return (
    <div className="ig-modal-overlay" onClick={onClose}>
      <div className="ig-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* LEFT — IMAGE */}
        <div className="ig-modal-image-section">
          <img src={post.image} alt="post" className="ig-modal-image" />
        </div>

        {/* RIGHT — DETAILS */}
        <div className="ig-modal-right">
          
          {/* USER HEADER */}
          <div className="ig-modal-header">
            <img
              className="ig-modal-avatar"
              src={post.user?.avatar}
              alt="avatar"
            />
            <span className="ig-modal-username">{post.user?.username}</span>
          </div>

          <hr />

          {/* CAPTION */}
          <div className="ig-modal-caption">
            <span className="ig-modal-username">{post.user?.username}</span>
            <span className="ig-modal-text">
              {post.title || post.content}
            </span>
          </div>

          <hr />

          {/* TIME */}
          <div className="ig-modal-time">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;

