import express from "express";
import { loginUser, registerUser, createStaffUser } from "../controllers/auth.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin-only: naya Staff ya Admin account banayein
router.post("/create-staff", protect, authorize("admin"), createStaffUser);

export default router;