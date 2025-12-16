const axios = require("axios");

function attachLineNumbersToSuggestions(suggestions, detailedFiles) {
  return suggestions.map((s) => {
    if (!s.file || !s.lineHint) return s;

    const file = detailedFiles.find((f) => f.filename === s.file);
    if (!file || !file.fullContent) return s;

    const lines = file.fullContent.split("\n");

    const lineIndex = lines.findIndex((l) => l.includes(s.lineHint));

    if (lineIndex === -1) return s;

    return {
      ...s,
      line: lineIndex + 1,
      side: "RIGHT",
    };
  });
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
