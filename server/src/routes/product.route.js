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

router.get("/", getProducts);
router.get("/export/csv", protect, authorize("admin", "staff"), exportProductsCSV);
router.get("/:slug", getProductBySlug);
router.post("/", protect, authorize("admin", "staff"), upload.array("images", 5), createProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;