import React from "react";
import "./Auth.css";

const PostCard = ({ post, onOpen }) => {
  return (
    <div className="ig-post-card">
      <div className="ig-post-img-wrapper" onClick={() => onOpen(post)}>
        <img src={post.image} alt="post" className="ig-post-img" />
      </div>
    </div>
  );
};

export default PostCard;

