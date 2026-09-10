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

router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);
router.get("/all", protect, authorize("admin", "staff"), getAllOrders);
router.get("/stats/summary", protect, authorize("admin", "staff"), getAdminStats);
router.get("/export/csv", protect, authorize("admin", "staff"), exportOrdersCSV);
router.put("/:id/status", protect, authorize("admin", "staff"), updateOrderStatus);
router.get("/:id", protect, getOrderById);

export default router;