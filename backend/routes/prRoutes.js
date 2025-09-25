const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const { 
    getRepoPRs, 
    getPRDetails, 
    triggerPRAnalysis 
} = require("../controller/prController");

const prRouter = express.Router();

prRouter.get("/:repoId/prs", isLoggedIn, getRepoPRs);

prRouter.get("/:repoId/prs/:prNumber", isLoggedIn, getPRDetails);

prRouter.post("/:repoId/prs/:prNumber/analyze", isLoggedIn, triggerPRAnalysis);

module.exports = prRouter;