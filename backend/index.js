require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoConnection = require("./config/db");
const authRouter = require("./routes/authRoutes");
const repoRouter = require("./routes/repoRoutes");

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/repositories", repoRouter);

app.get("/", (req, res) => {
  res.send("Welcome to MergeMind API");
})

mongoConnection().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
