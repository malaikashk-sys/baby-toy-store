import express from "express";
import { getProductReviews, createReview } from "../controllers/review.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:productId", getProductReviews);
router.post("/:productId", protect, createReview);

export default router;