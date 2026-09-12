import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getAdminStats,
  exportOrdersCSV,
} from "../controllers/order.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order creation, tracking, and admin management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order from the current cart (with optional coupon)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couponCode: { type: string }
 *     responses:
 *       201:
 *         description: Order created, awaiting payment
 *       400:
 *         description: Cart empty or insufficient stock
 *   get:
 *     summary: Get the logged-in user's own orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the user's orders
 */
router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);

/**
 * @swagger
 * /orders/all:
 *   get:
 *     summary: Get all orders across all customers (admin/staff only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *       403:
 *         description: Not authorized
 */
router.get("/all", protect, authorize("admin", "staff"), getAllOrders);

/**
 * @swagger
 * /orders/stats/summary:
 *   get:
 *     summary: Get admin dashboard KPIs (revenue, order counts, status breakdown)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       403:
 *         description: Not authorized
 */
router.get("/stats/summary", protect, authorize("admin", "staff"), getAdminStats);

/**
 * @swagger
 * /orders/export/csv:
 *   get:
 *     summary: Export all orders as CSV (admin/staff only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 */
router.get("/export/csv", protect, authorize("admin", "staff"), exportOrdersCSV);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update an order's status with optional note (admin/staff only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending Payment, Paid, Processing, Packed, Shipped, Delivered, Failed, Cancel Requested, Cancelled, Return Requested, Returned, Rejected]
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put("/:id/status", protect, authorize("admin", "staff"), updateOrderStatus);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a single order by ID (owner only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order details
 *       403:
 *         description: Not authorized to view this order
 */
router.get("/:id", protect, getOrderById);

export default router;