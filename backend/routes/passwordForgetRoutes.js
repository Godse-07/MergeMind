const express = require("express");
const { forgetPassword, verifyOTP, resetPassword } = require("../controller/forgetPassowrdController");
const { otpRequestLimiter, OTPVerifyLimiter, resetPasswordLimiter } = require("../middleware/rateLimiter");
const passwordForgetRouter = express.Router();

passwordForgetRouter.post("/forget-password", otpRequestLimiter , forgetPassword);


passwordForgetRouter.post("/verify-otp", OTPVerifyLimiter , verifyOTP);

passwordForgetRouter.post("/reset-password", resetPasswordLimiter , resetPassword);

module.exports = passwordForgetRouter