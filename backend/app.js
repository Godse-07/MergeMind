const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
require("dotenv").config({ path: envFile });
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/authRoutes");
const repoRouter = require("./routes/repoRoutes");
const webhookRouter = require("./routes/webhookRoutes");
const prRouter = require("./routes/prRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");
const passwordForgetRouter = require("./routes/passwordForgetRoutes");
const rulesRouter = require("./routes/rulesRoute");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://www.mergemind.me",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/repositories", repoRouter);

app.use("/api/webhooks", webhookRouter);

app.use("/api/pr", prRouter);

app.use("/api/dashboard", dashboardRouter);

app.use("/api/password-forget", passwordForgetRouter);

app.use("/api/rules", rulesRouter);

app.get("/", (req, res) => {
  res.send("Welcome to MergeMind API");
});

module.exports = app;
