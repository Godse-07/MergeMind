import React, { useState } from "react";
import Navbar from "../components/Navbar";
import {
  GitPullRequest,
  Settings,
  Zap,
  Check,
  Copy,
  CheckCircle,
} from "lucide-react";

const Docs = () => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(`{
  "rules": {
    "eslint": true,
    "testCoverage": {
      "enabled": true,
      "threshold": 80
    },
    "documentation": true,
    "security": true
  },
  "notifications": {
    "email": true,
    "slack": "https://hooks.slack.com/..."
  }
}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-grow">
      <Navbar />
      <div className="pt-24 w-[90%] max-w-6xl mx-auto">
        {/* HERO */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block leading-tight mb-4">
            Getting Started
          </h1>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Welcome to <span className="font-semibold">MergeMind</span>! This
            guide helps you connect GitHub, set up analysis rules, and get
            AI-powered PR insights.
          </p>
        </section>

        {/* 3-STEP CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-white hover:shadow-xl transition-shadow duration-300 rounded-2xl p-6 border border-blue-100">
            <div className="bg-blue-100 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
              <GitPullRequest className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect
            </h3>
            <p className="text-gray-700">
              Link your GitHub account and select repositories to monitor
              effortlessly.
            </p>
          </div>

          <div className="bg-white hover:shadow-xl transition-shadow duration-300 rounded-2xl p-6 border border-green-100">
            <div className="bg-green-100 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Configure
            </h3>
            <p className="text-gray-700">
              Customize analysis rules and notification settings to suit your
              workflow.
            </p>
          </div>

          <div className="bg-white hover:shadow-xl transition-shadow duration-300 rounded-2xl p-6 border border-purple-100">
            <div className="bg-purple-100 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyze
            </h3>
            <p className="text-gray-700">
              Instantly see quality metrics and AI-powered insights for every
              PR.
            </p>
          </div>
        </section>

        {/* QUICK START GUIDE */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Quick Start Guide
          </h2>
          <p className="text-gray-700 mb-8 text-lg">
            Get up and running with MergeMind in less than 5 minutes.
          </p>

          {/* STEP 1 */}
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Step 1: Connect Your GitHub Account
          </h3>
          <p className="text-gray-700 mb-6">
            Authenticate with your GitHub account to give MergeMind access to
            your repositories.
          </p>

          <div className="bg-blue-100 border border-blue-200 rounded-lg p-5 mb-8">
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Pro Tip</h4>
                <p className="text-blue-800">
                  Make sure you have <b>admin access</b> to the repositories you
                  want to analyze. MergeMind needs read access to pull request
                  data and repository settings.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Step 2: Select Repositories
          </h3>
          <p className="text-gray-700 mb-6">
            Choose which repositories to monitor. You can always add or remove
            them later.
          </p>

          {/* STEP 3 */}
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Step 3: Configure Analysis Rules (Coming soon!)
          </h3>
          <p className="text-gray-700 mb-6">
            Define your team’s rules for linting, testing, documentation, and
            security.
          </p>

          {/* CODE BLOCK */}
          <div className="relative bg-gray-900 text-gray-100 font-mono rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                JSON
              </span>
              <button
                onClick={copyCode}
                className="flex items-center text-gray-400 hover:text-white transition"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto text-sm leading-relaxed">
              {`{
  "rules": {
    "eslint": true,
    "testCoverage": {
      "enabled": true,
      "threshold": 80
    },
    "documentation": true,
    "security": true
  },
  "notifications": {
    "email": true,
    "slack": "https://hooks.slack.com/..."
  }
}`}
            </pre>
          </div>

          {/* CHECKLIST */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What You’ll Learn
            </h3>
            <ul className="space-y-3">
              {[
                "How to connect your GitHub repositories",
                "Understanding health scores and metrics",
                "Configuring custom analysis rules",
                "Setting up team notifications",
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Docs;
