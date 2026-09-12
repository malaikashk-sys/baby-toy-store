import express from "express";
import { loginUser, registerUser, createStaffUser } from "../controllers/auth.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new customer account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already exists
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Invalid email or password
 *       403:
 *         description: Account is blocked
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /auth/create-staff:
 *   post:
 *     summary: Create a new staff or admin account (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [staff, admin]
 *     responses:
 *       201:
 *         description: Staff/admin account created
 *       403:
 *         description: Not authorized (admin only)
 */
router.post("/create-staff", protect, authorize("admin"), createStaffUser);

export default router;