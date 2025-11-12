const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

router.post("/request/:targetId", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const target = await User.findById(req.params.targetId);

    if (!target) return res.status(404).json({ message: "User not found" });
    if (me._id.equals(target._id))
      return res.status(400).json({ message: "You cannot follow yourself" });

    if (!target.isPrivate) {
      if (!target.followers.includes(me._id)) {
        target.followers.push(me._id);
        me.following.push(target._id);
        await target.save();
        await me.save();
      }
      return res.json({ message: "Followed successfully", direct: true });
    }

    if (target.followRequests.includes(me._id))
      return res.status(400).json({ message: "Request already sent" });

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
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/accept/:requesterId", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const requester = await User.findById(req.params.requesterId);
    if (!requester) return res.status(404).json({ message: "User not found" });

    me.followRequests = me.followRequests.filter(
      (id) => !id.equals(requester._id)
    );

    if (!me.followers.includes(requester._id)) {
      me.followers.push(requester._id);
      requester.following.push(me._id);
    }

    await me.save();
    await requester.save();
    res.json({ message: "Follow request accepted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reject/:requesterId", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    me.followRequests = me.followRequests.filter(
      (id) => !id.equals(req.params.requesterId)
    );
    await me.save();
    res.json({ message: "Follow request rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/unfollow/:targetId", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const target = await User.findById(req.params.targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    me.following = me.following.filter((id) => !id.equals(target._id));
    target.followers = target.followers.filter((id) => !id.equals(me._id));

    await me.save();
    await target.save();
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/followers/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("followers", "username avatar")
      .select("followers");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/following/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("following", "username avatar")
      .select("following");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;





