const express = require("express");
const { githubWebhookController, registerNewWebhook } = require("../controller/webhookController");

const webhookRouter = express.Router();

webhookRouter.post("/github", express.json({ type: "application/json" }), githubWebhookController);

webhookRouter.post("/register/:repoId", registerNewWebhook);

module.exports = webhookRouter;