import React, { useContext } from "react";
import {
  Activity,
  ArrowRight,
  ChartColumn,
  CircleCheckBig,
  Github,
  Lightbulb,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { UserContext } from "./../context/UserContext";
import toast from "react-hot-toast";
import { logOut } from "../lib/api";

const HeroSection = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try{
      const res = await logOut();
      toast.success(res.message);
      setUser(null);
      navigate('/');
    }catch(err){
      toast.error(err.response.data.message)
    }
  }

  return (
    <div>
      {/* Large Text */}
      <div className="text-5xl md:text-7xl font-bold text-center mt-20 text-gray-800 space-x-4">
        Automated Pull Request
        <br /> Analysis &{" "}
        <span className="text-blue-600">
          Code Quality <br /> Insights
        </span>
      </div>

      {/* Small Text */}
      <div className="text-center mt-6 text-gray-600 text-xl md:text-xl px-4 md:px-0">
        <p>
          Improve your code quality with intelligent PR analysis. Connect your{" "}
          <br />
          Github repository and get instant feedback on your pull requests.
        </p>
      </div>

      {/* Button */}
      {!user && (
        <div className="text-center mt-16">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Github className="h-5 w-5" />
            <span>Get Started with GitHub</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      )}

      {/* Boxes with Example */}
      <div className="mt-20 mb-10 flex justify-center">
        <div className="w-[90%] bg-blue-50 py-10 px-8 rounded-2xl shadow-md flex flex-wrap justify-around gap-8">
          {/* Box 1 */}
          <div className="bg-white w-80 p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
            <p className="text-gray-700 text-sm mb-2 font-medium">
              🟢 PR #247 -{" "}
              <span className="font-semibold">Feature/auth-improvements</span>
            </p>
            <h2 className="text-green-600 font-bold text-4xl mb-2">94/100</h2>
            <p className="text-gray-500 text-sm">Health Score</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "94%" }}
              ></div>
            </div>
          </div>

          {/* Box 2 */}
          <div className="bg-white w-80 p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
            <p className="text-gray-700 text-sm mb-2 font-medium">
              🟡 PR #248 -{" "}
              <span className="font-semibold">UI tweaks for dashboard</span>
            </p>
            <h2 className="text-yellow-500 font-bold text-4xl mb-2">76/100</h2>
            <p className="text-gray-500 text-sm">Health Score</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: "76%" }}
              ></div>
            </div>
          </div>

          {/* Box 3 */}
          <div className="bg-white w-80 p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
            <p className="text-gray-700 text-sm mb-2 font-medium">
              🔴 PR #249 -{" "}
              <span className="font-semibold">Refactor old utils</span>
            </p>
            <h2 className="text-red-600 font-bold text-4xl mb-2">52/100</h2>
            <p className="text-gray-500 text-sm">Health Score</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: "52%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Another text */}
      <div className="text-center mt-20">
        <p className="text-4xl font-bold tracking-widest">
          Everything you need for better code quality
        </p>
        <p className="font-mono text-xl mt-4">
          Comprehensive tools to analyze, improve, and maintain high-quality{" "}
          <br />
          codebases across your organization.
        </p>
      </div>

      {/* Features box */}
      <div className="flex justify-around w-[90%] mx-auto mt-16 items-stretch flex-wrap">
        {/* 1st box */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 m-4 flex flex-col justify-start items-start min-h-[280px] w-64">
          <CircleCheckBig />
          <h3 className="text-lg font-semibold mt-4 mb-2">
            Automated Code Reviews
          </h3>
          <p className="text-gray-600 text-sm">
            Get instant feedback on your pull requests with AI-powered code
            reviews that identify potential issues and suggest improvements.
          </p>
        </div>

        {/* 2nd box */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 m-4 flex flex-col justify-start items-start min-h-[280px] w-64">
          <ChartColumn />
          <h3 className="text-lg font-semibold mt-4 mb-2">PR Health Scoring</h3>
          <p className="text-gray-600 text-sm">
            Get instant visibility into pull request quality with comprehensive
            health scores.
          </p>
        </div>

        {/* 3rd box */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 m-4 flex flex-col justify-start items-start min-h-[280px] w-64">
          <Lightbulb />
          <h3 className="text-lg font-semibold mt-4 mb-2">
            Actionable Improvement Suggestions
          </h3>
          <p className="text-gray-600 text-sm">
            Receive specific, contextual recommendations to enhance code quality
            and maintainability.
          </p>
        </div>

        {/* 4th box */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 m-4 flex flex-col justify-start items-start min-h-[280px] w-64">
          <Activity />
          <h3 className="text-lg font-semibold mt-4 mb-2">
            Real-time Analysis Dashboard
          </h3>
          <p className="text-gray-600 text-sm">
            Monitor your repositories and track code quality trends with
            beautiful, intuitive dashboards.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 bg-gradient-to-r from-blue-600 to-blue-700 text-center text-white py-16 flex flex-col justify-center items-center px-6 rounded-t-2xl shadow-lg">
        {!user ? (
          <>
            <p className="text-4xl md:text-5xl font-extrabold drop-shadow-sm">
              Ready to improve your code quality?
            </p>
            <p className="text-lg md:text-xl tracking-wide mt-4 max-w-2xl">
              Join thousands of developers who trust PR Checker to maintain
              high-quality codebases.
            </p>
            <button
              className="mt-8 bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
              onClick={() => navigate("/login")}
            >
              <Github className="h-5 w-5" />
              Get Started with GitHub
            </button>
          </>
        ) : (
          <>
            <p className="text-4xl md:text-5xl font-extrabold drop-shadow-sm">
              Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
            </p>
            <p className="text-lg md:text-xl tracking-wide mt-4 max-w-2xl">
              You’re already improving your pull requests with PR Checker. Keep
              pushing clean, maintainable code!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 shadow-md"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </button>
              <button
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-all duration-200 shadow-md"
                onClick={() => {
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
