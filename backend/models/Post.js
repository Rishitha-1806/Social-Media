const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    image: { type: String }, // Base64 string stored directly
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);





