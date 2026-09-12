import express from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  deleteProduct,
  exportProductsCSV,
} from "../controllers/product.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog, search, filters, and management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products with filters, search, sort, and pagination
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: ageRange
 *         schema: { type: string }
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: minRating
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price-low, price-high, rating] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of products
 */
router.get("/", getProducts);

/**
 * @swagger
 * /products/export/csv:
 *   get:
 *     summary: Export all products as CSV (admin/staff only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *       403:
 *         description: Not authorized
 */
router.get("/export/csv", protect, authorize("admin", "staff"), exportProductsCSV);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     summary: Get a single product by slug
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get("/:slug", getProductBySlug);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product with images (admin/staff only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               sku: { type: string }
 *               description: { type: string }
 *               brand: { type: string }
 *               category: { type: string }
 *               ageRange: { type: string }
 *               price: { type: number }
 *               stock: { type: number }
 *               variants: { type: string, description: "JSON string of variant array" }
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post("/", protect, authorize("admin", "staff"), upload.array("images", 5), createProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;