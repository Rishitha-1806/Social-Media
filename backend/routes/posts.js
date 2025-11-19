const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const AuthMiddleware = require("../middleware/auth");

async function canViewPosts(viewerId, ownerId) {
  const owner = await User.findById(ownerId);
  if (!owner) return false;
  if (!owner.isPrivate) return true;
  if (!viewerId) return false;
  const followers = owner.followers.map(f => f.toString());
  if (followers.includes(viewerId.toString())) return true;
  if (ownerId.toString() === viewerId.toString()) return true;
  return false;
}

router.post("/", AuthMiddleware, async (req, res) => {
  try {
    const { title, image, caption } = req.body;
    const userId = typeof req.user === "string" ? req.user : req.user.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const newPost = new Post({
      user: userId,
      title: title || "",
      image: image || null,
      caption: caption || "",
      likes: [],
      comments: [],
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/", AuthMiddleware, async (req, res) => {
  try {
    const viewerId = typeof req.user === "string" ? req.user : req.user.id;
    const posts = await Post.find()
      .populate("user", "username avatar isPrivate followers")
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 });

    const visiblePosts = posts.filter(p => canViewPosts(viewerId, p.user._id));
    res.json(visiblePosts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/user", AuthMiddleware, async (req, res) => {
  try {
    const userId = typeof req.user === "string" ? req.user : req.user.id;
    const posts = await Post.find({ user: userId })
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/user/:userId", AuthMiddleware, async (req, res) => {
  try {
    const viewerId = typeof req.user === "string" ? req.user : req.user.id;
    const ownerId = req.params.userId;

    const canView = await canViewPosts(viewerId, ownerId);
    if (!canView) return res.status(403).json({ private: true, message: "This account is private" });

    const posts = await Post.find({ user: ownerId })
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", AuthMiddleware, async (req, res) => {
  try {
    const userId = typeof req.user === "string" ? req.user : req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (post.user.toString() !== userId) return res.status(401).json({ msg: "Not authorized" });

    await Post.deleteOne({ _id: req.params.id });
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.put("/:id/like", AuthMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const viewerId = typeof req.user === "string" ? req.user : req.user.id;
    const canView = await canViewPosts(viewerId, post.user._id);
    if (!canView) return res.status(403).json({ private: true, message: "This account is private" });

    if (!post.likes) post.likes = [];

    if (post.likes.includes(viewerId)) {
      post.likes = post.likes.filter(id => id.toString() !== viewerId.toString());
    } else {
      post.likes.push(viewerId);
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: post.likes.includes(viewerId) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/comment", AuthMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const viewerId = typeof req.user === "string" ? req.user : req.user.id;
    const canView = await canViewPosts(viewerId, post.user._id);
    if (!canView) return res.status(403).json({ private: true, message: "This account is private" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    if (!post.comments) post.comments = [];

    const comment = { _id: new mongoose.Types.ObjectId(), user: viewerId, text, date: new Date() };
    post.comments.push(comment);

    await post.save();
    await post.populate("comments.user", "username avatar");
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/comments", AuthMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user")
      .populate("comments.user", "username avatar");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const viewerId = typeof req.user === "string" ? req.user : req.user.id;
    const canView = await canViewPosts(viewerId, post.user._id);
    if (!canView) return res.status(403).json({ private: true, message: "This account is private" });

    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;



