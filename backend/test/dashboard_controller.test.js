const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Repo = require("../model/Repo");
const PRAnalysis = require("../model/PRAnalysis");
const app = require("../app");

jest.mock("../middleware/isLoggedIn", () => (req, res, next) => {
  req.user = {
    id: req.headers["x-user-id"] || "fakeuserid",
  };
  next();
});

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  jest.restoreAllMocks();
});

afterEach(async () => {
  await User.deleteMany({});
  await Repo.deleteMany({});
  await PRAnalysis.deleteMany({});
});

describe("get dashboard details of a user", () => {
  it("Should shows the dashboard status data", async () => {
    const user = await User.create({
      fullName: "test1",
      email: "test1@gmail.com",
      password: "test1",
    });

    const repos = await Repo.create([
      {
        user: user._id,
        githubId: 101,
        name: "Repo1",
        fullName: "testuser/Repo1",
        lastPrActivity: new Date(),
      },
      {
        user: user._id,
        githubId: 102,
        name: "Repo2",
        fullName: "testuser/Repo2",
        lastPrActivity: new Date(),
      },
      {
        user: user._id,
        githubId: 103,
        name: "Repo3",
        fullName: "testuser/Repo3",
        lastPrActivity: new Date(),
      },
    ]);

    await PRAnalysis.create([
      {
        pull: new mongoose.Types.ObjectId(),
        repo: repos[0]._id,
        score: 80,
        analyzedAt: new Date(),
      },
      {
        pull: new mongoose.Types.ObjectId(),
        repo: repos[1]._id,
        score: 90,
        analyzedAt: new Date(),
      },
    ]);

    const token = jwt.sign(
      {
        pull: new mongoose.Types.ObjectId(),
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Cookie", `token=${token}`)
      .set("x-user-id", user._id.toString());

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalRepositories).toBe(3);
    expect(res.body.stats.prsAnalyzedThisWeek).toBe(2);
    expect(res.body.stats.averagePRScore).toBe(85.0);
  });
});
