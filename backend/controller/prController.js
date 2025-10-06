const getGeminiModel = require("../config/gemini");
const PRAnalysis = require("../model/PRAnalysis");
const Pull = require("../model/Pull");
const Repo = require("../model/Repo");
const User = require("../model/User");
const { githubRequest } = require("../utils/githubApi");


const getRepoPRs = async (req, res) => {
  try {
    const { repoId } = req.params;

    // Find repo by GitHub repo ID
    const repo = await Repo.findOne({ githubId: Number(repoId) });
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const prs = await Pull.find({ repo: repo._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, prs });
  } catch (err) {
    console.error("Error fetching PRs:", err);
    res.status(500).json({ message: "Unable to fetch pull requests" });
  }
};


const getPRDetails = async (req, res) => {
  try {
    const { repoId, prNumber } = req.params;

    const repo = await Repo.findOne({ githubId: Number(repoId) });
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const pr = await Pull.findOne({ repo: repo._id, prNumber });
    if (!pr) return res.status(404).json({ message: "PR not found" });

    res.status(200).json({ success: true, pr });
  } catch (err) {
    console.error("Error fetching PR details:", err);
    res.status(500).json({ message: "Unable to fetch PR details" });
  }
};

const triggerPRAnalysis = async (req, res) => {
  try {
    const { repoId, prNumber } = req.params;

    // Find repository
    const repo = await Repo.findOne({ githubId: Number(repoId) }).populate("user");
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const user = await User.findById(repo.user);
    if (!user?.githubToken) {
      return res.status(400).json({ message: "GitHub not connected" });
    }

    const [owner, repoName] = repo.fullName.split("/");

    console.log("Owner:", owner);
    console.log("RepoName:", repoName);
    console.log("PR Number:", prNumber);

    // Fetch PR details from GitHub
    const prInfo = await githubRequest(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}`,
      user.githubToken
    );

    const files = await githubRequest(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}/files`,
      user.githubToken
    );

    const commits = await githubRequest(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}/commits`,
      user.githubToken
    );

    // Prepare PR data
    const prData = {
      title: prInfo.title,
      author: prInfo.user.login,
      additions: prInfo.additions,
      deletions: prInfo.deletions,
      changedFiles: prInfo.changed_files,
      commits: commits.length,
      files: files.map((f) => ({
        filename: f.filename,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch?.slice(0, 300) || "No diff preview",
      })),
    };

    // Get Gemini model
    const model = getGeminiModel();

    // Gemini prompt (strict JSON requirement)
    const prompt = `
You are a PR reviewer. Analyze this pull request and return a valid JSON object with the following schema ONLY:

{
  "score": number,
  "filesChanged": number,
  "linesAdded": number,
  "linesDeleted": number,
  "commits": number,
  "suggestions": [
    {
      "severity": "Error" | "Warning" | "Info",
      "description": string,
      "file": string,
      "suggestedFix": string
    }
  ]
}

PR Data:
${JSON.stringify(prData, null, 2)}
    `;

    // Call Gemini
    const result = await model.generateContent(prompt);

    const rawResponse = await result.response.text();
    console.log("Gemini raw output:", rawResponse);

    let parsed;
    try {
      let cleanedOutput = rawResponse.trim();
      cleanedOutput = cleanedOutput.replace(/^```json\s*/, "").replace(/```$/, "").trim();

      parsed = JSON.parse(cleanedOutput);
    } catch (err) {
      console.error("Failed to parse Gemini output as JSON:", err);
      parsed = {
        score: 0,
        filesChanged: prData.changedFiles,
        linesAdded: prData.additions,
        linesDeleted: prData.deletions,
        commits: prData.commits,
        suggestions: [
          {
            severity: "Info",
            description: "Could not parse Gemini output",
            file: "",
            suggestedFix: rawResponse,
          },
        ],
      };
    }

    // Find Pull document in DB
    const pull = await Pull.findOne({ repo: repo._id, prNumber: Number(prNumber) });
    if (!pull) return res.status(404).json({ message: "PR not found in DB" });

    // Upsert: update existing analysis or create if missing
    const analysis = await PRAnalysis.findOneAndUpdate(
      { pull: pull._id }, // search by pull ID
      {
        pull: pull._id,
        repo: repo._id,
        ...parsed,
        analyzedAt: new Date().toISOString(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, analysis });
  } catch (err) {
    console.error("Error triggering PR analysis:", err);
    res.status(500).json({ message: "Unable to trigger PR analysis" });
  }
};


module.exports = {
    getRepoPRs,
    getPRDetails,
    triggerPRAnalysis
}