const crypto = require("crypto");
const axios = require("axios");
const Repo = require("../model/Repo");
const Push = require("../model/Push");
const Pull = require("../model/Pull");
const User = require("../model/User");
const { formatToReadable } = require("../config/dateFunction");

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
    if (!verifySignature(req)) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log("📢 GitHub Event:", event);
    console.log("📦 Repository:", payload.repository?.full_name);

    const repo = await Repo.findOne({ githubId: payload.repository.id });
    if (!repo) {
      console.warn("⚠️ Repo not found for webhook:", payload.repository?.id);
      return res.status(404).json({ message: "Repo not found" });
    }

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

      console.log("✅ Push saved:", pushData);
    }

    if (event === "pull_request") {
      const prPayload = payload.pull_request;
      const actionEntry = {
        action: payload.action,
        timestamp: formatToReadable(
          prPayload.updated_at || new Date().toISOString()
        ),
      };

      let pr = await Pull.findOne({
        repo: repo._id,
        prNumber: prPayload.number,
      });

      if (!pr) {
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
        });
      } else {
        pr.actions.push(actionEntry);
        await pr.save();
      }

      repo.lastPrActivity = actionEntry.timestamp;
      repo.lastPrBy = pr.user;
      await repo.save();

      console.log(
        `✅ Pull Request #${prPayload.number} updated (${payload.action})`
      );
    }

    if (event === "star") {
      const { action, sender } = payload;

      if (action === "created") {
        repo.stargazersCount = (repo.stargazersCount || 0) + 1;
      } else if (action === "deleted" && repo.stargazersCount > 0) {
        repo.stargazersCount -= 1;
      }

      repo.lastStarredBy = {
        username: sender?.login,
        avatar: sender?.avatar_url,
        profile: sender?.html_url,
      };
      repo.lastStarredAt = formatToReadable(new Date());
      await repo.save();

      console.log(`⭐ Repo ${repo.name} starred/unstarred by ${sender?.login}`);
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

      console.log(`🍴 Repo ${repo.name} forked by ${sender?.login}`);
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
      if (!user?.githubToken) {
        return res.status(400).json({ message: "GitHub token not found" });
      }

      const repoData = await axios.get(
        `https://api.github.com/repositories/${repoId}`,
        {
          headers: {
            Authorization: `token ${user.githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      const info = repoData.data;

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
    }

    const user = await User.findById(repo.user);
    if (!user?.githubToken) {
      return res
        .status(400)
        .json({ message: "GitHub token not found for user" });
    }

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

    if (hooks.some((h) => h.config.url === webhookUrl)) {
      return res.status(400).json({ message: "Webhook already registered" });
    }

    const { data: webhook } = await axios.post(
      `https://api.github.com/repos/${repo.fullName}/hooks`,
      {
        name: "web",
        active: true,
        events: ["push", "pull_request", "star", "fork"],
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
    console.error(
      "❌ Error registering webhook:",
      err.response?.data || err.message
    );
    return res.status(500).json({ message: "Failed to register webhook" });
  }
};

module.exports = { githubWebhookController, registerNewWebhook };
