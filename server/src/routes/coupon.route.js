import express from "express";
import { createCoupon, validateCoupon, getAllCoupons, toggleCoupon, deleteCoupon } from "../controllers/coupon.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Discount coupon management
 */

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validate a coupon code against an order amount
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, orderAmount]
 *             properties:
 *               code: { type: string }
 *               orderAmount: { type: number }
 *     responses:
 *       200:
 *         description: Coupon is valid, returns discount amount
 *       400:
 *         description: Coupon expired or minimum order not met
 *       404:
 *         description: Invalid coupon code
 */
router.post("/validate", protect, validateCoupon);

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: List all coupons (admin/staff only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all coupons
 *   post:
 *     summary: Create a new coupon (admin/staff only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, type, value, expiresAt]
 *             properties:
 *               code: { type: string }
 *               type: { type: string, enum: [percentage, fixed] }
 *               value: { type: number }
 *               minimumOrder: { type: number }
 *               maxDiscount: { type: number }
 *               expiresAt: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Coupon created
 */
router.get("/", protect, authorize("admin", "staff"), getAllCoupons);
router.post("/", protect, authorize("admin", "staff"), createCoupon);

/**
 * @swagger
 * /coupons/{id}/toggle:
 *   patch:
 *     summary: Toggle a coupon's active/inactive status (admin/staff only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Coupon status toggled
 */
router.patch("/:id/toggle", protect, authorize("admin", "staff"), toggleCoupon);

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     summary: Delete a coupon permanently (admin/staff only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 */
router.delete("/:id", protect, authorize("admin", "staff"), deleteCoupon);

export default router;