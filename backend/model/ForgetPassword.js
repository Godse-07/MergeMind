const mongoose = require("mongoose");

const passwordForgetSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

const PasswordForget = mongoose.model("PasswordForget", passwordForgetSchema);

module.exports = PasswordForget;
