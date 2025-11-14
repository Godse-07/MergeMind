import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router";
import { resetPassword } from "../lib/api";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Email missing. Please try again.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, newPassword);

      toast.success("Password reset successful 🎉");

      setTimeout(() => navigate("/login"), 500);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
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
          Reset Password 🔒
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Set a new password for:
          <br />
          <span className="font-medium text-blue-700">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* New Password */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                       transition-all duration-300 font-semibold shadow-md"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                ></path>
              </svg>
            ) : (
              "Reset Password"
            )}
          </button>

          {/* Back Link */}
          <p className="text-center text-sm text-gray-600 mt-2">
            Want to login instead?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              Go to Login
            </a>
          </p>

        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
