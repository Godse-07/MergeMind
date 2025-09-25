const Repo = require("../model/Repo");
const PRAnalysis = require("../model/PRAnalysis");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalRepositories = await Repo.countDocuments({ user: userId });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const prsAnalyzedThisWeek = await PRAnalysis.countDocuments({
      analyzedAt: { $gte: oneWeekAgo.toISOString() },
      repo: { $in: await Repo.find({ user: userId }).distinct("_id") }
    });

    const repoIds = await Repo.find({ user: userId }).distinct("_id");
    const analysis = await PRAnalysis.aggregate([
      { $match: { repo: { $in: repoIds } } },
      { $group: { _id: null, averageScore: { $avg: "$score" } } }
    ]);

    const averagePRScore = analysis.length ? analysis[0].averageScore : 0;

    const activeRepos = await Repo.countDocuments({
      user: userId,
      lastPrActivity: { $gte: oneWeekAgo.toISOString() }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalRepositories,
        prsAnalyzedThisWeek,
        averagePRScore: parseFloat(averagePRScore.toFixed(2)),
        activeRepositories: activeRepos
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Unable to fetch dashboard stats" });
  }
};

module.exports = { getDashboardStats };
