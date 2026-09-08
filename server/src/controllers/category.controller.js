import Category from "../models/category.model.js";

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a category (admin)
export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};