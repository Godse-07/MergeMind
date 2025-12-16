const axios = require("axios");

async function createPRReview({
  owner,
  repo,
  prNumber,
  token,
  body,
  event,
}) {
  await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
    { body, event },
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
}

module.exports = { createPRReview };
