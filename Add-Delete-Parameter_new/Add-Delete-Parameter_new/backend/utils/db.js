const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Add-Delete-Parameter");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
  }
};

module.exports = connectDB;
