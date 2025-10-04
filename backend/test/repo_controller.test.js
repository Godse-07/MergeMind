const mongoose = require("mongoose");
const app = require("../app");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Repo = require("../model/Repo");

jest.mock("../middleware/isLoggedIn", () => (req, res, next) => {
    req.user = { id: req.headers["x-user-id"] || "fakeuserid" };
    next();

})

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await jest.restoreAllMocks();
});

afterEach(async () => {
  await User.deleteMany({});
  await Repo.deleteMany({});
});

describe("GET all repos", () => {
  it("Should return repos for logged-in user", async () => {
    const user = await User.create({
      fullName: "testuser",
      email: "test1@gmail.com",
      password: "testuser",
    });

    await Repo.create([
      {
        user: user._id,
        githubId: 101,
        name: "Repo1",
        fullName: "testuser/Repo1",
      },
      {
        user: user._id,
        githubId: 102,
        name: "Repo2",
        fullName: "testuser/Repo2",
      },
      {
        user: user._id,
        githubId: 103,
        name: "Repo3",
        fullName: "testuser/Repo3",
      },
    ]);

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .get("/api/repositories/repos")
      .set("Cookie", `token=${token}`)
      .set("x-user-id", user._id.toString());

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.repos.length).toBe(3);
  });

  it("Should return 500 if error occurs", async () => {

    const res = await request(app)
      .get("/api/repositories/repos")
      .set("Cookie", `token=invalidtoken`)
      .set("x-user-id", "fakeuserid");;
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Facing issue while collecting repo");
  });
  
});
