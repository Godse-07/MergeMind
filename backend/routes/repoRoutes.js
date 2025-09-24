const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const { repoController } = require("../controller/repoController");

const repoRouter = express.Router();

repoRouter.get("/repos", isLoggedIn, repoController);

module.exports = repoRouter;
