const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar")
      .populate("followRequests", "username avatar")
      .populate("notifications.from", "username avatar");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", auth, async (req, res) => {
  try {
    const username = req.query.username || "";
    if (!username.trim()) return res.json({ users: [] });

    const users = await User.find({
      username: { $regex: username, $options: "i" }
    }).select("username avatar followers following followRequests isPrivate");

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/notifications", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("notifications.from", "username avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    const notifications = (user.notifications || [])
      .map(n => ({
        _id: n._id || new mongoose.Types.ObjectId(),
        type: n.type || "unknown",
        from: n.from || null,
        message: n.message || "",
        date: n.date || new Date(),
        read: !!n.read,
        status: n.status || "unknown"
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const profile = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "_id username avatar")
      .populate("following", "_id username avatar")
      .populate("followRequests", "_id username avatar");

    if (!profile) return res.status(404).json({ message: "User not found" });

    const me = req.user.id.toString();
    const profileId = profile._id.toString();

    if (
      profileId === me ||
      !profile.isPrivate ||
      profile.followers.some(f => f._id.toString() === me)
    ) {
      return res.json({ user: profile });
    }

    return res.json({
      user: {
        _id: profile._id,
        username: profile.username,
        avatar: profile.avatar || "/default-avatar.png",
        isPrivate: profile.isPrivate
      },
      message: "This profile is private"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/notifications/ignore/:notifId", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    if (!me) return res.status(404).json({ message: "User not found" });

    me.notifications = (me.notifications || []).filter(
      n => n._id.toString() !== req.params.notifId
    );

    await me.save();

    res.json({ message: "Notification ignored" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

