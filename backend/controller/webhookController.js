const crypto = require("crypto");
const Repo = require("../model/Repo");
const { formatToReadable } = require("../config/dateFunction");

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

    let updateData = {};

    if (event === "push") {
      console.log("📌 Push to branch:", payload.ref);
      updateData.lastPushedAt = formatToReadable(
        payload.head_commit?.timestamp || payload.repository.pushed_at
      );
    }

    if (event === "pull_request") {
      console.log("🔀 PR Action:", payload.action);
      updateData.lastPrActivity = formatToReadable(
        payload.pull_request.updated_at || new Date().toISOString()
      );
    }

    if (event === "repository") {
      updateData = {
        ...updateData,
        name: payload.repository.name,
        fullName: payload.repository.full_name,
        private: payload.repository.private,
        description: payload.repository.description,
        language: payload.repository.language,
      };
    }

    if (Object.keys(updateData).length > 0) {
      const updated = await Repo.findOneAndUpdate(
        { githubId: payload.repository.id },
        { $set: updateData },
        { new: true } // return updated document
      );

      console.log("✅ Repo updated:", updated?.fullName, updateData);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error in webhookController:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { githubWebhookController };
