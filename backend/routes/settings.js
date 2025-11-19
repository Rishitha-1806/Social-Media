const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const User = require("../models/User");

const UPLOADS_FOLDER = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOADS_FOLDER)) fs.mkdirSync(UPLOADS_FOLDER);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_FOLDER),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.put("/privacy", auth, async (req, res) => {
  try {
    const { isPrivate } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isPrivate },
      { new: true }
    );
    res.json({ success: true, isPrivate: user.isPrivate });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/profile", auth, upload.single("avatar"), async (req, res) => {
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.bio) updates.bio = req.body.bio;
    if (req.file) updates.avatar = "/uploads/" + req.file.filename;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ error: "Incorrect old password" });

    user.password = newPassword;
    await user.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/deactivate", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: "Account deactivated" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("username avatar bio isPrivate"); // select only relevant fields
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      isPrivate: user.isPrivate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
