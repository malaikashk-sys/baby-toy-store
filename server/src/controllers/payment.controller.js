import Stripe from "stripe";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { createNotification } from "../utils/notify.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Ek existing order (jo pehle se DB mein "Pending Payment" hai) ke liye Payment Intent banayein.
// Amount FRONTEND se nahi liya jata — order ke DB record se liya jata hai, taake koi tamper na kar sake.
export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized for this order" });
    }
    if (order.status !== "Pending Payment") {
      return res.status(400).json({ success: false, message: "Order is not awaiting payment" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order._id.toString() },
    });

    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Stripe Webhook — ye Stripe ke servers se call hota hai, browser se nahi.
// Signature verify karna zaroori hai taake koi fake request "payment succeeded" na bhej sake.
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const order = await Order.findOne({ paymentIntentId: paymentIntent.id });

      if (order && order.status === "Pending Payment") {
        order.status = "Paid";
        order.statusHistory.push({ status: "Paid", note: "Payment confirmed via Stripe webhook" });
        await order.save();

        await createNotification(
          order.user,
          "payment",
          "Payment Confirmed",
          `Your payment of Rs. ${order.totalAmount} was successful. Your order is now being processed.`,
          { orderId: order._id }
        );
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const order = await Order.findOne({ paymentIntentId: paymentIntent.id });

      if (order && order.status === "Pending Payment") {
        // Payment fail hui — reserved stock wapas karte hain
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
        order.status = "Cancelled";
        order.statusHistory.push({ status: "Cancelled", note: "Payment failed" });
        await order.save();

        await createNotification(
          order.user,
          "payment",
          "Payment Failed",
          `Your payment for order ${order._id} could not be processed. The order has been cancelled.`,
          { orderId: order._id }
        );
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};