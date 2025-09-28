const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../model/User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("AUTH API end point testing", () => {
  // signup tests
  it("should signup a user", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      fullName: "Test1",
      email: "Test1@gmail.com",
      password: "Test1",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User created successfully");
  });

  it("should fail signup when fields are missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "Test1@gmail.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Please provide all the fields");
  });

  it("should fail user when user already exist", async () => {
    await request(app).post("/api/auth/signup").send({
      fullName: "Test1",
      email: "Test1@gmail.com",
      password: "Test1",
    });

    const res = await request(app).post("/api/auth/signup").send({
      fullName: "Another Name",
      email: "Test1@gmail.com",
      password: "Test1123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  // login tests
});
