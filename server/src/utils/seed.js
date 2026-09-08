import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Coupon from "../models/coupon.model.js";

dotenv.config();

const categories = [
  "Rattles", "Learning Toys", "Pretend Play", "Building Blocks", "Dolls",
  "Remote Control", "Outdoor", "STEM", "Montessori", "Newborn Essentials",
];

const ageRanges = ["0-6 months", "6-12 months", "1-2 years", "3-5 years", "6-8 years", "9+ years"];
const brands = ["ToyCo", "BabyFun", "KidsJoy", "LittleStars"];

const generateProducts = () => {
  const products = [];
  for (let i = 1; i <= 40; i++) {
    const category = categories[i % categories.length];
    const ageRange = ageRanges[i % ageRanges.length];
    const brand = brands[i % brands.length];
    const price = Math.floor(Math.random() * 2000) + 200;

    products.push({
      name: `${category} Toy Model ${i}`,
      slug: `${category.toLowerCase().replace(/\s+/g, "-")}-toy-${i}`,
      sku: `SKU-${1000 + i}`,
      description: `A fun and safe ${category.toLowerCase()} toy for kids, perfect for ${ageRange}.`,
      brand,
      category,
      ageRange,
      price,
      stock: Math.floor(Math.random() * 50) + 5,
      images: [],
    });
  }
  return products;
};

const coupons = [
  {
    code: "SAVE10",
    type: "percentage",
    value: 10,
    minimumOrder: 500,
    maxDiscount: 300,
    expiresAt: new Date("2027-12-31"),
    active: true,
  },
  {
    code: "FLAT200",
    type: "fixed",
    value: 200,
    minimumOrder: 1000,
    expiresAt: new Date("2027-12-31"),
    active: true,
  },
];

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    // Categories seed karein
    await Category.deleteMany({});
    const categoryDocs = categories.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      description: `Explore our ${name.toLowerCase()} collection.`,
    }));
    await Category.insertMany(categoryDocs);
    console.log(`${categoryDocs.length} categories seeded!`);

    // Products seed karein
    await Product.deleteMany({});
    const products = generateProducts();
    await Product.insertMany(products);
    console.log(`${products.length} products seeded!`);

    // Coupons seed karein
    await Coupon.deleteMany({});
    await Coupon.insertMany(coupons);
    console.log(`${coupons.length} coupons seeded!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedAll();