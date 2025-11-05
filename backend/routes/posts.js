const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const AuthMiddleware = require("../middleware/auth");

// CREATE POST (Base64 image)
router.post("/", AuthMiddleware, async (req, res) => {
  try {
    const { title, image } = req.body; // Base64 image

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newPost = new Post({
      user: req.user.id,
      title: title || "",
      image: image || null, // Save Base64
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL POSTS
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET LOGGED-IN USER POSTS
router.get("/user", AuthMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", "username avatar");

    res.json(posts);
  } catch (err) {
    console.error("Get user posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET POSTS FOR ANY USER
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username avatar");

    res.json(posts);
  } catch (err) {
    console.error("Get user posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE POST
router.delete("/:id", AuthMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
