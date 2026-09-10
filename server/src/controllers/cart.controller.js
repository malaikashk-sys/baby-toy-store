import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// Get user cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return res.status(200).json({ success: true, data: { items: [] } });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, size, color } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Agar product ke variants hain, to size/color select hona zaroori hai
    if (product.variants && product.variants.length > 0) {
      if (!size && !color) {
        return res.status(400).json({ success: false, message: "Please select a variant" });
      }

      const matchedVariant = product.variants.find(
        (v) => (v.size || null) === (size || null) && (v.color || null) === (color || null)
      );

      if (!matchedVariant) {
        return res.status(400).json({ success: false, message: "Selected variant not found" });
      }

      if (matchedVariant.stock < (quantity || 1)) {
        return res.status(400).json({ success: false, message: "Selected variant is out of stock" });
      }
    }

    const newItem = {
      product: productId,
      quantity: quantity || 1,
      variant: size || color ? { size, color } : undefined,
    };

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [newItem],
      });
    } else {
      // Same product + same variant ho to quantity badhao, warna nayi line item banao
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          (item.variant?.size || null) === (size || null) &&
          (item.variant?.color || null) === (color || null)
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity || 1;
      } else {
        cart.items.push(newItem);
      }

      await cart.save();
    }

    const updatedCart = await Cart.findOne({ user: userId }).populate("items.product");
    res.status(200).json({ success: true, message: "Cart updated successfully", data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { size, color } = req.query;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          (item.variant?.size || null) === (size || null) &&
          (item.variant?.color || null) === (color || null)
        )
    );

    await cart.save();
    const updatedCart = await Cart.findOne({ user: userId }).populate("items.product");

    res.status(200).json({ success: true, message: "Item removed from cart", data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quantity of an item in cart
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity, size, color } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        (item.variant?.size || null) === (size || null) &&
        (item.variant?.color || null) === (color || null)
    );
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate("items.product");
    res.status(200).json({ success: true, message: "Quantity updated", data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};