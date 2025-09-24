const express = require("express");
const { githubWebhookController } = require("../controller/webhookController");

const webhookRouter = express.Router();

webhookRouter.post("/github", express.json({ type: "application/json" }), githubWebhookController);

module.exports = webhookRouter;