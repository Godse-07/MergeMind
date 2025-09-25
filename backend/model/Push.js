const mongoose = require("mongoose");
const { formatToReadable } = require("../config/dateFunction");

const pushSchema = new mongoose.Schema({
     repo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repo",
      required: true,
    },
    user: {
      username: { type: String },
      email: { type: String },
    },
    branch: { type: String },
    commitId: { type: String },
    message: { type: String },
    timestamp: { type: String, default: () => formatToReadable(new Date()) },
  },
  {
    timestamps: true,
  }
)

const Push = mongoose.model("Push", pushSchema);

module.exports = Push;