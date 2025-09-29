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

  it('should login a user successfully',async () => {
    await request(app)
    .post("/api/auth/signup")
    .send({
      fullName: "Test1",
      email: "Test1@gmail.com",
      password: "Test1",
    });

    const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "Test1@gmail.com",
      password: "Test1",
    })

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
  });

  it("should not login with wrong password", async () => {
    await request(app).post("/api/auth/signup").send({
      fullName: "Test User",
      email: "wrongpass@gmail.com",
      password: "correct123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrongpass@gmail.com",
      password: "wrong123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should not login with non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@gmail.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User not found");
  });
  
  it('should fail when fields are missing',async () => {
    const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "",
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Please provide email and password");
  });

  // logout

  it("should logout successfully", async () => {
    const res = await request(app).get("/api/auth/logout");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logout successful");
  });


});
