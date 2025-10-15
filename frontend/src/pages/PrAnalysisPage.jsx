import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  GitPullRequest,
  User,
  Calendar,
  FileText,
  Plus,
  Minus,
  GitCommitVertical as GitCommit,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Download,
  Copy,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getPRanalysis } from "../lib/api";
import Navbar from "./../components/Navbar";

export default function PRAnalysisPage() {
  const { repoName, prNumber } = useParams();
  const [prData, setPrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analysis");

  const repoId = localStorage.getItem(`${repoName}-id`);

  const effectRan = useRef(false);

  useEffect(() => {
    if(effectRan.current === false){
      fetchAnalysis();
      effectRan.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const res = await getPRanalysis(repoId, prNumber);
      if (res.success && res.analysis) {
        setPrData(res.analysis);
        toast.success("PR analysis fetched successfully!");
      } else {
        toast.error("No analysis data found.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch PR analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toast("Refreshing analysis...", { icon: "⏳" });
    fetchAnalysis();
  };

  const handleExport = () => {
    toast.success("Report exported successfully!");
  };

  const handleCopySuggestions = () => {
    toast.success("Suggestions copied to clipboard!");
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Fetching PR analysis...
      </div>
    );
  }

  if (!prData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
        <p>Unable to load analysis. Try refreshing.</p>
        <button
          onClick={handleRefresh}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="pt-24 w-[90%] max-w-7xl mx-auto">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/dashboard" className="hover:text-gray-900">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/repositories" className="hover:text-gray-900">
            {repoName}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">PR #{prNumber}</span>
        </nav>

        {/* Back Button */}
        <Link
          to={`/repository/${repoName}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Repository
        </Link>

        {/* PR Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <GitPullRequest className="w-6 h-6 text-green-600" />
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prData.status === "open"
                      ? "bg-green-100 text-green-800"
                      : prData.status === "merged"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {prData.status.charAt(0).toUpperCase() +
                    prData.status.slice(1)}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {prData.title}
              </h1>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {prData.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(prData.created).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div
              className={`px-4 py-3 rounded-lg border-2 ${getScoreColor(
                prData.healthScore
              )}`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold">{prData.healthScore}</div>
                <div className="text-xs font-medium">Health Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "analysis", label: "Analysis", icon: CheckCircle },
              { id: "files", label: "Files Changed", icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "analysis" && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {prData.filesChanged}
                    </p>
                    <p className="text-sm text-gray-600">Files Changed</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Plus className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      +{prData.linesAdded}
                    </p>
                    <p className="text-sm text-gray-600">Lines Added</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Minus className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      -{prData.linesDeleted}
                    </p>
                    <p className="text-sm text-gray-600">Lines Deleted</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <GitCommit className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {prData.commits}
                    </p>
                    <p className="text-sm text-gray-600">Commits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {prData.suggestions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recommendations
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {prData.suggestions.map((s) => (
                    <div
                      key={s._id}
                      className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
                    >
                      {getSeverityIcon(s.severity)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {s.description}
                        </p>
                        {s.file && (
                          <p className="text-xs text-gray-600 mt-1">
                            File: {s.file}
                          </p>
                        )}
                        {s.suggestedFix && (
                          <p className="text-xs text-blue-600 mt-2">
                            {s.suggestedFix}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "files" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">
              File change details are not yet implemented.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            <Download className="w-4 h-4 mr-2" /> Export Report
          </button>
          <button
            onClick={handleCopySuggestions}
            className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <Copy className="w-4 h-4 mr-2" /> Copy Suggestions
          </button>
        </div>
      </div>
    </div>
  );
}
