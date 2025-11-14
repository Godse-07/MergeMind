const passwordEncryption = require("../config/passwordEncryption");
const bcrypt = require("bcryptjs");
const {
  generateForgotPasswordEmail,
} = require("../helper/passwordForgetEmailTemplate");
const PasswordForget = require("../model/ForgetPassword");
const User = require("../model/User");
const sendMail = require("../utils/mailer");

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = await passwordEncryption(otp);

    await PasswordForget.create({
      email,
      otp: hashedOTP,
      isUsed: false,
    });

    await sendMail({
      to: email,
      subject: "Password Reset OTP - MergeMind",
      html: generateForgotPasswordEmail({ otp }),
    });

    return res.json({
      success: true,
      message: "OTP sent successfully to email",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const record = await PasswordForget.findOne({ email }).sort({
      createdAt: -1,
    });
    if (!record)
      return res
        .status(400)
        .json({ success: false, message: "OTP not found or expired" });

    if (record.isUsed)
      return res
        .status(400)
        .json({ success: false, message: "OTP already used" });

    const isValid = await bcrypt.compare(otp, record.otp);
    if (!isValid)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    record.isUsed = true;
    await record.save();
    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await passwordEncryption(newPassword);
    user.password = hashedPassword;
    await user.save();
    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  forgetPassword,
  verifyOTP,
  resetPassword,
};
