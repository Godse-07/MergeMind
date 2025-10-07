const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const Repo = require("../model/Repo");
const Pull = require("../model/Pull");
const User = require("../model/User");
const PRAnalysis = require("../model/PRAnalysis");
const getGeminiModel = require("../config/gemini");
const { githubRequest } = require("../utils/githubApi");

jest.mock("../config/gemini");
jest.mock("../utils/githubApi");

jest.mock("../middleware/isLoggedIn", () => (req, res, next) => {
  req.user = { id: req.headers["x-user-id"] || "fakeuserid" };
  next();
});

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Repo.deleteMany({});
  await Pull.deleteMany({});
  await User.deleteMany({});
  await PRAnalysis.deleteMany({});
});

describe("PR details", () => {
  it("Should get all the PRs of a repo", async () => {
    const repo = await Repo.create({
      githubId: 123,
      name: "TestRepo",
      fullName: "user/TestRepo",
      user: new mongoose.Types.ObjectId(),
    });

    await Pull.create([
      { repo: repo._id, prNumber: 1, title: "Fix bug", createdAt: new Date() },
      {
        repo: repo._id,
        prNumber: 2,
        title: "Add feature",
        createdAt: new Date(),
      },
    ]);

    const res = await request(app)
      .get(`/api/pr/${repo.githubId}/prs`)
      .set("x-user-id", repo.user.toString());

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.prs.length).toBe(2);
  });

  it("Should throw an error", async () => {
    const res = await request(app)
      .get(`/api/pr/999/prs`)
      .set("x-user-id", "someuserid");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Repo not found");
  });
});

describe("Perticular PR details ", () => {
  it("Should return the PR", async () => {
    const user = await User.create({
      fullName: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const repo = await Repo.create({
      user: user._id,
      githubId: 321,
      name: "DemoRepo",
      fullName: "user/DemoRepo",
    });

    const pull = await Pull.create({
      repo: repo._id,
      prNumber: 5,
      title: "Hotfix patch",
    });

    const res = await request(app)
      .get(`/api/pr/${repo.githubId}/prs/${pull.prNumber}`)
      .set("x-user-id", "anotheruserid");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pr.prNumber).toBe(pull.prNumber);
  });

  it("Should not find repo", async () => {
    const res = await request(app)
      .get(`/api/pr/888/prs/1`)
      .set("x-user-id", "anotheruserid");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Repo not found");
  });

  it("Should not find PR", async () => {
    const user = await User.create({
      fullName: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const repo = await Repo.create({
      user: user._id,
      githubId: 321,
      name: "DemoRepo",
      fullName: "user/DemoRepo",
    });

    const pull = await Pull.create({
      repo: repo._id,
      prNumber: 5,
      title: "Hotfix patch",
    });

    const res = await request(app)
      .get(`/api/pr/${repo.githubId}/prs/999`)
      .set("x-user-id", "anotheruserid");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("PR not found");
  });
});

describe("PR analysis", () => {
  it("Should analyze a PR", async () => {
    const user = await User.create({
      fullName: "AI Tester",
      email: "ai@test.com",
      password: "pass123",
      githubToken: "fake-token",
    });

    const repo = await Repo.create({
      user: user._id,
      githubId: 999,
      name: "TestRepo",
      fullName: "ai/TestRepo",
    });

    await repo.populate("user");

    const pull = await Pull.create({
      repo: repo._id,
      prNumber: 10,
      title: "Add new feature",
    });

    //  Mock GitHub API calls (no real network requests)
    //   https://api.github.com/repos/ai/TestRepo/pulls/10
    //   https://api.github.com/repos/ai/TestRepo/pulls/10/files
    //   https://api.github.com/repos/ai/TestRepo/pulls/10/commits

    githubRequest
      .mockResolvedValueOnce({
        title: "Add new feature",
        user: { login: "ai" },
        additions: 15,
        deletions: 5,
        changed_files: 2,
      }) // PR info response
      .mockResolvedValueOnce([
        {
          filename: "index.js",
          additions: 10,
          deletions: 2,
          patch: "sample patch",
        },
      ]) // Files response
      .mockResolvedValueOnce([{}, {}]);

    // Mock Gemini AI response

    const fakeGeminiOutput = {
      score: 85,
      filesChanged: 2,
      linesAdded: 15,
      linesDeleted: 5,
      commits: 2,
      suggestions: [
        {
          severity: "Info",
          description: "Looks good overall",
          file: "index.js",
          suggestedFix: "None",
        },
      ],
    };

    // Mock how Gemini responds when called

    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => Promise.resolve(JSON.stringify(fakeGeminiOutput)),
      },
    });

    getGeminiModel.mockReturnValue({ generateContent: mockGenerateContent });

    const res = await request(app)
      .post(`/api/pr/${repo.githubId}/prs/${pull.prNumber}/analyze`)
      .set("x-user-id", user._id.toString());

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis.score).toBe(85);
  });

  it("Should not find the repo", async () => {
    const user = await User.create({
      fullName: "AI Tester",
      email: "ai@test.com",
      password: "pass123",
      githubToken: "fake-token",
    });

    const repo = await Repo.create({
      user: user._id,
      githubId: 999,
      name: "TestRepo",
      fullName: "ai/TestRepo",
    });

    await repo.populate("user");

    const pull = await Pull.create({
      repo: repo._id,
      prNumber: 10,
      title: "Add new feature",
    });

    const res = await request(app)
      .post(`/api/pr/10/prs/${pull.prNumber}/analyze`)
      .set("x-user-id", user._id.toString());

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Repo not found");
  });

  it("Show Github not connected", async () => {
    const user = await User.create({
      fullName: "tester",
      email: "test1@gmail.com",
      password: "pass123",
    });

    const repo = await Repo.create({
      user: user._id,
      githubId: 999,
      name: "TestRepo",
      fullName: "ai/TestRepo",
    });

    await repo.populate("user");

    const pull = await Pull.create({
      repo: repo._id,
      prNumber: 10,
      title: "Add new feature",
    });

    const res = await request(app)
      .post(`/api/pr/${repo.githubId}/prs/${pull.prNumber}/analyze`)
      .set("x-user-id", user._id.toString());

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("GitHub not connected");
  });
});
