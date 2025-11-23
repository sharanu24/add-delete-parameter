const mongoose = require("mongoose");

const parameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Parameter = mongoose.model("Parameter", parameterSchema);

module.exports = Parameter;