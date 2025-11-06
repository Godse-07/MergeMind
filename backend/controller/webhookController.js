const crypto = require("crypto");
const axios = require("axios");
const Repo = require("../model/Repo");
const Push = require("../model/Push");
const Pull = require("../model/Pull");
const User = require("../model/User");
const { formatToReadable } = require("../config/dateFunction");
const redis = require("../cache/redis");

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

const verifySignature = (req) => {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
  const digest =
    "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
};

const githubWebhookController = async (req, res) => {
  try {
    if (!verifySignature(req))
      return res.status(401).json({ message: "Invalid signature" });

    const event = req.headers["x-github-event"];
    const payload = req.body;

    const repo = await Repo.findOne({ githubId: payload.repository.id });
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const repoCacheKey = `user:${repo.user}:repos`;
    const dashboardKey = `user:${repo.user}:dashboardStats`;

    if (event === "push") {
      const headCommit = payload.head_commit || {};
      const pushData = {
        repo: repo._id,
        user: {
          username:
            headCommit.committer?.username || headCommit.committer?.name,
          email: headCommit.committer?.email,
        },
        branch: payload.ref?.replace("refs/heads/", ""),
        commitId: headCommit.id,
        message: headCommit.message,
        timestamp: formatToReadable(
          headCommit.timestamp || payload.repository.pushed_at
        ),
      };
      await Push.create(pushData);
      repo.lastPushedAt = pushData.timestamp;
      repo.lastPushedBy = pushData.user;
      await repo.save();

      await Promise.all([
        redis.del(repoCacheKey),
        redis.del(dashboardKey),
      ]);
      console.log(`🧹 Cache cleared for ${repoCacheKey} after push`);
    }

    if (event === "pull_request") {
      const prPayload = payload.pull_request;
      const prAction = payload.action;
      const actionEntry = {
        action: prAction,
        timestamp: formatToReadable(
          prPayload.updated_at || new Date().toISOString()
        ),
      };

      const user = await User.findById(repo.user);

      let fileStats = {
        totalFilesChanged: prPayload.changed_files || 0,
        totalAdditions: prPayload.additions || 0,
        totalDeletions: prPayload.deletions || 0,
      };

      if (
        (!fileStats.totalFilesChanged || prAction === "closed") &&
        user?.githubToken
      ) {
        try {
          const { data: prInfo } = await axios.get(prPayload.url, {
            headers: {
              Authorization: `token ${user.githubToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          });
          fileStats = {
            totalFilesChanged: prInfo.changed_files || 0,
            totalAdditions: prInfo.additions || 0,
            totalDeletions: prInfo.deletions || 0,
          };
        } catch (err) {
          console.error("❌ Failed to fetch PR file stats:", err.message);
        }
      }

      let pr = await Pull.findOne({
        repo: repo._id,
        prNumber: prPayload.number,
      });

      if (!pr) {
        let initialState =
          prAction === "closed"
            ? prPayload.merged
              ? "merged"
              : "closed"
            : "open";

        pr = await Pull.create({
          repo: repo._id,
          prNumber: prPayload.number,
          title: prPayload.title,
          user: {
            username: prPayload.user.login,
            avatar: prPayload.user.avatar_url,
            profile: prPayload.user.html_url,
          },
          actions: [actionEntry],
          state: initialState,
          fileStats,
        });
      } else {
        pr.actions.push(actionEntry);
        pr.fileStats = fileStats;
        if (prAction === "closed")
          pr.state = prPayload.merged ? "merged" : "closed";
        else if (prAction === "opened" || prAction === "reopened")
          pr.state = "open";
        await pr.save();
      }

      repo.lastPrActivity = actionEntry.timestamp;
      repo.lastPrBy = pr.user;
      await repo.save();

      await Promise.all([
        redis.del(repoCacheKey),
        redis.del(dashboardKey),
      ]);
      console.log(`🧹 Cache cleared for ${repoCacheKey} after pull_request`);
    }

    if (event === "repository" && payload.action === "deleted") {
      await Repo.deleteOne({ githubId: payload.repository.id });
      await Pull.deleteMany({ repo: repo._id });
      await Push.deleteMany({ repo: repo._id });

      await Promise.all([
        redis.del(repoCacheKey),
        redis.del(dashboardKey),
      ]);

      console.log(
        `🗑️ Repository ${payload.repository.full_name} deleted from DB`
      );

      return res
        .status(200)
        .json({ success: true, message: "Repository deleted" });
    }

    if (event === "star") {
      const { action, sender } = payload;
      repo.stargazersCount =
        action === "created"
          ? (repo.stargazersCount || 0) + 1
          : Math.max((repo.stargazersCount || 1) - 1, 0);
      repo.lastStarredBy = {
        username: sender?.login,
        avatar: sender?.avatar_url,
        profile: sender?.html_url,
      };
      repo.lastStarredAt = formatToReadable(new Date());
      await repo.save();

      await Promise.all([
        redis.del(repoCacheKey),
        redis.del(dashboardKey),
      ]);
      console.log(`🧹 Cache cleared for ${repoCacheKey} after star`);
    }

    if (event === "fork") {
      const { sender } = payload;
      repo.forksCount = (repo.forksCount || 0) + 1;
      repo.lastForkedBy = {
        username: sender?.login,
        avatar: sender?.avatar_url,
        profile: sender?.html_url,
      };
      repo.lastForkedAt = formatToReadable(new Date());
      await repo.save();

      await Promise.all([
        redis.del(repoCacheKey),
        redis.del(dashboardKey),
      ]);
      console.log(`🧹 Cache cleared for ${repoCacheKey} after fork`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error in githubWebhookController:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const registerNewWebhook = async (req, res) => {
  try {
    const { repoId } = req.params;
    let repo = await Repo.findOne({ githubId: Number(repoId) });

    if (!repo) {
      const user = await User.findOne({ githubConnected: true });
      if (!user?.githubToken)
        return res.status(400).json({ message: "GitHub token not found" });

      const { data: info } = await axios.get(
        `https://api.github.com/repositories/${repoId}`,
        {
          headers: {
            Authorization: `token ${user.githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      repo = await Repo.create({
        user: user._id,
        githubId: info.id,
        name: info.name,
        fullName: info.full_name,
        htmlUrl: info.html_url,
        private: info.private,
        description: info.description,
        language: info.language,
        forksCount: info.forks_count,
        stargazersCount: info.stargazers_count,
        watchersCount: info.watchers_count,
      });

      await redis.del(`user:${user._id}:repos`);
      console.log(`♻️ Cleared cache for user:${user._id} after new repo added`);
    }

    const user = await User.findById(repo.user);
    if (!user?.githubToken)
      return res
        .status(400)
        .json({ message: "GitHub token not found for user" });

    const webhookUrl = `${process.env.BACKEND_URL}/api/webhooks/github`;
    const { data: hooks } = await axios.get(
      `https://api.github.com/repos/${repo.fullName}/hooks`,
      {
        headers: {
          Authorization: `token ${user.githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (hooks.some((h) => h.config.url === webhookUrl))
      return res.status(400).json({ message: "Webhook already registered" });

    const { data: webhook } = await axios.post(
      `https://api.github.com/repos/${repo.fullName}/hooks`,
      {
        name: "web",
        active: true,
        events: ["push", "pull_request", "repository", "star", "fork"],
        config: {
          url: webhookUrl,
          content_type: "json",
          secret: process.env.GITHUB_WEBHOOK_SECRET,
        },
      },
      {
        headers: {
          Authorization: `token ${user.githubToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
      }
    );

    return res.json({ success: true, webhook });
  } catch (err) {
    console.error("❌ Error registering webhook:", err);
    return res.status(500).json({ message: "Failed to register webhook" });
  }
};

module.exports = { githubWebhookController, registerNewWebhook };
