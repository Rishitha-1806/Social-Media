const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------
// Middleware
// -----------------------
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------
// MongoDB connection
// -----------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1); // Stop server if DB not connected
});

// -----------------------
// Routes
// -----------------------
app.use("/api/auth", require("./routes/auth")); // login/register
app.use("/api/users", require("./routes/users")); // profile, avatar update
app.use("/api/posts", require("./routes/posts")); // posts CRUD

// -----------------------
// Default route
// -----------------------
app.get("/", (req, res) => {
  res.send("API is running...");
});

// -----------------------
// Start server
// -----------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

