import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a review
export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Check karein ke user ne ye product khareeda hai ya nahi (verified purchase)
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

    // Product ka average rating update karein
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      "rating.average": avgRating,
      "rating.count": allReviews.length,
    });

    res.status(201).json({ success: true, message: "Review added", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};