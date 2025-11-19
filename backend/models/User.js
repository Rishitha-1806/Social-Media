const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    type: { type: String, default: "unknown" },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    message: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "accepted", "followed", "ignored", "unknown", "notified"],
      default: "unknown"
    }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "/default-avatar.png" },
  isPrivate: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  notifications: { type: [NotificationSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
