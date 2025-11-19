const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const auth = require("../middleware/auth");

async function pushNotification(userDoc, payload) {
  userDoc.notifications = userDoc.notifications || [];
  userDoc.notifications.push({
    _id: new mongoose.Types.ObjectId(),
    type: payload.type || "unknown",
    from: payload.from || null,
    message: payload.message || "",
    date: payload.date || new Date(),
    read: typeof payload.read === "boolean" ? payload.read : false,
    status: payload.status || "unknown"
  });
}

router.get("/me", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id)
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar")
      .populate("followRequests", "username avatar");
    if (!me) return res.status(404).json({ msg: "User not found" });
    res.json({ user: me });
  } catch (err) {
    res.status(500).json({ msg: err.message || "Server error" });
  }
});

router.post("/:id", auth, async (req, res) => {
  try {
    const meId = req.user.id;
    const targetId = req.params.id;
    if (meId === targetId) return res.status(400).json({ msg: "Cannot follow self" });

    const me = await User.findById(meId);
    const target = await User.findById(targetId);
    if (!me || !target) return res.status(404).json({ msg: "User not found" });

    const meFollowing = (me.following || []).map(x => x.toString());
    if (meFollowing.includes(targetId)) return res.json({ status: "following" });

    const targetRequests = (target.followRequests || []).map(x => x.toString());
    const alreadyRequested = targetRequests.includes(meId);

    if (target.isPrivate) {
      if (!alreadyRequested) {
        target.followRequests = target.followRequests || [];
        target.followRequests.push(me._id);
        await pushNotification(target, {
          type: "follow_request",
          from: me._id,
          message: `${me.username} requested to follow you`,
          status: "pending",
          date: new Date()
        });
        await target.save();
      }
      return res.json({ status: "requested" });
    }

    me.following = me.following || [];
    target.followers = target.followers || [];
    if (!meFollowing.includes(targetId)) me.following.push(target._id);
    if (!(target.followers || []).map(x => x.toString()).includes(meId)) target.followers.push(me._id);

    await pushNotification(target, {
      type: "follow",
      from: me._id,
      message: `${me.username} started following you`,
      status: "followed",
      date: new Date()
    });

    await me.save();
    await target.save();
    return res.json({ status: "following" });
  } catch (err) {
    return res.status(500).json({ msg: err.message || "Server error" });
  }
});

router.post("/unfollow/:id", auth, async (req, res) => {
  try {
    const meId = req.user.id;
    const targetId = req.params.id;

    const me = await User.findById(meId);
    const target = await User.findById(targetId);
    if (!me || !target) return res.status(404).json({ msg: "User not found" });

    me.following = (me.following || []).filter(x => x.toString() !== targetId);
    target.followers = (target.followers || []).filter(x => x.toString() !== meId);

    await me.save();
    await target.save();
    return res.json({ status: "none" });
  } catch (err) {
    return res.status(500).json({ msg: err.message || "Server error" });
  }
});

router.post("/accept-request/:id", auth, async (req, res) => {
  try {
    const meId = req.user.id;
    const requesterId = req.params.id;

    const me = await User.findById(meId);
    const requester = await User.findById(requesterId);
    if (!me || !requester) return res.status(404).json({ msg: "User not found" });

    me.followRequests = (me.followRequests || []).filter(x => x.toString() !== requesterId);
    me.followers = me.followers || [];
    if (!me.followers.map(x => x.toString()).includes(requesterId)) me.followers.push(requester._id);

    requester.following = requester.following || [];
    if (!requester.following.map(x => x.toString()).includes(meId)) requester.following.push(me._id);

    const notif = (me.notifications || []).find(
      n => n.from && n.from.toString() === requesterId && n.type === "follow_request"
    );
    if (notif) {
      notif.status = "accepted";
      notif.date = new Date();
    }

    await pushNotification(requester, {
      type: "request_accepted",
      from: me._id,
      message: `${me.username} accepted your follow request`,
      status: "notified",
      date: new Date()
    });

    await me.save();
    await requester.save();
    return res.json({ status: "accepted" });
  } catch (err) {
    return res.status(500).json({ msg: err.message || "Server error" });
  }
});

router.post("/followback/:id", auth, async (req, res) => {
  try {
    const meId = req.user.id;
    const targetId = req.params.id;

    const me = await User.findById(meId);
    const target = await User.findById(targetId);
    if (!me || !target) return res.status(404).json({ msg: "User not found" });

    const meFollowing = (me.following || []).map(x => x.toString());
    if (!meFollowing.includes(targetId)) {
      me.following = me.following || [];
      target.followers = target.followers || [];
      me.following.push(target._id);
      target.followers.push(me._id);

      const existingTargetNotif = (target.notifications || []).find(
        n => n.from && n.from.toString() === meId && n.type === "follow" && n.status === "followed"
      );
      if (!existingTargetNotif) {
        await pushNotification(target, {
          type: "follow",
          from: me._id,
          message: `${me.username} started following you`,
          status: "followed",
          date: new Date()
        });
      }

      const myNotif = (me.notifications || []).find(
        n => n.from && n.from.toString() === targetId && (n.type === "follow_request" || n.type === "follow" || n.type === "request_accepted")
      );
      if (myNotif) {
        myNotif.type = "you_started_following";
        myNotif.status = "followed";
        myNotif.message = `You started following ${target.username}`;
        myNotif.date = new Date();
      } else {
        await pushNotification(me, {
          type: "you_started_following",
          from: target._id,
          message: `You started following ${target.username}`,
          status: "followed",
          date: new Date()
        });
      }

      await pushNotification(target, {
        type: "follow",
        from: me._id,
        message: `${me.username} started following you`,
        status: "followed",
        date: new Date()
      });

      await target.save();
    }

    await me.save();
    return res.json({ status: "following" });
  } catch (err) {
    return res.status(500).json({ msg: err.message || "Server error" });
  }
});

router.post("/ignore-request/:id", auth, async (req, res) => {
  try {
    const meId = req.user.id;
    const requesterId = req.params.id;

    const me = await User.findById(meId);
    if (!me) return res.status(404).json({ msg: "User not found" });

    me.followRequests = (me.followRequests || []).filter(x => x.toString() !== requesterId);

    const reqNoti = (me.notifications || []).find(
      n => n.from && n.from.toString() === requesterId && n.type === "follow_request"
    );
    if (reqNoti) {
      reqNoti.status = "ignored";
      reqNoti.date = new Date();
    }

    await me.save();
    return res.json({ status: "ignored" });
  } catch (err) {
    return res.status(500).json({ msg: err.message || "Server error" });
  }
});

module.exports = router;
