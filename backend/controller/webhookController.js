const crypto = require("crypto");
const Repo = require("../model/Repo");

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

const verifySignature = (req) => {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

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

    if (event === "push") {
      await Repo.findOneAndUpdate(
        { githubId: payload.repository.id },
        { lastPushedAt: new Date(payload.repository.pushed_at) }
      );
    }

    if (event === "pull_request") {
      await Repo.findOneAndUpdate(
        { githubId: payload.repository.id },
        { lastPrActivity: new Date(payload.pull_request.updated_at) }
      );
    }

    if (event === "repository") {
      await Repo.findOneAndUpdate(
        { githubId: payload.repository.id },
        {
          name: payload.repository.name,
          fullName: payload.repository.full_name,
          private: payload.repository.private,
          description: payload.repository.description,
          language: payload.repository.language,
        }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error in webhookController", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { githubWebhookController };
