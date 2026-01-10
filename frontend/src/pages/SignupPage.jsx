import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { sendSignupOTP, signUp } from "../lib/api";
import { useNavigate } from "react-router";

const SignupPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password } = formData;

    if (!fullName || !email || !password) {
      toast.error("Please fill all the fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signUp(formData);
      toast.success("Signup successful!");
      setFormData({
        fullName: "",
        email: "",
        password: "",
      });
      await sendSignupOTP(email);
      navigate("/signup-otp", {
        state: { email }
      });
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
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
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-8">
        {/* Left Side - Form */}
        <form
          onSubmit={formSubmit}
          className="flex flex-col gap-5 w-full md:w-1/2"
        >
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-2">
            Create Account ✨
          </h2>
          <p className="text-center text-gray-500 mb-4">
            Join MergeMind and start building smarter!
          </p>

          {/* Full Name */}
          <div className="flex flex-col">
            <label
              htmlFor="fullName"
              className="mb-2 font-semibold text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-2 font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Password with Eye Toggle */}
          <div className="flex flex-col relative">
            <label
              htmlFor="password"
              className="mb-2 font-semibold text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button with Loading Spinner */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>Signing up...</span>
              </>
            ) : (
              "Sign Up"
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-2">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </a>
          </p>
        </form>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-300 h-56" />

        {/* Right Side - Image and Text */}
        <div className="flex flex-col items-center gap-4 w-full md:w-1/2">
          <img
            src="/Merge_Mind.jpg"
            alt="MergeMind"
            className="h-44 w-44 rounded-full object-cover shadow-lg"
          />
          <p className="text-center text-gray-700">
            Welcome to{" "}
            <span className="font-semibold text-blue-600">MergeMind</span>!{" "}
            <br />
            Start your journey with us 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
