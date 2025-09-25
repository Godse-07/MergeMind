const axios = require("axios");

async function githubRequest(url, token) {
  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return res.data;
  } catch (err) {
    console.error("GitHub API error:", err.response?.data || err.message);
    throw new Error("GitHub API request failed");
  }
}

module.exports = { githubRequest };
