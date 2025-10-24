const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth"); 
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOADS_FOLDER = "uploads";
if (!fs.existsSync(UPLOADS_FOLDER)) fs.mkdirSync(UPLOADS_FOLDER);

//multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_FOLDER),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

//post is created
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const newPost = new Post({
      user: req.user.id,
      title,
      image: req.file ? req.file.filename : null,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Create post error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

//get all the post
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
  router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).populate("userId", "username avatar");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: "Post not found" });

    //allows only the user to delete their posts
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await post.remove();
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

});

module.exports = router;


