import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { UserContext } from "../context/UserContext";
import { getDashboardData } from "../lib/api";
import { FolderGit2, GitPullRequest, Star, Activity } from "lucide-react";

const DashboardPage = () => {
  const { user } = useContext(UserContext);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const name = user?.fullName || "User";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardData();
        console.log("Dashboard data:", res.stats);
        setDashboardStats(res.stats);
      } catch (err) {
        console.log("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsCards = [
    {
      title: "Total Repositories",
      value: dashboardStats?.totalRepositories ?? 0,
      icon: <FolderGit2 className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: "PRs Analyzed This Week",
      value: dashboardStats?.prsAnalyzedThisWeek ?? 0,
      icon: <GitPullRequest className="w-8 h-8 text-green-500" />,
      bg: "bg-green-50",
    },
    {
      title: "Average PR Score",
      value: dashboardStats?.averagePRScore ?? 0,
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      bg: "bg-yellow-50",
    },
    {
      title: "Active Repositories",
      value: dashboardStats?.activeRepositories ?? 0,
      icon: <Activity className="w-8 h-8 text-purple-500" />,
      bg: "bg-purple-50",
    },
  ];

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
              Here's an overview of your repositories and recent pull request activity.
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-gray-500 text-center">
              Loading dashboard stats...
            </div>
          ) : (
            statsCards.map((card) => (
              <div
                key={card.title}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl shadow-md ${card.bg} hover:shadow-lg transition-all duration-300`}
              >
                <div className="p-3 bg-white rounded-full">{card.icon}</div>
                <span className="text-gray-600 font-medium">{card.title}</span>
                <span className="text-2xl font-bold">{card.value}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
