import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';

dotenv.config();

// 1. High-Quality Static Baby Toy Images Array (All 10 slots filled)
const toyImages = [
  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80",
  "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&q=80",
  "https://images.unsplash.com/photo-1558060370-d644479be6f7?w=500&q=80",
  "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80",
  "https://images.unsplash.com/photo-1533230393618-1254bf38f424?w=500&q=80",
  "https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=500&q=80",
  "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&q=80",
  "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&q=80",
  "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=500&q=80",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80"
];

// 2. Complete Enum Compliant Categories List
const validCategories = [
  "Rattles",
  "Learning Toys",
  "Pretend Play",
  "Building Blocks",
  "Dolls",
  "Remote Control",
  "Outdoor",
  "STEM",
  "Montessori",
  "Newborn Essentials"
];

const validAgeRanges = [
  "0-6 months",
  "6-12 months",
  "1-2 years",
  "3-5 years",
  "6-8 years",
  "9+ years"
];

const brands = ["KidsJoy", "BabyFun", "LittleStars", "ToyCo"];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected for seeding...");

    // Reset old data to avoid duplicate key error on slug/sku
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Seed Fresh Categories
    const categoriesData = validCategories.map((cat) => ({
      name: cat,
      slug: cat.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    }));

    const seededCategories = await Category.insertMany(categoriesData);
    console.log(`${seededCategories.length} categories seeded successfully!`);

    // Generate 40 Products
    const productsToSeed = [];

    for (let i = 1; i <= 40; i++) {
      const catName = validCategories[(i - 1) % validCategories.length];
      const ageRange = validAgeRanges[(i - 1) % validAgeRanges.length];
      const brand = brands[(i - 1) % brands.length];
      const name = `${catName} Toy Model ${i}`;
      const slug = `${catName.toLowerCase().replace(/ /g, '-')}-toy-model-${i}`;

      productsToSeed.push({
        name: name,
        slug: slug,
        sku: `SKU-TOY-FULL-${1000 + i}`,
        description: `High quality, safe, and durable ${catName} suitable for child learning and entertainment.`,
        brand: brand,
        category: catName, // Strict Enum String Matching Schema
        ageRange: ageRange, // Strict Enum String Matching Schema
        price: Math.floor(Math.random() * 1200) + 180,
        discount: (i % 4 === 0) ? 15 : 0,
        stock: Math.floor(Math.random() * 40) + 10,
        images: [
          {
            url: toyImages[(i - 1) % toyImages.length],
            altText: name,
          },
        ],
        safetyInfo: {
          material: "Non-Toxic Child Safe Plastic",
          chokingWarning: i % 2 === 0,
          certification: "ASTM Certified",
        },
        rating: {
          average: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
          count: Math.floor(Math.random() * 25) + 3,
        },
        isActive: true,
      });
    }

    await Product.insertMany(productsToSeed);
    console.log(`${productsToSeed.length} products seeded with complete non-empty values!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedDatabase();