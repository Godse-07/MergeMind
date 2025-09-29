const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../model/User");
const Repo = require("../model/Repo");
const { MongoMemoryServer } = require("mongodb-memory-server");
const axios = require("axios");
const jwt = require("jsonwebtoken");

// Mock axios globally
jest.mock("axios");

// Mock the registerWebhook module to prevent actual webhook registration
jest.mock("../config/registerWebhook", () => ({
  registerWebhook: jest.fn().mockResolvedValue(true),
}));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Repo.deleteMany({});
  jest.clearAllMocks();
});

describe("GitHub Connect API", () => {
  it("should connect GitHub successfully", async () => {
    const user = await User.create({
      fullName: "Test User",
      email: "github@test.com",
      password: "hashedPassword",
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    axios.post.mockResolvedValueOnce({
      data: { access_token: "fake-token" },
    });

    axios.get
      .mockResolvedValueOnce({
        data: { 
          avatar_url: "http://fake-avatar.com/me.png",
          login: "testuser" 
        },
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 123,
            name: "test-repo",
            full_name: "testuser/test-repo",
            html_url: "http://github.com/testuser/test-repo",
            private: false,
            description: "A test repo",
            language: "JavaScript",
            forks_count: 1,
            stargazers_count: 2,
            watchers_count: 3,
            updated_at: new Date().toISOString(),
          },
        ],
      });

    const res = await request(app)
      .get("/api/auth/connectGithub/callback?code=fake-code")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("GitHub connected successfully");

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.githubConnected).toBe(true);
    expect(updatedUser.githubToken).toBe("fake-token");
    expect(updatedUser.profilePicture).toBe("http://fake-avatar.com/me.png");

    const savedRepo = await Repo.findOne({ githubId: 123 });
    expect(savedRepo).not.toBeNull();
    expect(savedRepo.name).toBe("test-repo");
    expect(savedRepo.fullName).toBe("testuser/test-repo");
  });

  it("should fail if no code is provided", async () => {
    const user = await User.create({
      fullName: "Test User",
      email: "github@test.com",
      password: "hashedPassword",
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = await request(app)
      .get("/api/auth/connectGithub/callback")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Code not provided");
  });

  it("should fail if GitHub token exchange fails", async () => {
    const user = await User.create({
      fullName: "Test User",
      email: "github@test.com",
      password: "hashedPassword",
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    axios.post.mockResolvedValueOnce({
      data: {},
    });

    const res = await request(app)
      .get("/api/auth/connectGithub/callback?code=fake-code")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Failed to retrieve GitHub access token");
  });
});