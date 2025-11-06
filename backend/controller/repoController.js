const Repo = require("../model/Repo");
const redis = require("../cache/redis");

const repoController = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:repos`;

    const cachedRepos = await redis.get(cacheKey);
    if (cachedRepos) {
      console.log(`⚡ Serving repos for ${userId} from cache`);
      return res.status(200).json({
        success: true,
        repos: JSON.parse(cachedRepos),
        fromCache: true,
      });
    }

    const repos = await Repo.find({ user: userId });

    await redis.setex(cacheKey, 300, JSON.stringify(repos));

    res.status(200).json({ success: true, repos, fromCache: false });
  } catch (error) {
    console.log("Error in repoController", error);
    res.status(500).json({ message: "Facing issue while collecting repo" });
  }
};

module.exports = {
  repoController,
};
