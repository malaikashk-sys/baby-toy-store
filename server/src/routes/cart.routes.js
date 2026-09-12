import express from "express";
import { getCart, addToCart, removeFromCart, updateCartItem } from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the logged-in user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current cart contents
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer }
 *               variant:
 *                 type: object
 *                 properties:
 *                   size: { type: string }
 *                   color: { type: string }
 *     responses:
 *       201:
 *         description: Item added to cart
 */
router.route("/")
  .get(protect, getCart)
  .post(protect, addToCart);

/**
 * @swagger
 * /cart/{productId}:
 *   put:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Cart item updated
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.route("/:productId")
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

export default router;