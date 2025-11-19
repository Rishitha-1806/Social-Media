import React from "react";
import "./Auth.css";

const PostCard = ({ post, onOpen }) => {
  return (
    <div className="ig-post-card" onClick={() => onOpen(post)}>
      <div className="ig-post-img-wrapper">
        <img src={post.image} alt="post" className="ig-post-img" />
      </div>
    </div>
  );
};

export default PostCard;








