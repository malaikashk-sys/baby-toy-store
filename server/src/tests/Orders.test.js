import request from "supertest";
import app from "../app.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
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

const registerAndLogin = async (email) => {
  await request(app).post("/api/auth/register").send({
    name: "Order Test User",
    email,
    password: "password123",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email,
    password: "password123",
  });

  return loginRes.body.token;
};

const createProduct = async (overrides = {}) => {
  return Product.create({
    name: "Test Blocks",
    slug: `test-blocks-${Date.now()}-${Math.random()}`,
    sku: `SKU-${Date.now()}-${Math.random()}`,
    description: "A test building blocks toy",
    brand: "ToyCo",
    category: "Building Blocks",
    ageRange: "1-2 years",
    price: 300,
    stock: 5,
    ...overrides,
  });
};

describe("Orders API", () => {
  test("POST /api/orders fails when cart is empty", async () => {
    const token = await registerAndLogin("emptycart@example.com");

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/empty/i);
  });

  test("POST /api/orders creates an order from cart and reduces stock", async () => {
    const token = await registerAndLogin("orderflow@example.com");
    const product = await createProduct({ stock: 5 });

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id, quantity: 2 });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("Pending Payment");
    expect(response.body.data.totalAmount).toBe(600);

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.stock).toBe(3);
  });

  test("POST /api/orders fails when requested quantity exceeds stock", async () => {
    const token = await registerAndLogin("lowstock@example.com");
    const product = await createProduct({ stock: 1 });

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id, quantity: 3 });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/stock/i);
  });

  test("GET /api/orders/all is forbidden for a customer", async () => {
    const token = await registerAndLogin("customerview@example.com");

    const response = await request(app)
      .get("/api/orders/all")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});