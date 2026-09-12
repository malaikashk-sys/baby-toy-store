import Coupon from "../models/coupon.model.js";
import { logAction } from "../utils/auditLog.js";

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);

    await logAction({
      user: req.user,
      action: "coupon_created",
      entityType: "Coupon",
      entityId: coupon._id,
      details: `Created coupon "${coupon.code}"`,
    });

    res.status(201).json({ success: true, message: "Coupon created", data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    await logAction({
      user: req.user,
      action: "coupon_deleted",
      entityType: "Coupon",
      entityId: coupon._id,
      details: `Deleted coupon "${coupon.code}"`,
    });

    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    coupon.active = !coupon.active;
    await coupon.save();

    await logAction({
      user: req.user,
      action: coupon.active ? "coupon_activated" : "coupon_deactivated",
      entityType: "Coupon",
      entityId: coupon._id,
      details: `Coupon "${coupon.code}" ${coupon.active ? "activated" : "deactivated"}`,
    });

    res.status(200).json({ success: true, message: "Coupon updated", data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    if (coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }

    if (orderAmount < coupon.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ${coupon.minimumOrder} required`,
      });
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }

    res.status(200).json({
      success: true,
      data: { code: coupon.code, discount, finalAmount: orderAmount - discount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};