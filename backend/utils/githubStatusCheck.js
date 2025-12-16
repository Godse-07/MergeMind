const axios = require("axios");

async function setCommitStatus({
  owner,
  repo,
  sha,
  token,
  state,
  description,
}) {
  await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/statuses/${sha}`,
    {
      state,
      context: "MergeMind / Code Health",
      description,
    },
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
}

module.exports = { setCommitStatus };
