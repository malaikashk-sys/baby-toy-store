import express from "express";
import { createCoupon, validateCoupon } from "../controllers/coupon.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/validate", protect, validateCoupon);
router.post("/", protect, authorize("admin", "staff"), createCoupon);

export default router;