import mongoose from "mongoose";
import dotenv from "dotenv";
import Coupon from "../models/coupon.model.js";

dotenv.config();

const couponsToSeed = [
  {
    code: "SAVE10",
    type: "percentage",
    value: 10,
    minimumOrder: 0,
    maxDiscount: 200,
    expiresAt: new Date("2027-12-31"),
    active: true,
  },
  {
    code: "FLAT200",
    type: "fixed",
    value: 200,
    minimumOrder: 500,
    expiresAt: new Date("2027-12-31"),
    active: true,
  },
];

const seedCoupons = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected for coupon seeding...");

    // Purane coupons hata dete hain taake dobara chalane par duplicate-key error na aaye
    await Coupon.deleteMany({});

    const seeded = await Coupon.insertMany(couponsToSeed);
    console.log(`${seeded.length} coupons seeded successfully: ${seeded.map((c) => c.code).join(", ")}`);

    process.exit(0);
  } catch (error) {
    console.error("Coupon seeding error:", error.message);
    process.exit(1);
  }
};

seedCoupons();