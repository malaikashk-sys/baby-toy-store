import request from "supertest";
import app from "../app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe("Auth API", () => {
  test("should register a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test("should not register with duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "duplicate@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Another User",
      email: "duplicate@example.com",
      password: "password456",
    });

    expect(response.status).toBe(400);
  });

  test("should login with correct credentials", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login Test",
      email: "logintest@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "logintest@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test("should not login with wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Wrong Pass Test",
      email: "wrongpass@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "wrongpass@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(400);
  });
});