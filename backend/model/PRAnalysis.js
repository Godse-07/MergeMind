const mongoose = require("mongoose");
const { formatToReadable } = require("../config/dateFunction");

const prAnalysisSchema = new mongoose.Schema(
  {
    pull: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pull",
      required: true,
      unique: true,
    },
    repo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repo",
      required: true,
    },
    score: { type: Number },
    filesChanged: { type: Number },
    linesAdded: { type: Number },
    linesDeleted: { type: Number },
    commits: { type: Number },
    suggestions: [
      {
        severity: { type: String },
        description: { type: String },
        file: { type: String },
        suggestedFix: { type: String },
      },
    ],
    analyzedAt: { type: String, default: () => formatToReadable(new Date()) },
  },
  {
    timestamps: true,
  }
);

const PRAnalysis = mongoose.model("PRAnalysis", prAnalysisSchema);

module.exports = PRAnalysis;
