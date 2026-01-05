import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { UserContext } from "../context/UserContext";
import { disConnectGithub, getDashboardData, getRepoList } from "../lib/api";
import {
  FolderGit2,
  GitPullRequest,
  Star,
  Activity,
  Plus,
  Clock,
  ExternalLink,
  RefreshCcw,
  CircleOff,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import LifeLineLoader from "../components/LifeLineLoader";

const DashboardPage = () => {
  const { user } = useContext(UserContext);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [Repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  const navigate = useNavigate();

  const name = user?.fullName || "User";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardData();
        setDashboardStats(res.stats);
      } catch {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await getRepoList();
        setRepos(res.repos);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load repositories"
        );
      }
    };
    fetchRepos();
  }, []);

  const statsCards = [
    {
      title: "Total Repositories",
      value: dashboardStats?.totalRepositories ?? 0,
      icon: <FolderGit2 className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50 text-blue-600",
    },
    {
      title: "PRs Analyzed This Week",
      value: dashboardStats?.prsAnalyzedThisWeek ?? 0,
      icon: <GitPullRequest className="w-6 h-6 text-green-600" />,
      bg: "bg-green-50 text-green-600",
    },
    {
      title: "Average PR Score",
      value: dashboardStats?.averagePRScore ?? 0,
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      bg: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Active Repositories",
      value: dashboardStats?.activeRepositories ?? 0,
      icon: <Activity className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-50 text-purple-600",
    },
  ];

  const handleDisconnectGithub = async () => {
    try {
      setDisconnectLoading(true);
      const res = await disConnectGithub();
      toast.success(res.message);
      setRepos([]);
      setDashboardStats(null);
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      setDisconnectLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [statsRes, reposRes] = await Promise.all([
          getDashboardData(),
          getRepoList(),
        ]);
        setDashboardStats(statsRes.stats);
        setRepos(reposRes.repos);
      } catch (err) {
        console.error("Auto-refresh failed:", err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

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
      <div className="pt-24 w-[85%] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-bold tracking-wide">
              Welcome back, {name}!
            </span>
            <span className="text-gray-500 mt-2 md:mt-3 text-lg md:text-xl">
              Here's an overview of your repositories and recent pull request
              activity.
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            <LifeLineLoader />
          ) : (
            statsCards.map((card) => (
              <div
                key={card.title}
                className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 flex items-center justify-between`}
              >
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.bg}`}>{card.icon}</div>
              </div>
            ))
          )}
        </div>

        {/* Repositories Section */}
        <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-semibold text-blue-700">
                Repositories
              </span>
            </div>
            <div className="flex items-center justify-center gap-5">
              {Repos.length > 0 && (
                <button
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleDisconnectGithub}
                  disabled={disconnectLoading}
                >
                  {disconnectLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CircleOff className="w-4 h-4" />
                  )}
                  {disconnectLoading ? "Disconnecting..." : "Disconnect GitHub"}
                </button>
              )}
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  window.location.reload();
                }}
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  navigate("/connect-repository");
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Connect Repository</span>
              </button>
            </div>
          </div>

          {/* Repo List */}
          {Repos.length === 0 ? (
            <div className="p-12 text-center">
              <FolderGit2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No repositories connected
              </h3>
              <p className="text-gray-600 mb-6">
                Connect your GitHub repositories to start analyzing pull
                requests
              </p>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={() => {
                  navigate("/connect-github");
                }}
              >
                Connect Repository
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Repos.map((repo) => (
                <div
                  key={repo._id}
                  className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  {/* Repo Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {repo.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {repo.fullName}
                      </span>
                      {repo.private && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          Private
                        </span>
                      )}
                    </div>

                    {/* <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Last pushed: {formatDate(repo.lastPushedAt)}
                        </span>
                      </div>
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 bg-blue-400 rounded-full"></span>
                          <span>{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{repo.stargazersCount} stars</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        <span>{repo.watchersCount} watchers</span>
                      </div>
                    </div> */}
                    <div className="flex flex-col gap-3 text-sm text-gray-600">
                      {/* Existing details row */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            Last pushed: {formatDate(repo.lastPushedAt)}
                          </span>
                        </div>
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <span className="h-2 w-2 bg-blue-400 rounded-full"></span>
                            <span>{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>{repo.stargazersCount} stars</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          <span>{repo.watchersCount} watchers</span>
                        </div>
                      </div>

                      {/* New Repo Stats Section */}
                      {repo.stats && (
                        <div className="flex flex-wrap items-center gap-5 mt-2 text-gray-700">
                          <div className="flex items-center gap-2">
                            <GitPullRequest className="w-4 h-4 text-green-600" />
                            <span>
                              Total PRs:{" "}
                              <strong>{repo.stats.totalPRs ?? 0}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <span>
                              Open PRs:{" "}
                              <strong>{repo.stats.openPRs ?? 0}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>
                              Avg Health Score:{" "}
                              <strong>
                                {repo.stats.averageHealthScore ?? 0}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span>
                              Analyzed PRs:{" "}
                              <strong>
                                {repo.stats.totalAnalyzedPRs ?? 0}
                              </strong>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 ml-4">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <Link
                      to={`/repository/${repo.name}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      onClick={() => {
                        localStorage.setItem(`${repo.name}-id`, repo.githubId);
                      }}
                    >
                      Analyze PRs
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
