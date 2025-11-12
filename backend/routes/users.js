const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

router.get("/search", auth, async (req, res) => {
  try {
    const username = req.query.username;
    if (!username || username.trim() === "") return res.json({ users: [] });

    const users = await User.find({
      username: { $regex: username, $options: "i" },
    }).select("username avatar followers following followRequests isPrivate");

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user)
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar")
      .populate("followRequests", "username avatar")
      .populate({
        path: "notifications.from",
        select: "username avatar isPrivate"
      });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "_id username avatar")
      .populate("following", "_id username avatar")
      .populate("followRequests", "_id username avatar");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/follow/:id", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user);
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.isPrivate) return res.status(400).json({ message: "User is private, send request instead" });

    if (!me.following.includes(target._id)) me.following.push(target._id);
    if (!target.followers.includes(me._id)) target.followers.push(me._id);

    target.notifications.push({
      type: "follow",
      from: me._id,
      message: `${me.username} started following you`,
      date: new Date(),
      read: false,
    });

    await me.save();
    await target.save();
    res.json({ message: "Followed successfully", direct: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/request/:id", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user);
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });

    if (target.followRequests.includes(me._id))
      return res.status(400).json({ message: "Request already sent" });

    if (!target.isPrivate) {
      if (!me.following.includes(target._id)) me.following.push(target._id);
      if (!target.followers.includes(me._id)) target.followers.push(me._id);

      target.notifications.push({
        type: "follow",
        from: me._id,
        message: `${me.username} started following you`,
        date: new Date(),
        read: false,
      });

      await me.save();
      await target.save();
      return res.json({ message: "Followed successfully", direct: true });
    }

    target.followRequests.push(me._id);
    target.notifications.push({
      type: "follow",
      from: me._id,
      message: `${me.username} sent you a follow request`,
      date: new Date(),
      read: false,
    });

    await target.save();
    res.json({ message: "Follow request sent", direct: false });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/requests/accept/:id", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user);
    const requester = await User.findById(req.params.id);
    if (!requester) return res.status(404).json({ message: "User not found" });

    me.followRequests = me.followRequests.filter(id => !id.equals(requester._id));

    if (!me.followers.includes(requester._id)) me.followers.push(requester._id);
    if (!requester.following.includes(me._id)) requester.following.push(me._id);

    requester.notifications.push({
      type: "follow",
      from: me._id,
      message: `${me.username} accepted your follow request`,
      date: new Date(),
      read: false,
    });

    await me.save();
    await requester.save();
    res.json({ message: "Request accepted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/requests/reject/:id", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user);
    me.followRequests = me.followRequests.filter(id => !id.equals(req.params.id));
    await me.save();
    res.json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/notifications/ignore/:id", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user);
    me.notifications = me.notifications.filter(n => n._id.toString() !== req.params.id);
    await me.save();
    res.json({ message: "Notification ignored" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/unfollow/:id", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user);
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });

    me.following = me.following.filter(id => !id.equals(target._id));
    target.followers = target.followers.filter(id => !id.equals(me._id));

    await me.save();
    await target.save();
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;










