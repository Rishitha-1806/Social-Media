import React from "react";
import PostCard from "./PostCard";

const PostList = ({ posts, loading, user, onDelete }) => {
  if (loading) return <p style={{ textAlign: "center" }}>Loading posts...</p>;
  if (!posts.length) return <p style={{ textAlign: "center" }}>No posts yet.</p>;

  return (
    <div className="post-feed">
      {posts.map((post) => {
        const postOwnerId =
          typeof post.user === "string" ? post.user : post.user?._id;
        return (
          <PostCard
            key={post._id}
            post={post}
            userId={user?._id}
            postOwnerId={postOwnerId}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export default PostList;

