const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./utils/db");
require("dotenv").config();
const parameterRoute = require("./route/parameter.route");
const { syncParametersFromFile } = require("./controler/parameter.controler");
const rootDir = require("./utils/pathUtil");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("✅ Server is up and running");
});

app.use("/parameter", parameterRoute);

connectDB().then(() => {
  syncParametersFromFile().then(() => {
    // Start the server after syncing
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  });
});
