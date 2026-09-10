import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { logAction } from "../utils/auditLog.js";

const recalculateProductRating = async (productId) => {
  const approvedReviews = await Review.find({ product: productId, status: "approved" });
  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;

  await Product.findByIdAndUpdate(productId, {
    "rating.average": avgRating,
    "rating.count": approvedReviews.length,
  });
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: "approved" })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const hasPurchased = await Order.findOne({
      user: userId,
      "items.product": productId,
    });

    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
      verifiedPurchase: !!hasPurchased,
    });

    await recalculateProductRating(productId);

    res.status(201).json({ success: true, message: "Review added", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const moderateReview = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "hidden"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'hidden'",
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await recalculateProductRating(review.product);

    await logAction({
      user: req.user,
      action: `review_${status}`,
      entityType: "Review",
      entityId: review._id,
      details: `Review ${status}`,
    });

    res.status(200).json({ success: true, message: `Review ${status}`, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await recalculateProductRating(review.product);

    await logAction({
      user: req.user,
      action: "review_deleted",
      entityType: "Review",
      entityId: review._id,
      details: "Review deleted",
    });

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};