const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Post = require("../models/Post");
const AuthMiddleware = require("../middleware/auth"); // ✅ corrected import

// ------------------------
// Multer setup for avatar
// ------------------------
const UPLOADS_FOLDER = "uploads";
if (!fs.existsSync(UPLOADS_FOLDER)) fs.mkdirSync(UPLOADS_FOLDER);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_FOLDER),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// ------------------------
// GET user profile by ID
// ------------------------
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

// ------------------------
// UPDATE avatar
// ------------------------
router.put("/avatar", AuthMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const userId = req.user.id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: req.file.filename },
      { new: true }
    );

    res.json({ message: "Avatar updated successfully", avatar: updatedUser.avatar });
  } catch (err) {
    console.error("Update avatar error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

