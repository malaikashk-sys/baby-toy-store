import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    brand: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Rattles",
        "Learning Toys",
        "Pretend Play",
        "Building Blocks",
        "Dolls",
        "Remote Control",
        "Outdoor",
        "STEM",
        "Montessori",
        "Newborn Essentials",
      ],
    },
    ageRange: {
      type: String,
      required: [true, "Age range is required"],
      enum: [
        "0-6 months",
        "6-12 months",
        "1-2 years",
        "3-5 years",
        "6-8 years",
        "9+ years",
      ],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: 0,
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String },
      },
    ],
    safetyInfo: {
      material: { type: String },
      chokingWarning: { type: Boolean, default: false },
      certification: { type: String },
      batteryInfo: { type: String },
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Search aur filtering ko fast karne ke liye indexes
productSchema.index({ name: "text", brand: "text", description: "text" });
productSchema.index({ category: 1, ageRange: 1, price: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;