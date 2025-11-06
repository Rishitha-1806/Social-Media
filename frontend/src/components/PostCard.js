import React, { useState } from "react";
import "./Auth.css";
import PostModal from "./PostModal";

const PostCard = ({ post, userId, postOwnerId, onDelete }) => {
  const canDelete = userId && userId === postOwnerId;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="post-card" onClick={handleOpenModal}>
        <div className="post-content">
          {post.image && (
            <img className="post-image" src={post.image} alt="post" />
          )}
        </div>

        {canDelete && (
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation(); // prevent modal open
              onDelete(post._id);
            }}
          >
            Delete
          </button>
        )}
      </div>

      {/* Instagram-style modal */}
      {isModalOpen && (
        <PostModal
          post={post}
          onClose={handleCloseModal}
          user={{ _id: userId, token: localStorage.getItem("token") }}
        />
      )}
    </>
  );
};

export default PostCard;

