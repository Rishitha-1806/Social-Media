const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPrivate: { type: Boolean, default: false },
    followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notifications: [NotificationSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

