import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import couponRoutes from "./routes/coupon.route.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import reviewRoutes from "./routes/review.route.js";
import paymentRoutes from "./routes/payment.route.js";
import categoryRoutes from "./routes/category.route.js";
import notificationRoutes from "./routes/notification.route.js";
import { handleStripeWebhook } from "./controllers/payment.controller.js";
dotenv.config();

// Database connect karein — sirf test mode ke ilawa
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

const app = express();

app.use(cors());

// IMPORTANT: Stripe webhook ko raw (unparsed) body chahiye signature verify karne ke liye,
// isliye ye route express.json() se PEHLE, apne raw parser ke saath mount karna zaroori hai.
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());

app.use(helmet());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // dev mein zyada, production mein 100
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use(limiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;