const redis = require("../cache/redis");
const { runAI } = require("../config/openRouter");
const { generatePRAnalysisEmail } = require("../helper/emailTemplate");
const { getFrontendBaseUrl } = require("../helper/findBaseURLHelper");
const PRAnalysis = require("../model/PRAnalysis");
const Pull = require("../model/Pull");
const Repo = require("../model/Repo");
const Rules = require("../model/Rules");
const User = require("../model/User");
const { githubRequest } = require("../utils/githubApi");
const sendMail = require("../utils/mailer");

const getRepoPRs = async (req, res) => {
  try {
    const { repoId } = req.params;
    const cacheKey = `repo:${repoId}:prs`;

    const cachedPRs = await redis.get(cacheKey);
    if (cachedPRs) {
      console.log(`⚡ Serving PR list for repo ${repoId} from cache`);
      return res.status(200).json({
        success: true,
        prs: JSON.parse(cachedPRs),
        fromCache: true,
      });
    }

    const repo = await Repo.findOne({ githubId: Number(repoId) });
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const prs = await Pull.find({ repo: repo._id }).sort({ createdAt: -1 });
    await redis.setex(cacheKey, 300, JSON.stringify(prs));

    res.status(200).json({ success: true, prs, fromCache: false });
  } catch (err) {
    console.error("Error fetching PRs:", err);
    res.status(500).json({ message: "Unable to fetch pull requests" });
  }
};

const getPRDetails = async (req, res) => {
  try {
    const { repoId, prNumber } = req.params;
    const cacheKey = `repo:${repoId}:pr:${prNumber}`;

    const cachedPR = await redis.get(cacheKey);
    if (cachedPR) {
      console.log(
        `⚡ Serving PR #${prNumber} details for repo ${repoId} from cache`
      );
      return res.status(200).json({
        success: true,
        pr: JSON.parse(cachedPR),
        fromCache: true,
      });
    }

    const repo = await Repo.findOne({ githubId: Number(repoId) });
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const pr = await Pull.findOne({ repo: repo._id, prNumber });
    if (!pr) return res.status(404).json({ message: "PR not found" });

    await redis.setex(cacheKey, 300, JSON.stringify(pr));

    res.status(200).json({ success: true, pr, fromCache: false });
  } catch (err) {
    console.error("Error fetching PR details:", err);
    res.status(500).json({ message: "Unable to fetch PR details" });
  }
};

const triggerPRAnalysis = async (req, res) => {
  try {
    const { repoId, prNumber } = req.params;

    let repo;
    if (!isNaN(Number(repoId))) {
      repo = await Repo.findOne({ githubId: Number(repoId) }).populate("user");
    } else {
      repo = await Repo.findOne({ name: repoId }).populate("user");
    }

    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const user = await User.findById(repo.user);
    if (!user?.githubToken)
      return res.status(400).json({ message: "GitHub not connected" });

    const [owner, repoName] = repo.fullName.split("/");

    const commits = await githubRequest(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}/commits`,
      user.githubToken
    );

    const latestCommit = commits[commits.length - 1]?.sha;
    const commitCacheKey = `repo:${repoId}:pr:${prNumber}:lastCommit`;
    const lastAnalyzedCommit = await redis.get(commitCacheKey);

    if (lastAnalyzedCommit && lastAnalyzedCommit === latestCommit) {
      console.log(
        `⚡ PR #${prNumber} has no new commits, skipping Gemini call`
      );
      const analysis = await PRAnalysis.findOne({
        repo: repo._id,
        pull: await Pull.findOne({ repo: repo._id, prNumber }).then(
          (p) => p?._id
        ),
      });

      if (analysis) {
        return res.status(200).json({
          success: true,
          analysis,
          fromCache: true,
          message: "PR not changed — reused existing analysis",
        });
      }
    }

    console.log(`🔄 New commit detected for PR #${prNumber}, analyzing...`);

    const prInfo = await githubRequest(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}`,
      user.githubToken
    );

    const files = await githubRequest(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}/files`,
      user.githubToken
    );

    const allFiles = files;

    const detailedFiles = await Promise.all(
      allFiles.map(async (f) => {
        try {
          let content = null;

          if (f.status !== "removed") {
            try {
              const headRepoFullName =
                prInfo.head.repo?.full_name || `${owner}/${repoName}`;

              const fileResponse = await githubRequest(
                `https://api.github.com/repos/${headRepoFullName}/contents/${f.filename}?ref=${prInfo.head.ref}`,
                user.githubToken
              );
              content = Buffer.from(fileResponse.content, "base64").toString(
                "utf8"
              );
              if (content.length > 10000)
                content =
                  content.slice(0, 10000) +
                  "\n// [Content truncated for analysis]";
            } catch (err) {
              console.warn(`⚠️ Could not fetch ${f.filename}: ${err.message}`);
              content = null;
            }
          }

          const changes = [];
          if (f.patch) {
            const regex = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,(\d+))? @@/g;
            let match;
            while ((match = regex.exec(f.patch)) !== null) {
              const from = Number(match[2]);
              const span = match[3] ? Number(match[3]) : 1;
              const to = from + span - 1;
              changes.push({ from, to });
            }
          }

          return {
            filename: f.filename,
            previousFilename: f.previous_filename || null,
            status: f.status || "modified",
            fullContent: content,
            changes,
          };
        } catch (err) {
          console.warn(`⚠️ Skipped ${f.filename}: ${err.message}`);
          return {
            filename: f.filename,
            previousFilename: f.previous_filename || null,
            status: f.status || "modified",
            fullContent: null,
            changes: [],
          };
        }
      })
    );

    console.log("📁 File changes detected:");
    detailedFiles.forEach((f) => {
      const ranges =
        f.changes.length > 0
          ? f.changes.map((c) => `${c.from}-${c.to}`).join(", ")
          : "no line diffs";
      const renameInfo = f.previousFilename
        ? ` (renamed from ${f.previousFilename})`
        : "";
      console.log(
        `   - ${f.status.toUpperCase()}: ${f.filename}${renameInfo} → ${ranges}`
      );
    });

    const prData = {
      title: prInfo.title,
      author: prInfo.user.login,
      created: prInfo.created_at,
      status:
        prInfo.state === "closed" && prInfo.merged_at ? "merged" : prInfo.state,
      additions: prInfo.additions,
      deletions: prInfo.deletions,
      changedFiles: prInfo.changed_files,
      commits: commits.length,
      files: detailedFiles,
    };

    const customUserRules = await Rules.findOne({ user_id: user._id });
    const customRules = customUserRules?.rules || [];

    const prompt = `
SYSTEM:
You are an expert Senior Software Engineer and PR reviewer.

IMPORTANT:
The following CUSTOM REVIEW RULES are defined by the user.
You MUST strictly enforce these rules while reviewing the PR.
If any rule is violated, report it clearly in "suggestions".

CUSTOM RULES:
${
  customRules.length > 0
    ? customRules.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "No custom rules provided."
}

---

Analyze this pull request and output ONLY valid JSON following this schema:
{
  "healthScore": number,
  "filesChanged": number,
  "linesAdded": number,
  "linesDeleted": number,
  "commits": number,
  "summary": string,
  "keyFindings": [string],
  "suggestions": [
    {
      "severity": "error" | "warning" | "info",
      "description": string,
      "file": string,
      "suggestedFix": string
    }
  ],
  "comments": []
}

PR DATA:
${JSON.stringify(prData, null, 2)}
`;

    let rawResponse;

    try {
      rawResponse = await runAI(prompt);
    } catch (aiErr) {
      console.error("❌ Openrouter AI error:", aiErr.message);

      return res.status(200).json({
        success: false,
        aiDisabled: true,
        message: "AI analysis temporarily unavailable",
      });
    }

    let parsed;
    try {
      let cleaned = rawResponse
        .trim()
        .replace(/^```json\s*/, "")
        .replace(/```$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Failed to parse Gemini output:", err);
      parsed = {
        healthScore: 0,
        filesChanged: prData.changedFiles,
        linesAdded: prData.additions,
        linesDeleted: prData.deletions,
        commits: prData.commits,
        suggestions: [
          {
            severity: "info",
            description: "Could not parse Gemini output",
            file: "",
            suggestedFix: rawResponse,
          },
        ],
        comments: [],
      };
    }

    const pull = await Pull.findOne({
      repo: repo._id,
      prNumber: Number(prNumber),
    });
    if (!pull) return res.status(404).json({ message: "PR not found in DB" });

    const analysis = await PRAnalysis.findOneAndUpdate(
      { pull: pull._id },
      {
        pull: pull._id,
        repo: repo._id,
        title: prData.title,
        author: prData.author,
        created: prData.created,
        status: prData.status,
        filesChanged: prData.changedFiles,
        linesAdded: prData.additions,
        linesDeleted: prData.deletions,
        commits: prData.commits,
        files: detailedFiles.map((f) => ({
          filename: f.filename,
          previousFilename: f.previousFilename || null,
          status: f.status || "modified",
          changes: f.changes || [],
        })),
        ...parsed,
        analyzedAt: new Date().toISOString(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    pull.healthScore = parsed.healthScore;
    await pull.save();

    const pulls = await Pull.find({ repo: repo._id });
    const analyzed = pulls.filter((p) => p.healthScore !== undefined);
    const avgHealthScore =
      analyzed.length > 0
        ? analyzed.reduce((sum, p) => sum + p.healthScore, 0) / analyzed.length
        : 0;

    repo.stats = {
      totalPRs: pulls.length,
      totalAnalyzedPRs: analyzed.length,
      openPRs: pulls.filter((p) => p.state === "open").length,
      averageHealthScore: Math.round(avgHealthScore),
    };
    await repo.save();

    const prCacheKey = `repo:${repoId}:pr:${prNumber}`;
    const prsListKey = `repo:${repoId}:prs`;
    const userDashboardKey = `user:${repo.user._id}:dashboardStats`;

    await Promise.all([
      redis.setex(prCacheKey, 300, JSON.stringify(pull)),
      redis.setex(prsListKey, 300, JSON.stringify(pulls)),
      redis.del(userDashboardKey),
      redis.set(commitCacheKey, latestCommit),
    ]);

    console.log(
      `🧠 PR #${prNumber} analysis updated, saved & caches refreshed`
    );

    console.log(req.user.email + " from prController triggerPRAnalysis");

    try {
      const dashboardUrl = `${getFrontendBaseUrl(
        req
      )}/repository/${repoName}/pr/${prNumber}`;

      await sendMail({
        to: user.email,
        subject: `PR #${prNumber} analyzed successfully on MergeMind`,
        html: generatePRAnalysisEmail({
          repoName: repo.fullName,
          prNumber,
          healthScore: parsed.healthScore,
          status: prData.status,
          dashboardUrl,
        }),
      });

      console.log(`📧 Email notification sent for PR #${prNumber}`);
    } catch (emailErr) {
      console.error(
        `❌ Failed to send email notification: ${emailErr.message}`
      );
    }

    res.status(200).json({ success: true, analysis, fromCache: false });
  } catch (err) {
    console.error("Error triggering PR analysis:", err);
    res.status(500).json({ message: "Unable to trigger PR analysis" });
  }
};

module.exports = {
  getRepoPRs,
  getPRDetails,
  triggerPRAnalysis,
};
