const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const { syncRepo } = require("../controller/syncController");

const syncRouter = express.Router();

syncRouter.post("/repo/:repoId", isLoggedIn, syncRepo);

module.exports = syncRouter;