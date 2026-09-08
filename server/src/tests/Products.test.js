import request from "supertest";
import app from "../app.js";
import User from "../models/user.model.js";
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

// Test mein admin/staff seedha DB mein banate hain — registerUser
// hamesha "customer" role force karta hai, isliye API se admin nahi ban sakta.
const createUserWithRole = async (role) => {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await User.create({
    name: `${role} user`,
    email: `${role}@example.com`,
    password: hashedPassword,
    role,
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email: `${role}@example.com`,
    password: "password123",
  });

  return { user, token: loginRes.body.token };
};

const sampleProduct = {
  name: "Test Rattle",
  slug: "test-rattle",
  sku: "SKU-TEST-1",
  description: "A test rattle toy",
  brand: "ToyCo",
  category: "Rattles",
  ageRange: "0-6 months",
  price: 500,
  stock: 10,
};

describe("Products API", () => {
  test("GET /api/products returns a list without auth", async () => {
    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("POST /api/products without a token is rejected", async () => {
    const response = await request(app).post("/api/products").send(sampleProduct);

    expect(response.status).toBe(401);
  });

  test("POST /api/products as admin creates a product", async () => {
    const { token } = await createUserWithRole("admin");

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleProduct);

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe("Test Rattle");
  });

  test("DELETE /api/products/:id as staff (not admin) is forbidden", async () => {
    const { token: adminToken } = await createUserWithRole("admin");
    const createRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sampleProduct);

    const { token: staffToken } = await createUserWithRole("staff");
    const deleteRes = await request(app)
      .delete(`/api/products/${createRes.body.data._id}`)
      .set("Authorization", `Bearer ${staffToken}`);

    expect(deleteRes.status).toBe(403);
  });
});