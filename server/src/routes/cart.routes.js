import express from "express";
import { getCart, addToCart, removeFromCart, updateCartItem } from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getCart)
  .post(protect, addToCart);

router.route("/:productId")
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

export default router;