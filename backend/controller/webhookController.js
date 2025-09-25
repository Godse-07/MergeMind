const crypto = require("crypto");
const Repo = require("../model/Repo");
const Push = require("../model/Push");
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

module.exports = { githubWebhookController };
