const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    githubId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    htmlUrl: {
      type: String,
    },
    private: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    language: {
      type: String,
    },
    forksCount: {
      type: Number,
      default: 0,
    },
    stargazersCount: {
      type: Number,
      default: 0,
    },
    watchersCount: {
      type: Number,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Repo = mongoose.model("Repo", repoSchema);

module.exports = Repo;
