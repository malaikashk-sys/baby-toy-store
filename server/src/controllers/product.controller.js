import Product from "../models/product.model.js";

// Get All Products (with filters, category, search, pagination)
export const getProducts = async (req, res) => {
  try {
    const { category, ageRange, search, sort, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (ageRange) query.ageRange = ageRange;
    if (search) {
      query.$text = { $search: search };
    }

    let productsQuery = Product.find(query);

    // Sorting
    if (sort === "price-low") {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === "price-high") {
      productsQuery = productsQuery.sort({ price: -1 });
    } else if (sort === "rating") {
      productsQuery = productsQuery.sort({ "rating.average": -1 });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 }); // Newest
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    productsQuery = productsQuery.skip(skip).limit(parseInt(limit));

    const products = await productsQuery;
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Product by Slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Product (Admin/Staff)
// Create Product (Admin/Staff)
export const createProduct = async (req, res) => {
  try {
    const images = req.files
      ? req.files.map((file) => ({ url: file.path }))
      : [];

    const newProduct = new Product({
      ...req.body,
      images,
    });

    await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// Delete Product (Admin/Staff)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};