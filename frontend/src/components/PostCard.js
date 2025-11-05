import React from "react";
import "./Auth.css";

const PostCard = ({ post, userId, postOwnerId, onDelete, onOpen }) => {
  const canDelete = userId && userId === postOwnerId;

  return (
    <div className="post-card" onClick={() => onOpen(post)}>
      <div className="post-content">
        {post.image && (
          <img
            className="post-image"
            src={post.image}   // Base64 used directly
            alt="post"
          />
        )}
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




