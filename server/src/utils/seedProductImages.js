import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "./cloudinary.js";
import Product from "../models/product.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesFolder = path.join(__dirname, "..", "..", "seed-images");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // 1. Local folder se image files padhein
    const files = fs
      .readdirSync(imagesFolder)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

    if (files.length === 0) {
      console.log("No images found in seed-images folder. Add some and re-run.");
      process.exit(0);
    }
    console.log(`Found ${files.length} local image(s). Uploading to Cloudinary...`);

    // 2. Har image Cloudinary pe upload karein, URL collect karein
    const uploadedUrls = [];
    for (const file of files) {
      const filePath = path.join(imagesFolder, file);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "baby-toy-store/products",
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      });
      uploadedUrls.push(result.secure_url);
      console.log(`Uploaded: ${file} -> ${result.secure_url}`);
    }

    // 3. Un products ko dhoondein jinke paas koi image nahi
    const productsWithoutImages = await Product.find({
      $or: [{ images: { $size: 0 } }, { images: { $exists: false } }],
    });
    console.log(`Found ${productsWithoutImages.length} product(s) without images.`);

    // 4. Har product ko randomly ek uploaded image assign karein
    for (const product of productsWithoutImages) {
      const randomUrl = uploadedUrls[Math.floor(Math.random() * uploadedUrls.length)];
      product.images = [{ url: randomUrl, altText: product.name }];
      await product.save();
    }

    console.log(`Done! ${productsWithoutImages.length} product(s) updated with images.`);
    process.exit(0);
  }  catch (error) {
  console.error("Failed:", error);
  process.exit(1);
}
};

run();