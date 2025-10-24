const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String },
  content: { type: String },
  // filename of the uploaded image
  image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);




