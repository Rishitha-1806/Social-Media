const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const UPLOADS_FOLDER = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOADS_FOLDER)) fs.mkdirSync(UPLOADS_FOLDER);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_FOLDER),
  filename: (req, file, cb) => cb(null, `${req.user.id}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

// ---------------------------
// Get user profile
// ---------------------------
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
    res.json({ user, posts });
  } catch (err) {
    console.error("Get user profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// Update avatar
// ---------------------------
router.put("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarPath },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Avatar updated successfully", avatar: user.avatar });
  } catch (err) {
    console.error("Update avatar error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;




