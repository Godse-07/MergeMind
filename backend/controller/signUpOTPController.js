const passwordEncryption = require("../config/passwordEncryption");
const { signUpEmailTemplate } = require("./../helper/signUpEmailTemplate");
const signUpOTP = require("../model/signUpOTP");
const User = require("../model/User");
const sendMail = require("../utils/mailer");
const bcrypt = require("bcryptjs");

const sendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please signup first.",
      });
    }

    // check if the current user is already verified or not
    if (user && user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified. Please login to continue.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = await passwordEncryption(otp);

    await signUpOTP.create({
      email,
      otp: hashedOTP,
      isUsed: false,
    });

    // sending email to the user with the valid otp
    await sendMail({
      to: email,
      subject: "Verify your account - MergeMind",
      html: signUpEmailTemplate({ otp }),
    });

    return res.json({
      success: true,
      message: "Signup OTP send successfully to email",
    });
  } catch (error) {
    console.log("Error in sendSignupOTP controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const record = await signUpOTP.findOne({ email }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    if (record.isUsed) {
      return res.status(400).json({
        success: false,
        message: "OTP already used",
      });
    }

    const isValid = await bcrypt.compare(otp, record.otp);

    if (!isValid) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    record.isUsed = true;

    await record.save();

    // verify the user

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isVerified = true;
    await user.save();

    return res.json({
      success: true,
      message: "Account verified successfully. Please login.",
    });
  } catch (error) {
    console.log("Error in verifySignupOTP controller", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  sendSignupOTP,
  verifySignupOTP,
};
