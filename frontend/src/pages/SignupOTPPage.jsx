import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router";
import { sendSignupOTP, verifySignupOTP } from "../lib/api";

const SignupOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!email) {
      toast.error("Email missing. Please signup again.");
      navigate("/signup");
      return;
    }

    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      await verifySignupOTP(email, otp);

      toast.success("Account verified successfully 🎉");

      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer !== 0) return;

    try {
      await sendSignupOTP(email);
      toast.success("OTP resent to your email");
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <img src="/PR_icon.png" alt="PR icon" className="h-12 w-12" />
        <p className="font-bold text-2xl text-gray-800">MergeMind</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Verify Your Email 🔐
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Enter the OTP sent to:
          <br />
          <span className="font-medium text-blue-700">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* OTP Input */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">OTP</label>
            <input
              type="text"
              maxLength="6"
              placeholder="Enter 6-digit OTP"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none 
                         focus:ring-2 focus:ring-blue-600 tracking-widest text-center 
                         text-xl font-bold"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                       transition-all duration-300 font-semibold shadow-md"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Timer + Resend */}
          <div className="text-center mt-2 text-sm text-gray-600">
            {timer > 0 ? (
              <p>
                Resend OTP in <span className="font-bold">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-blue-600 hover:underline font-medium"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupOTPPage;
