import express from "express";
import {
  getProductReviews,
  createReview,
  getAllReviewsAdmin,
  moderateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public / customer routes
router.get("/:productId", getProductReviews);
router.post("/:productId", protect, createReview);

// Admin/Staff moderation routes
router.get("/admin/:productId", protect, authorize("admin", "staff"), getAllReviewsAdmin);
router.patch("/moderate/:reviewId", protect, authorize("admin", "staff"), moderateReview);
router.delete("/:reviewId", protect, authorize("admin", "staff"), deleteReview);

export default router;