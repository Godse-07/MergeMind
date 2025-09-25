const crypto = require("crypto");
const Repo = require("../model/Repo");
const Push = require("../model/Push");
const User = require("../model/User");
const axios = require("axios");
const { formatToReadable } = require("../config/dateFunction");
const Pull = require("../model/Pull");

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

const verifySignature = (req) => {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
  const digest =
    "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

const githubWebhookController = async (req, res) => {
  try {
    if (!verifySignature(req)) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log("📢 GitHub Event:", event);
    console.log("📦 Repo:", payload.repository?.full_name);

    // Find repo
    const repo = await Repo.findOne({ githubId: payload.repository.id });

    if (!repo) {
      return res.status(404).json({ message: "Repo not found" });
    }

    if (event === "push") {
      const pushData = {
        repo: repo._id,
        user: {
          username:
            payload.head_commit?.committer?.username ||
            payload.head_commit?.committer?.name,
          email: payload.head_commit?.committer?.email,
        },
        branch: payload.ref,
        commitId: payload.head_commit?.id,
        message: payload.head_commit?.message,
        timestamp: formatToReadable(
          payload.head_commit?.timestamp || payload.repository.pushed_at
        ),
      };

      await Push.create(pushData);

      // Update last pushed in repo
      repo.lastPushedAt = pushData.timestamp;
      repo.lastPushedBy = pushData.user;
      await repo.save();

      console.log("✅ Push saved:", pushData);
    }

    if (event === "pull_request") {
      // Try to find existing PR
      let pr = await Pull.findOne({
        repo: repo._id,
        prNumber: payload.pull_request.number,
      });

      const actionEntry = {
        action: payload.action,
        timestamp: formatToReadable(
          payload.pull_request.updated_at || new Date().toISOString()
        ),
      };

      if (!pr) {
        // New PR
        pr = await Pull.create({
          repo: repo._id,
          prNumber: payload.pull_request.number,
          title: payload.pull_request.title,
          user: {
            username: payload.pull_request.user.login,
            avatar: payload.pull_request.user.avatar_url,
            profile: payload.pull_request.user.html_url,
          },
          actions: [actionEntry],
        });
      } else {
        // Existing PR → add new action
        pr.actions.push(actionEntry);
        await pr.save();
      }

      // Update last PR activity in repo
      repo.lastPrActivity = actionEntry.timestamp;
      repo.lastPrBy = pr.user;
      await repo.save();

      console.log("✅ PR updated:", pr);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error in webhookController:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const registerNewWebhook = async (req, res) => {
  try {
    const { repoId } = req.params;
    let repo = await Repo.findOne({ githubId: Number(repoId) });

    if (!repo) {
      const user = await User.findOne({ githubConnected: true }); 
      if (!user || !user.githubToken) {
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

      const repoInfo = repoData.data;

      repo = new Repo({
        user: user._id,
        githubId: repoInfo.id,
        name: repoInfo.name,
        fullName: repoInfo.full_name,
        htmlUrl: repoInfo.html_url,
        private: repoInfo.private,
        description: repoInfo.description,
        language: repoInfo.language,
        forksCount: repoInfo.forks_count,
        stargazersCount: repoInfo.stargazers_count,
        watchersCount: repoInfo.watchers_count,
      });

      await repo.save();
    }

    const user = await User.findById(repo.user);
    if (!user || !user.githubToken) {
      return res.status(400).json({ message: "GitHub token not found for user" });
    }

    const webhookUrl = `${process.env.BACKEND_URL}/api/webhooks/github`;

    // Check if webhook already exists
    const existingHooks = await axios.get(
      `https://api.github.com/repos/${repo.fullName}/hooks`,
      {
        headers: {
          Authorization: `token ${user.githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const webhookExists = existingHooks.data.some(
      (hook) => hook.config.url === webhookUrl
    );

    if (webhookExists) {
      return res.status(400).json({ message: "Webhook already registered for this repository" });
    }

    // Register webhook
    const response = await axios.post(
      `https://api.github.com/repos/${repo.fullName}/hooks`,
      {
        name: "web",
        active: true,
        events: ["push", "pull_request"],
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

    return res.json({ success: true, webhook: response.data });
  } catch (err) {
    console.error("❌ Error registering webhook:", err.response?.data || err.message);
    return res.status(500).json({ message: "Failed to register webhook" });
  }
};

module.exports = { githubWebhookController, registerNewWebhook };
