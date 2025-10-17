const express = require("express");
const {
  loginController,
  signupController,
  logoutController,
  connectGithubController,
  disconnectGithubController,
  reconnectWebhooksController,
} = require("../controller/authController");
const isLoggedIn = require("../middleware/isLoggedIn");
const authRouter = express.Router();

authRouter.post("/login", loginController);

authRouter.post("/signup", signupController);

authRouter.get("/logout", logoutController);

authRouter.get("/connectGithub/callback", connectGithubController);

authRouter.get("/disconnectGithub", isLoggedIn, disconnectGithubController);

authRouter.get("/me", isLoggedIn, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = authRouter;
