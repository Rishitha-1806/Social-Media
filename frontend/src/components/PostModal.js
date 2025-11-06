import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Auth.css";

const PostModal = ({ post, onClose, user }) => {
  if (!post) return null;

  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(
    user ? post.likes?.includes(user._id) : false
  );
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null); // which comment menu is open?

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/posts/${post._id}/comments`
        );
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComments();
  }, [post._id]);

  const handleLike = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComments(res.data);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/posts/${post._id}/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setComments(res.data);
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="ig-modal-overlay" onClick={onClose}>
      <div className="ig-modal-container" onClick={(e) => e.stopPropagation()}>

        <div className="ig-modal-image-section">
          <img src={post.image} alt="post" className="ig-modal-image" />
        </div>

        <div className="ig-modal-right">

          <div className="ig-modal-header">
            <img className="ig-modal-avatar" src={post.user?.avatar} alt="" />
            <span className="ig-modal-username">{post.user?.username}</span>
          </div>

          <hr />

          <div style={{ padding: "10px 0" }}>
            <button
              onClick={handleLike}
              style={{ cursor: "pointer", background: "none", border: "none" }}
            >
              {liked ? "❤️" : "🤍"} {likes}
            </button>
          </div>

          <hr />

          {/* ✅ COMMENTS SECTION WITH THREE DOTS */}
          <div className="ig-modal-comments">
            {comments.map((c) => (
              <div key={c._id} className="ig-modal-comment">
                <img
                  src={c.user.avatar}
                  className="ig-modal-comment-avatar"
                  alt=""
                />

                <div className="ig-modal-comment-text">
                  <span className="ig-modal-comment-username">
                    {c.user.username}
                  </span>
                  <span className="ig-modal-comment-content">{c.text}</span>
                </div>

                {/* ✅ SHOW ⋮ ONLY FOR COMMENT OWNER */}
                {user && c.user._id === user._id && (
                  <div className="ig-comment-menu-wrapper">
                    <button
                      className="ig-dots-btn"
                      onClick={() =>
                        setOpenMenuId(openMenuId === c._id ? null : c._id)
                      }
                    >
                      ⋮
                    </button>

                    {openMenuId === c._id && (
                      <button
                        className="ig-delete-btn"
                        onClick={() => handleDeleteComment(c._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {user && (
            <form className="ig-modal-add-comment" onSubmit={handleComment}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="submit">Post</button>
            </form>
          )}

          <div className="ig-modal-time">
            {new Date(post.createdAt).toLocaleString()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostModal;



