const Repo = require("../model/Repo");
const PRAnalysis = require("../model/PRAnalysis");
const redis = require("../cache/redis");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:dashboardStats`;

    const cachedStats = await redis.get(cacheKey);
    if (cachedStats) {
      console.log(`⚡ Serving dashboard stats for ${userId} from cache`);
      return res.status(200).json({
        success: true,
        stats: JSON.parse(cachedStats),
        fromCache: true,
      });
    }

    const totalRepositories = await Repo.countDocuments({ user: userId });
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const repoIds = await Repo.find({ user: userId }).distinct("_id");

    const prsAnalyzedThisWeek = await PRAnalysis.countDocuments({
      analyzedAt: { $gte: oneWeekAgo.toISOString() },
      repo: { $in: repoIds },
    });

    const analysis = await PRAnalysis.aggregate([
      { $match: { repo: { $in: repoIds } } },
      { $group: { _id: null, averageScore: { $avg: "$healthScore" } } },
    ]);

    const averagePRScore = analysis.length ? analysis[0].averageScore : 0;

    const activeRepos = await Repo.countDocuments({
      user: userId,
      lastPrActivity: { $gte: oneWeekAgo.toISOString() },
    });

    const stats = {
      totalRepositories,
      prsAnalyzedThisWeek,
      averagePRScore: parseFloat(averagePRScore.toFixed(2)),
      activeRepositories: activeRepos,
    };

    await redis.setex(cacheKey, 300, JSON.stringify(stats));

    res.status(200).json({ success: true, stats, fromCache: false });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Unable to fetch dashboard stats" });
  }
};

module.exports = { getDashboardStats };