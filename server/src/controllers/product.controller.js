import Product from "../models/product.model.js";
import { logAction } from "../utils/auditLog.js";

const escapeCSVField = (field) => {
  const str = String(field ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      ageRange,
      search,
      sort,
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      minRating,
    } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (ageRange) query.ageRange = ageRange;
    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query["rating.average"] = { $gte: Number(minRating) };
    }

    let productsQuery = Product.find(query);

    if (sort === "price-low") {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === "price-high") {
      productsQuery = productsQuery.sort({ price: -1 });
    } else if (sort === "rating") {
      productsQuery = productsQuery.sort({ "rating.average": -1 });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

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

export const createProduct = async (req, res) => {
  try {
    const images = req.files
      ? req.files.map((file) => ({ url: file.path }))
      : [];

    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
      } catch (parseError) {
        return res.status(400).json({ success: false, message: "Invalid variants format" });
      }
    }

    const newProduct = new Product({
      ...req.body,
      variants,
      images,
    });

    await newProduct.save();

    await logAction({
      user: req.user,
      action: "product_created",
      entityType: "Product",
      entityId: newProduct._id,
      details: `Created product "${newProduct.name}"`,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await logAction({
      user: req.user,
      action: "product_deleted",
      entityType: "Product",
      entityId: product._id,
      details: `Deleted product "${product.name}"`,
    });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportProductsCSV = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const headers = [
      "Name", "SKU", "Category", "Age Range", "Base Price",
      "Base Stock", "Variants", "Rating Average", "Rating Count", "Active",
    ];

    const rows = products.map((p) => {
      const variantsSummary = p.variants && p.variants.length > 0
        ? p.variants.map((v) => `${v.size || ""}/${v.color || ""}:${v.stock}`).join("; ")
        : "";

      return [
        p.name,
        p.sku,
        p.category,
        p.ageRange,
        p.price,
        p.stock,
        variantsSummary,
        p.rating?.average || 0,
        p.rating?.count || 0,
        p.isActive ? "Yes" : "No",
      ];
    });

    const csvLines = [
      headers.map(escapeCSVField).join(","),
      ...rows.map((row) => row.map(escapeCSVField).join(",")),
    ];
    const csvContent = csvLines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products_export.csv");
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};