import Coupon from "../models/coupon.model.js";

// Create a coupon (admin use, for now open)
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, message: "Coupon created", data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Validate a coupon against an order amount
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