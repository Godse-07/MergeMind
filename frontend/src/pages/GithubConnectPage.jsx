import React from "react";
import { Github, GitPullRequest, Shield, Zap, Users } from 'lucide-react';
import toast from "react-hot-toast";
import { Link } from "react-router";
import { githubOAth } from "../lib/api";

const GithubConnectPage = () => {

    const handleLogin = async () => {
        try {
            githubOAth();
        }catch {
            toast.error("Something went wrong. Please try again.");
        }
    }

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <GitPullRequest className="h-12 w-12 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">PR Checker</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to PR Checker
          </h2>
          <p className="text-gray-600">
            Connect with GitHub to start analyzing pull requests and improving code quality.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
          >
            <Github className="h-6 w-6" />
            <span>Sign in with GitHub</span>
          </button>
          
          <p className="text-sm text-gray-500 text-center mt-4">
            Secure authentication via GitHub OAuth
          </p>

          {/* Benefits */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>Secure OAuth authentication</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Zap className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <span>Instant repository access</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Users className="h-5 w-5 text-purple-500 flex-shrink-0" />
              <span>Team collaboration features</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>

        {/* Back to landing */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GithubConnectPage;
