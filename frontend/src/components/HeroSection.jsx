import React from "react";
import { ArrowRight, Github } from "lucide-react";
import { Link } from "react-router";

const HeroSection = () => {
  return (
    <div>
      {/* Large Text */}
      <div className="text-5xl md:text-7xl font-bold text-center mt-20 text-gray-800 space-x-4">
        Automated Pull Request
        <br /> Analysis &
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
        <p className="text-4xl font-bold tracking-widest">Everything you need for better code quality</p>
        <p className="font-mono text-xl mt-4">Comprehensive tools to analyze, improve, and maintain high-quality <br />codebases across your organization.</p>
      </div>
    </div>
  );
};

export default HeroSection;
