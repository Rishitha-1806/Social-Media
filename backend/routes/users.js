const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { AuthMiddleware } = require("../middleware/auth"); // make sure this checks token
const User = require("../models/User");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

//avatar will be updated
router.put("/avatar", AuthMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: req.file.filename },
      { new: true }
    );

    res.json({
      message: "Avatar updated successfully",
      avatar: updatedUser.avatar,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
