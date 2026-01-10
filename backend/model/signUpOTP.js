const mongoose = require("mongoose");

const signUpOTPSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
})

const signUpOTP = mongoose.model("SignUpOTP", signUpOTPSchema);

module.exports = signUpOTP;