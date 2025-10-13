const mongoose = require("mongoose");
const { formatToReadable } = require("../config/dateFunction");

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
  },
  {
    timestamps: true,
  }
);

const Pull = mongoose.model("Pull", pullSchema);

module.exports = Pull;
