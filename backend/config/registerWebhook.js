const axios = require("axios");

const registerWebhook = async (repoFullName, accessToken) => {
  try {
    
    const { data: existingHooks } = await axios.get(
      `https://api.github.com/repos/${repoFullName}/hooks`,
      { headers: { Authorization: `token ${accessToken}` } }
    );

    const webhookExists = existingHooks.some(
      (hook) => hook.config.url === `https://isidioid-elle-really.ngrok-free.dev/webhooks/github`
    );

    if (webhookExists) {
      console.log(`✅ Webhook already exists for ${repoFullName}`);
      return;
    }

    await axios.post(
      `https://api.github.com/repos/${repoFullName}/hooks`,
      {
        name: "web",
        active: true,
        events: ["push", "pull_request", "repository"],
        config: {
          url: `${process.env.BACKEND_URL}/api/webhooks/github`,
          content_type: "json",
          secret: process.env.GITHUB_WEBHOOK_SECRET,
        },
      },
      { headers: { Authorization: `token ${accessToken}` } }
    );

    console.log(`✅ Webhook created for ${repoFullName}`);
  } catch (err) {
    console.log(
      `❌ Failed to add webhook for ${repoFullName}`,
      err.response?.data || err.message
    );
  }
};

module.exports = {
  registerWebhook,
};
