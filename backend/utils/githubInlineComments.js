const axios = require("axios");

function attachLineNumbersToSuggestions(suggestions, detailedFiles) {
  const result = [];

  for (const s of suggestions) {
    if (s.severity !== "error" || !s.file) continue;

    const file = detailedFiles.find((f) => f.filename === s.file);
    if (!file || !file.patchLines?.length) continue;

    const hunkHeader = file.patchLines.find((l) => l.startsWith("@@"));
    if (!hunkHeader) continue;

    const match = hunkHeader.match(/\+(\d+)/);
    if (!match) continue;

    const newFileLine = Number(match[1]);

    result.push({
      ...s,
      line: newFileLine,
      side: "RIGHT",
    });
  }

  return result;
}

async function createInlineReview({
  owner,
  repo,
  prNumber,
  token,
  commitSha,
  suggestions,
}) {
  const comments = suggestions
    .filter((s) => s.file && s.line)
    .map((s) => ({
      path: s.file,
      line: s.line,
      side: "RIGHT",
      body: `🧠 **MergeMind Suggestion**\n\n${s.description}\n\n💡 ${s.suggestedFix}`,
    }));

  if (comments.length === 0) return;

  await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
    {
      commit_id: commitSha,
      event: "COMMENT",
      comments,
    },
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
}

module.exports = { attachLineNumbersToSuggestions, createInlineReview };
