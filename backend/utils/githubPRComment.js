const axios = require("axios");

const BOT_PREFIX = "🤖 MergeMind PR Analysis";
const COMMIT_MARKER = "<!-- mergemind-commit:";

async function upsertPRComment({
  owner,
  repo,
  prNumber,
  body,
  token,
  commitSha,
}) {
  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
  };

  const { data: comments } = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    { headers }
  );

  const existing = comments.find(
    (c) =>
      c.body.includes(BOT_PREFIX) &&
      c.body.includes(`${COMMIT_MARKER}${commitSha}`)
  );

  const finalBody = `${body}

${COMMIT_MARKER}${commitSha} -->
`;

  if (existing) {
    await axios.patch(
      `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existing.id}`,
      { body: finalBody },
      { headers }
    );
  } else {
    await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
      { body: finalBody },
      { headers }
    );
  }
}

module.exports = {
  upsertPRComment,
};
