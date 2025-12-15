const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const { getRules, setRules } = require("../controller/rulesController");

const rulesRouter = express.Router();

rulesRouter.get("/getRules", isLoggedIn, getRules);

rulesRouter.post("/setRules", isLoggedIn, setRules);

module.exports = rulesRouter;