const Repo = require("../model/Repo");
const Pull = require("../model/Pull");
const redis = require("../cache/redis");
const { githubRequest } = require("../utils/githubApi");

const syncRepo = async (req, res) => {
  const { repoId } = req.params;

  const repo = await Repo.findOne({ githubId: Number(repoId) }).populate(
    "user"
  );
  if (!repo) return res.status(404).json({ message: "Repo not found" });

  const token = repo.user.githubToken;
  if (!token) return res.status(400).json({ message: "GitHub not connected" });

  const [owner, repoName] = repo.fullName.split("/");

  const prs = await githubRequest(
    `https://api.github.com/repos/${owner}/${repoName}/pulls?state=all`,
    token
  );

  for (const pr of prs) {
    await Pull.findOneAndUpdate(
      { repo: repo._id, prNumber: pr.number },
      {
        repo: repo._id,
        prNumber: pr.number,
        title: pr.title,
        state: pr.state,
        user: {
          username: pr.user.login,
          avatar: pr.user.avatar_url,
          profile: pr.user.html_url,
        },
        updatedAt: pr.updated_at,
      },
      { upsert: true }
    );
  }

  await Promise.all([
    redis.del(`repo:${repo.githubId}:prs`),
    redis.del(`user:${repo.user._id}:dashboardStats`),
  ]);

  res.json({
    success: true,
    message: "Repository synced successfully",
  });
};

module.exports = { syncRepo };
