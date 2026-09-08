import express from "express";
import { getCategories, createCategory } from "../controllers/category.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, authorize("admin", "staff"), createCategory);

export default router;