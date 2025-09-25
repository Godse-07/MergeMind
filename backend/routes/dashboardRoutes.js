const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const { getDashboardStats } = require("../controller/dashboardController");

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", isLoggedIn, getDashboardStats);

module.exports = dashboardRouter;
