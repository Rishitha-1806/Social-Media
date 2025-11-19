import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Auth.css";

const PostModal = ({ post, onClose, user, token, onDelete }) => {
  if (!post) return null;

  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(user ? post.likes?.includes(user._id) : false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      if (!post._id) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${post._id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data || []);
      } catch {}
    };
    fetchComments();
  }, [post, token]);

  const handleLike = async () => {
    if (!user || !token) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikes(res.data.likes || 0);
      setLiked(res.data.liked || false);
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !token) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data || []);
      setCommentText("");
    } catch {}
  };

  const handleDelete = async () => {
    if (!post._id || !token) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete(post._id);
      onClose();
    } catch {}
  };

  return (
    <div className="ig-modal-overlay" onClick={onClose}>
      <div className="ig-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="ig-modal-image-section">
          <img src={post.image} alt="post" className="ig-modal-image" />
        </div>
        <div className="ig-modal-right">
          <div className="ig-modal-header">
            <div className="ig-modal-header-left">
              <img className="ig-modal-avatar" src={post.user?.avatar || ""} alt="" />
              <span className="ig-modal-username">{post.user?.username || "Unknown"}</span>
            </div>
            {user && post.user && user._id === post.user._id && (
              <button className="ig-modal-dots" onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
            )}
          </div>
          {menuOpen && (
            <div className="ig-modal-popup">
              <button className="ig-popup-delete" onClick={handleDelete}>Delete</button>
              <button className="ig-popup-cancel" onClick={() => setMenuOpen(false)}>Cancel</button>
            </div>
          )}
          {post.title && <p className="ig-modal-caption">{post.title}</p>}
          <div className="ig-modal-like-section">
            <button onClick={handleLike} className="ig-like-btn">
              {liked ? "❤️" : "🤍"} {likes}
            </button>
          </div>
          <div className="ig-modal-comments">
            {comments.map((c) => (
              <div key={c._id || Math.random()} className="ig-modal-comment">
                <img src={c.user?.avatar || ""} className="ig-modal-comment-avatar" alt="" />
                <div className="ig-modal-comment-text">
                  <span className="ig-modal-comment-username">{c.user?.username || "Unknown"}</span>
                  <span className="ig-modal-comment-content">{c.text}</span>
                </div>
              </div>
            ))}
          </div>
          {user && (
            <form className="ig-modal-add-comment" onSubmit={handleComment}>
              <input type="text" placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              <button type="submit">Post</button>
            </form>
          )}
          <div className="ig-modal-time">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;












