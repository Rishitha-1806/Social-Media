const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const users = await User.find();
    console.log("Users in DB:", users);
    mongoose.connection.close();
  })
  .catch(err => console.error("DB connection error:", err));
