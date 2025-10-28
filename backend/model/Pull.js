const mongoose = require("mongoose");
const { formatToReadable } = require("../config/dateFunction");
const Repo = require("./Repo");

const pullSchema = new mongoose.Schema(
  {
    repo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repo",
      required: true,
    },
    prNumber: { type: Number },
    title: { type: String },
    user: {
      username: { type: String },
      avatar: { type: String },
      profile: { type: String },
    },

    actions: [
      {
        action: { type: String },
        timestamp: {
          type: String,
          default: () => formatToReadable(new Date()),
        },
      },
    ],
    state: {
      type: String,
      enum: ["open", "closed", "merged"],
      default: "open",
    },
    fileStats: {
      totalFilesChanged: { type: Number, default: 0 },
      totalAdditions: { type: Number, default: 0 },
      totalDeletions: { type: Number, default: 0 },
    },
    healthScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

async function updateRepoStats(repoId) {
  const Pull = mongoose.model("Pull");

  const pulls = await Pull.find({ repo: repoId });
  const totalPRs = pulls.length;
  const openPRs = pulls.filter(p => p.state === "open").length;
  const totalAnalyzedPRs = pulls.filter(p => p.healthScore !== undefined).length;

  const avgHealth =
    pulls.reduce((acc, p) => acc + (p.healthScore || 0), 0) /
    (totalAnalyzedPRs || 1);

  await Repo.findByIdAndUpdate(repoId, {
    $set: {
      "stats.totalPRs": totalPRs,
      "stats.openPRs": openPRs,
      "stats.totalAnalyzedPRs": totalAnalyzedPRs,
      "stats.averageHealthScore": Math.round(avgHealth),
    },
  });
}

pullSchema.post("save", async function () {
  await updateRepoStats(this.repo);
});

pullSchema.post("deleteOne", { document: true, query: false }, async function () {
  await updateRepoStats(this.repo);
});


const Pull = mongoose.model("Pull", pullSchema);

module.exports = Pull;
