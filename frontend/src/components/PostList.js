import React, { useState } from "react";
import PostCard from "./PostCard";
import PostModal from "./PostModal";

const PostList = ({ posts = [], user, token, onDeletePost }) => {
  const [openPost, setOpenPost] = useState(null);

  const handleDelete = (postId) => {
    if (onDeletePost) onDeletePost(postId);
  };

  if (!posts.length) return <p style={{ textAlign: "center" }}>No posts yet.</p>;

  return (
    <>
      <div className="ig-grid">
        {posts.map((post) => {
          const postOwnerId = typeof post.user === "string" ? post.user : post.user?._id;
          return <PostCard key={post._id} post={post} onOpen={setOpenPost} />;
        })}
      </div>

      <PostModal post={openPost} onClose={() => setOpenPost(null)} user={user} token={token} onDelete={handleDelete} />
    </>
  );
};

export default PostList;
