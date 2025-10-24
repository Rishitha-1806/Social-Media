import React, { useState, useEffect } from "react";
import "./Auth.css";

const PostPage = () => {
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);

  //fetches the existing post from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.reverse()));
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);

    await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      body: formData,
    });

    window.location.reload();
  };

  return (
    <div className="dashboard-container">
      <div className="feed-container">
        {/* Stories Bar */}
        <div className="stories-bar">
          {["You", "Anna", "John", "Lisa", "Tom"].map((user, i) => (
            <div className="story" key={i}>
              <div className="story-circle">
                <img
                  src={`https://i.pravatar.cc/150?img=${i + 10}`}
                  alt={user}
                />
              </div>
              <div className="story-name">{user}</div>
            </div>
          ))}
        </div>

        {/* Post Form */}
        <div className="post-form-card">
          <form onSubmit={handlePost}>
            <textarea
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <button type="submit">Post</button>
          </form>
        </div>

        {/* Posts Feed */}
        {posts.map((post, index) => (
          <div className="post-card" key={index}>
            <div className="post-header">
              <img
                src={`https://i.pravatar.cc/150?img=${index + 5}`}
                alt="avatar"
                className="post-avatar"
              />
              <span className="post-username">
                {post.username || "Anonymous"}
              </span>
            </div>
            {post.image && (
              <img
                src={`http://localhost:5000/${post.image}`}
                alt="Post"
                className="post-image"
              />
            )}
            <div className="post-actions">
              <i className="fa-regular fa-heart"></i>
              <i className="fa-regular fa-comment"></i>
              <i className="fa-regular fa-paper-plane"></i>
            </div>
            <p className="post-caption">{post.caption}</p>
          </div>
        ))}
      </div>

      {/*Right Sidebar */}
      <div className="right-sidebar">
        <div className="sidebar-card">
          <h3>Suggestions for you</h3>
          {["alex", "tina", "mike", "rose"].map((name, i) => (
            <div className="suggestion" key={i}>
              <div className="suggestion-user">
                <img
                  src={`https://i.pravatar.cc/150?img=${i + 20}`}
                  alt={name}
                />
                <span className="suggestion-username">{name}</span>
              </div>
              <button className="follow-btn">Follow</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostPage;
