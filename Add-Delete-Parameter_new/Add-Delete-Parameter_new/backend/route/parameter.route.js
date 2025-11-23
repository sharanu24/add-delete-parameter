const express = require("express");
const {
  getParameters,
  createParameter,
  deleteParameter,
} = require("../controler/parameter.controler");

const parameterRoute = express.Router();

parameterRoute.get("/fetch", getParameters);
parameterRoute.post("/create", createParameter);
parameterRoute.delete("/delete", deleteParameter);

module.exports = parameterRoute;
