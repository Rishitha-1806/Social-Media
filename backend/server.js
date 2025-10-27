const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

//loada the environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1); //stops the server if DB is not connected
});

//routes
app.use("/api/auth", require("./routes/auth")); 
app.use("/api/users", require("./routes/users")); 
app.use("/api/posts", require("./routes/posts")); 

//default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

//starts the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

