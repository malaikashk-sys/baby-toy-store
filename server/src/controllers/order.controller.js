import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";
import User from "../models/user.model.js";
import { createNotification } from "../utils/notify.js";
import { logAction } from "../utils/auditLog.js";

const escapeCSVField = (field) => {
  const str = String(field ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart no longer exists",
        });
      }

      let itemPrice = product.price;
      let matchedVariant = null;

      if (product.variants && product.variants.length > 0) {
        matchedVariant = product.variants.find(
          (v) =>
            (v.size || null) === (item.variant?.size || null) &&
            (v.color || null) === (item.variant?.color || null)
        );

        if (!matchedVariant) {
          return res.status(400).json({
            success: false,
            message: `Selected variant no longer exists for ${product.name}`,
          });
        }

        if (matchedVariant.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name} (${matchedVariant.size || ""} ${matchedVariant.color || ""})`,
          });
        }

        itemPrice = matchedVariant.price || product.price;
      } else {
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`,
          });
        }
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        variant: item.variant?.size || item.variant?.color ? item.variant : undefined,
      });

      totalAmount += itemPrice * item.quantity;

      if (matchedVariant) {
        matchedVariant.stock -= item.quantity;
      } else {
        product.stock -= item.quantity;
      }
      await product.save();
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });

      if (coupon && coupon.expiresAt > new Date() && totalAmount >= coupon.minimumOrder) {
        if (coupon.type === "percentage") {
          discount = (totalAmount * coupon.value) / 100;
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
          discount = coupon.value;
        }
      }
    }

    const finalAmount = Math.round((totalAmount - discount) * 100) / 100;

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount: finalAmount,
      status: "Pending Payment",
      statusHistory: [{ status: "Pending Payment", note: "Order created" }],
    });

    cart.items = [];
    await cart.save();

    await createNotification(
      userId,
      "order",
      "Order Placed",
      `Your order for Rs. ${finalAmount} has been placed and is awaiting payment.`,
      { orderId: order._id }
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || "" });

    await order.save();

    await createNotification(
      order.user,
      "order",
      "Order Status Updated",
      `Your order is now "${status}".${note ? ` (${note})` : ""}`,
      { orderId: order._id, status }
    );

    await logAction({
      user: req.user,
      action: "order_status_updated",
      entityType: "Order",
      entityId: order._id,
      details: `Order status changed to "${status}"${note ? ` — ${note}` : ""}`,
    });

    res.status(200).json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const paidStatuses = ["Paid", "Processing", "Packed", "Shipped", "Delivered"];

    const [revenueAgg, totalOrders, pendingOrders, totalProducts, totalCustomers] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $in: paidStatuses } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ status: "Pending Payment" }),
      Product.countDocuments(),
      User.countDocuments({ role: "customer" }),
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenueAgg[0]?.total || 0,
        totalOrders,
        pendingOrders,
        totalProducts,
        totalCustomers,
        ordersByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });

    const headers = [
      "Order ID", "Customer Name", "Customer Email", "Total Amount",
      "Status", "Items", "Created At",
    ];

    const rows = orders.map((order) => {
      const itemsSummary = order.items
        .map((item) => {
          const variantPart = item.variant?.size || item.variant?.color
            ? ` (${item.variant.size || ""}/${item.variant.color || ""})`
            : "";
          return `${item.name}${variantPart} x${item.quantity}`;
        })
        .join("; ");

      return [
        order._id.toString(),
        order.user?.name || "N/A",
        order.user?.email || "N/A",
        order.totalAmount,
        order.status,
        itemsSummary,
        order.createdAt.toISOString(),
      ];
    });

    const csvLines = [
      headers.map(escapeCSVField).join(","),
      ...rows.map((row) => row.map(escapeCSVField).join(",")),
    ];
    const csvContent = csvLines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders_export.csv");
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};