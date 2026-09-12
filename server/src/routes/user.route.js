import express from "express";
import {
  getMyAddresses,
  addAddress,
  deleteAddress,
  getAllCustomers,
  updateCustomerStatus,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Customer — apne addresses manage karna
router.get("/addresses", protect, getMyAddresses);
router.post("/addresses", protect, addAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

// Admin/Staff — customer management
router.get("/customers", protect, authorize("admin", "staff"), getAllCustomers);
router.patch("/customers/:id/status", protect, authorize("admin", "staff"), updateCustomerStatus);

export default router;