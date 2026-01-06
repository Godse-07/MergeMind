import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { repositoryPr, syncRepository } from "../lib/api";
import {
  GitPullRequest,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  User,
  ChevronRight,
  RefreshCcw,
  File,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";

const RepositoryPage = () => {
  const { repoName } = useParams();
  const [repoPR, setRepoPR] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [syncing, setSyncing] = useState(false);

  const handleSyncRepo = async () => {
    try {
      setSyncing(true);

      const repoId = localStorage.getItem(`${repoName}-id`);
      await syncRepository(repoId);

      toast.success("Repository synced successfully");

      // After sync → refresh PRs
      await fetchPRs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to sync repository");
    } finally {
      setSyncing(false);
    }
  };

  const fetchPRs = async () => {
    try {
      setLoading(true);
      const repoId = localStorage.getItem(`${repoName}-id`);
      const res = await repositoryPr(repoId);
      setRepoPR(res.prs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch PRs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRs();
    const interval = setInterval(fetchPRs, 30000);
    return () => clearInterval(interval);
  }, [repoName]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: "bg-green-50 text-green-700 border-green-200",
      merged: "bg-purple-50 text-purple-700 border-purple-200",
      closed: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return statusConfig[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const filteredPRs = useMemo(() => {
    let prs = repoPR.filter((pr) => {
      const matchesSearch =
        pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.user?.username?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || pr.state?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (sortBy === "latest") {
      prs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      prs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "score") {
      prs.sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));
    }

    return prs;
  }, [repoPR, searchQuery, statusFilter, sortBy]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div>
      <Navbar />
      <div className="pt-24 w-[90%] max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/dashboard" className="hover:text-gray-900">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{repoName}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pull Requests in {repoName}
            </h1>
            <p className="text-gray-600">
              Monitor pull request health and quality metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={fetchPRs}
              disabled={loading || syncing}
              className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors ${
                loading || syncing
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              <RefreshCcw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            {/* Sync Button */}
            <button
              onClick={handleSyncRepo}
              disabled={syncing || loading}
              className={`flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors ${
                syncing || loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
            >
              <RotateCcw
                className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
              />
              Sync
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search PRs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="merged">Merged</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="score">Health Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* PR List */}
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading PRs...</div>
        ) : filteredPRs.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      PR
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Author
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPRs.map((pr) => (
                    <tr key={pr._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <GitPullRequest className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            #{pr.prNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-col gap-3">
                          {/* PR Title */}
                          <span className=" text-[1rem] text-gray-900">
                            {pr.title}
                          </span>

                          {/* File Stats */}
                          <div className="flex items-center gap-4 mt-1 text-xs">
                            {/* Total Files Changed */}
                            <span className="flex items-center text-gray-500">
                              <File className="w-4 h-4 mr-1" />
                              {pr.fileStats?.totalFilesChanged || 0} files
                            </span>

                            {/* Additions */}
                            <span className="flex items-center text-green-600">
                              <Plus className="w-3 h-3" />
                              {pr.fileStats?.totalAdditions || 0}
                            </span>

                            {/* Deletions */}
                            <span className="flex items-center text-red-600">
                              <Minus className="w-3 h-3" />
                              {pr.fileStats?.totalDeletions || 0}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {pr.user?.username || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(pr.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                            pr.state?.toLowerCase()
                          )}`}
                        >
                          {pr.state
                            ? pr.state.charAt(0).toUpperCase() +
                              pr.state.slice(1)
                            : "Open"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/repository/${repoName}/pr/${pr.prNumber}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Analyze
                        </Link>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col items-start">
                          {/* Score Badge */}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(
                              pr.healthScore
                            )}`}
                          >
                            {pr.healthScore ? `${pr.healthScore}/100` : "N/A"}
                          </span>

                          {/* Progress Bar */}
                          {pr.healthScore !== undefined && (
                            <div className="w-24 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  pr.healthScore >= 80
                                    ? "bg-green-500"
                                    : pr.healthScore >= 60
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(pr.healthScore, 100)}%`,
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600 py-10">
            No pull requests found for this repository.
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;
