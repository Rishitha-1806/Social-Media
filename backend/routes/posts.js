const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const AuthMiddleware = require("../middleware/auth");

router.post("/", AuthMiddleware, async (req, res) => {
  try {
    const { title, image } = req.body;
    const userId = typeof req.user === "string" ? req.user : req.user.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const newPost = new Post({
      user: userId,
      title: title || "",
      image: image || null,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username avatar isPrivate")
      .sort({ createdAt: -1 });

    const visiblePosts = posts.filter(p => !p.user.isPrivate);
    res.json(visiblePosts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

async function canViewPosts(viewerId, ownerId) {
  const owner = await User.findById(ownerId);
  if (!owner.isPrivate) return true;
  if (viewerId && owner.followers.includes(viewerId)) return true;
  return false;
}

router.get("/user", AuthMiddleware, async (req, res) => {
  try {
    const userId = typeof req.user === "string" ? req.user : req.user.id;
    const posts = await Post.find({ user: userId }).populate("user", "username avatar");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/user/:userId", AuthMiddleware, async (req, res) => {
  try {
    const canView = await canViewPosts(req.user, req.params.userId);
    if (!canView) return res.status(403).json({ private: true, message: "This account is private" });

    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username avatar");
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
    await post.deleteOne();
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.put("/:id/like", AuthMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });
    const canView = await canViewPosts(req.user, post.user._id);
    if (!canView) return res.status(403).json({ private: true, message: "This account is private" });

    const userId = typeof req.user === "string" ? req.user : req.user.id;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: post.likes.includes(userId) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/comment", AuthMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });
    const canView = await canViewPosts(req.user, post.user._id);
    if (!canView) return res.status(403).json({ private: true, message: "This account is private" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const userId = typeof req.user === "string" ? req.user : req.user.id;
    const comment = { user: userId, text };
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

    const canView = await canViewPosts(req.user, post.user._id);
    if (!canView) return res.status(403).json({ private: true, message: "This account is private" });

    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;



