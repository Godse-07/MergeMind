const mongoose = require("mongoose");
const { formatToReadable } = require("../config/dateFunction");

const suggestionSchema = new mongoose.Schema({
  severity: {
    type: String,
    enum: ["error", "warning", "info"],
    required: true,
  },
  description: { type: String, required: true },
  file: { type: String },
  suggestedFix: { type: String },
});

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  count: { type: Number, default: 0 },
});

const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  type: {
    type: String,
    enum: ["comment", "suggestion", "approval"],
    default: "comment",
  },
  reactions: { type: [reactionSchema], default: [] },
});

const prAnalysisSchema = new mongoose.Schema(
  {
    pull: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pull",
      required: true,
      unique: true,
    },
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true },
    title: { type: String },
    author: { type: String },
    created: { type: String },
    status: {
      type: String,
      enum: ["open", "closed", "merged"],
      default: "open",
    },
    healthScore: { type: Number },
    filesChanged: { type: Number },
    linesAdded: { type: Number },
    linesDeleted: { type: Number },
    commits: { type: Number },
    suggestions: { type: [suggestionSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    analyzedAt: { type: String, default: () => formatToReadable(new Date()) },
  },
  { timestamps: true }
);

const PRAnalysis = mongoose.model("PRAnalysis", prAnalysisSchema);

module.exports = PRAnalysis;
