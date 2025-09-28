require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoConnection = require("./config/db");
const authRouter = require("./routes/authRoutes");
const repoRouter = require("./routes/repoRoutes");
const webhookRouter = require("./routes/webhookRoutes");
const prRouter = require("./routes/prRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/repositories", repoRouter);

app.use("/api/webhooks", webhookRouter);

app.use("/api/pr", prRouter)

app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.send("Welcome to MergeMind API");
});

module.exports = app;