import request from "supertest";
import app from "../app.js";
import User from "../models/user.model.js";
import Coupon from "../models/coupon.model.js";
import bcrypt from "bcryptjs";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

beforeAll(async () => {
  await connectTestDB();
}, 30000);

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

const createCustomer = async () => {
  const hashedPassword = await bcrypt.hash("password123", 10);
  await User.create({
    name: "Customer User",
    email: "customer@example.com",
    password: hashedPassword,
    role: "customer",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "customer@example.com",
    password: "password123",
  });

  return { token: loginRes.body.token };
};

describe("Coupon API Endpoints", () => {
  test("POST /api/coupons/validate - Valid SAVE10 (percentage) applies successfully", async () => {
    const { token } = await createCustomer();

    await Coupon.create({
      code: "SAVE10",
      type: "percentage",
      value: 10,
      minimumOrder: 50,
      active: true,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "SAVE10", orderAmount: 100 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.discount).toBe(10);
  });

  test("POST /api/coupons/validate - Valid FLAT200 (fixed) applies successfully", async () => {
    const { token } = await createCustomer();

    await Coupon.create({
      code: "FLAT200",
      type: "fixed",
      value: 200,
      minimumOrder: 1000,
      active: true,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "FLAT200", orderAmount: 1500 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.discount).toBe(200);
  });

  test("POST /api/coupons/validate - Reject coupon below minimum purchase", async () => {
    const { token } = await createCustomer();

    await Coupon.create({
      code: "FLAT200",
      type: "fixed",
      value: 200,
      minimumOrder: 1000,
      active: true,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "FLAT200", orderAmount: 500 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/coupons/validate - Reject invalid coupon code", async () => {
    const { token } = await createCustomer();

    const response = await request(app)
      .post("/api/coupons/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "NONEXISTENT", orderAmount: 100 });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/coupons/validate - Reject expired coupon", async () => {
    const { token } = await createCustomer();

    await Coupon.create({
      code: "EXPIRED10",
      type: "percentage",
      value: 10,
      minimumOrder: 50,
      active: true,
      expiresAt: new Date(Date.now() - 86400000),
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "EXPIRED10", orderAmount: 100 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/coupons/validate - Reject inactive coupon", async () => {
    const { token } = await createCustomer();

    await Coupon.create({
      code: "INACTIVE10",
      type: "percentage",
      value: 10,
      minimumOrder: 50,
      active: false,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "INACTIVE10", orderAmount: 100 });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/coupons/validate - Correct maxDiscount cap calculation", async () => {
    const { token } = await createCustomer();

    await Coupon.create({
      code: "MAX50",
      type: "percentage",
      value: 50,
      maxDiscount: 100,
      minimumOrder: 50,
      active: true,
      expiresAt: new Date(Date.now() + 86400000),
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "MAX50", orderAmount: 500 });

    expect(response.status).toBe(200);
    expect(response.body.data.discount).toBe(100);
  });

  test("POST /api/coupons/validate - Reject request without token", async () => {
    const response = await request(app)
      .post("/api/coupons/validate")
      .send({ code: "SAVE10", orderAmount: 100 });

    expect(response.status).toBe(401);
  });
});