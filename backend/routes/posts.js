const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const AuthMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const UPLOADS_FOLDER = "uploads";
if (!fs.existsSync(UPLOADS_FOLDER)) fs.mkdirSync(UPLOADS_FOLDER);

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_FOLDER),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// -------------------- Create Post --------------------
router.post("/", AuthMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const newPost = new Post({
      user: req.user.id,
      title,
      image: req.file ? `uploads/${req.file.filename}` : null,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Create post error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- Get All Posts --------------------
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "username avatar").sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- Get Posts for Logged-in User --------------------
router.get("/user", AuthMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).populate("user", "username avatar");
    res.json(posts);
  } catch (err) {
    console.error("Get user posts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- Get Posts for Any User (Profile Page) --------------------
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).populate("user", "username avatar");
    res.json(posts);
  } catch (err) {
    console.error("Get user posts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- Delete Post --------------------
router.delete("/:id", AuthMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Only owner can delete
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Delete image file if exists
    if (post.image) {
      const imagePath = path.join(__dirname, "..", post.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await post.deleteOne();
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
