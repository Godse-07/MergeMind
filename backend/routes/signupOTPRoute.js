const express = require("express");
const {
  OTPVerifyLimiter,
  otpRequestLimiter,
} = require("../middleware/rateLimiter");
const {
  sendSignupOTP,
  verifySignupOTP,
} = require("../controller/signUpOTPController");
const signUpOTPRouter = express.Router();

signUpOTPRouter.post("/send-signup-otp", otpRequestLimiter, sendSignupOTP);

signUpOTPRouter.post("/verify-signup-otp", OTPVerifyLimiter, verifySignupOTP);

module.exports = signUpOTPRouter;
