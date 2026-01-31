const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    githubConnected: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    githubToken: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    usage: {
      monthlyTokenLimit: {
        type: Number,
        default: 100_000,
      },
      tokensUsedThisMonth: {
        type: Number,
        default: 0,
      },
      resetAt: {
        type: Date,
        default: () => {
          const d = new Date();
          d.setMonth(d.getMonth() + 1, 1);
          d.setHours(0, 0, 0, 0);
          return d;
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
