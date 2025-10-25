const mongoose = require("mongoose");
const { formatToReadable } = require("../config/dateFunction");

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
    lastPushedAt: {
      type: String,
      default: formatToReadable(new Date()),
    },
    lastPrActivity: {
      type: String,
    },
    lastPushedBy: {
      username: { type: String },
      email: { type: String },
    },
    lastPrBy: {
      username: { type: String },
      avatar: { type: String },
      profile: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

repoSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const repoId = this._id;
      await Promise.all([
        mongoose.model("Push").deleteMany({ repo: repoId }),
        mongoose.model("Pull").deleteMany({ repo: repoId }),
      ]);
      console.log(`🧹 Cleaned up Push & Pull data for repo ${this.fullName}`);
      next();
    } catch (err) {
      console.error("Error cleaning up related data:", err);
      next(err);
    }
  }
);

const Repo = mongoose.model("Repo", repoSchema);

module.exports = Repo;
