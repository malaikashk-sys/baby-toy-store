import Wishlist from "../models/wishlist.model.js";

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate("products");

    if (!wishlist) {
      return res.status(200).json({ success: true, data: { products: [] } });
    }

    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    const updated = await Wishlist.findOne({ user: req.user.id }).populate("products");
    res.status(200).json({ success: true, message: "Added to wishlist", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    const updated = await Wishlist.findOne({ user: req.user.id }).populate("products");
    res.status(200).json({ success: true, message: "Removed from wishlist", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};