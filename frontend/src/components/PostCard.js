import React, { useState } from "react";
import "./Auth.css";

const PostCard = ({ post, userId, postOwnerId, onDelete, onOpen }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="ig-post-card">
      <div className="ig-post-img-wrapper" onClick={() => onOpen(post)}>
        <img src={post.image} alt="post" className="ig-post-img" />
      </div>

      {userId === postOwnerId && (
        <div className="ig-post-menu-wrapper">
          <button
            className="ig-dots-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ⋮
          </button>

          {menuOpen && (
            <button
              className="ig-delete-btn"
              onClick={() => onDelete(post._id)}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;


